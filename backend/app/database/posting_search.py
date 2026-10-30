"""
Database-backed Job Posting Search implementing JobPostingSearchInterface.
Queries Supabase PostgreSQL pgvector or falls back to local JSON cache.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from intelligence.interfaces import JobPostingSearchInterface
from backend.app.database.loaders import get_db_connection

logger = logging.getLogger(__name__)


class SupabasePostingSearch(JobPostingSearchInterface):
    """Searches job_postings table using pgvector cosine distance or role matching."""

    def __init__(self, local_json_path: str = "intelligence/market_data/job_postings.json"):
        self.local_json_path = local_json_path
        self._local_postings: Optional[List[Dict[str, Any]]] = None

    def search_postings(
        self,
        role: str,
        query_vector: List[float],
        top_k: int = 15
    ) -> List[Dict[str, Any]]:
        # 1. Try Supabase PostgreSQL
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    if query_vector and len(query_vector) == 384:
                        cur.execute(
                            """
                            SELECT role, text, source, retrieved_at
                            FROM job_postings
                            WHERE role ILIKE %s OR text ILIKE %s
                            ORDER BY embedding <=> %s::vector
                            LIMIT %s;
                            """,
                            (f"%{role}%", f"%{role}%", str(query_vector), top_k)
                        )
                    else:
                        cur.execute(
                            """
                            SELECT role, text, source, retrieved_at
                            FROM job_postings
                            WHERE role ILIKE %s OR text ILIKE %s
                            LIMIT %s;
                            """,
                            (f"%{role}%", f"%{role}%", top_k)
                        )
                    rows = cur.fetchall()
                    if rows:
                        results = []
                        for r in rows:
                            results.append({
                                "role": r[0],
                                "text": r[1],
                                "source": r[2],
                                "retrieved_at": str(r[3]) if r[3] else None
                            })
                        return results
        except Exception as e:
            logger.warning(f"Database search failed ({e}). Falling back to local postings cache.")

        # 2. Local JSON fallback
        if self._local_postings is None:
            if os.path.exists(self.local_json_path):
                with open(self.local_json_path, "r", encoding="utf-8") as f:
                    self._local_postings = json.load(f)
            else:
                self._local_postings = []

        role_lower = role.lower()
        matched = [
            p for p in self._local_postings
            if role_lower in p.get("role", "").lower() or role_lower in p.get("text", "").lower()
        ]
        return matched[:top_k]

