"""
Supabase client integration with transparent in-memory fallback for local/demo mode.
"""

import logging
from typing import Dict, List, Optional, Any
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseClient:
    """
    Manages persistent records in Supabase, or in-memory when Supabase is not configured.
    """

    def __init__(self):
        self.is_connected = False
        self._supabase = None
        self._memory_db: Dict[str, Dict[str, Any]] = {
            "users": {},
            "profiles": {},
            "conversations": {},
            "messages": {},
            "roadmaps": {},
            "resources": {}
        }
        self._init_connection()

    def _init_connection(self):
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                from supabase import create_client
                self._supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                self.is_connected = True
                logger.info("Connected successfully to Supabase database.")
            except Exception as e:
                logger.warning(f"Supabase connection failed ({e}). Using in-memory store.")
                self.is_connected = False
        else:
            logger.info("No Supabase credentials provided; utilizing in-memory datastore.")

    # Generic KV helpers for in-memory / demo persistence
    def save_item(self, table: str, key: str, value: Any) -> None:
        if table not in self._memory_db:
            self._memory_db[table] = {}
        self._memory_db[table][key] = value

    def get_item(self, table: str, key: str) -> Optional[Any]:
        return self._memory_db.get(table, {}).get(key)

    def list_items(self, table: str) -> List[Any]:
        return list(self._memory_db.get(table, {}).values())

    def update_item(self, table: str, key: str, updates: Dict[str, Any]) -> Optional[Any]:
        if table in self._memory_db and key in self._memory_db[table]:
            if isinstance(self._memory_db[table][key], dict):
                self._memory_db[table][key].update(updates)
                return self._memory_db[table][key]
        return None


db_client = DatabaseClient()
