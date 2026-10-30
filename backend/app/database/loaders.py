"""
Database Loaders for Pathwise (Track 2: Backend).
Populates Supabase PostgreSQL tables with seed data:
- skills_taxonomy
- courses
- job_postings
- role_requirements
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import psycopg

load_dotenv()
logger = logging.getLogger(__name__)


def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL not configured in environment.")
    return psycopg.connect(db_url, autocommit=True)


def load_skills_taxonomy(taxonomy_file: str = "contracts/taxonomy/skills.json") -> int:
    """Loads taxonomy skills into skills_taxonomy table."""
    if not os.path.exists(taxonomy_file):
        raise FileNotFoundError(f"Taxonomy file not found: {taxonomy_file}")

    with open(taxonomy_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    skills = data.get("skills", [])

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            count = 0
            for s in skills:
                embedding_val = s.get("embedding")
                # PostgreSQL pgvector accepts string representation '[x, y, ...]'
                emb_str = str(embedding_val) if embedding_val else None
                cur.execute(
                    """
                    INSERT INTO skills_taxonomy (id, canonical_name, aliases, category, embedding)
                    VALUES (%s, %s, %s, %s, %s::vector)
                    ON CONFLICT (id) DO UPDATE SET
                        canonical_name = EXCLUDED.canonical_name,
                        aliases = EXCLUDED.aliases,
                        category = EXCLUDED.category,
                        embedding = COALESCE(EXCLUDED.embedding, skills_taxonomy.embedding);
                    """,
                    (s["id"], s["canonical_name"], s.get("aliases", []), s.get("category", "General"), emb_str)
                )
                count += 1
    print(f"[LOADER] Loaded {count} skills into skills_taxonomy.")
    return count


def load_courses(catalog_file: str = "backend/app/catalog/learning_resources.json") -> int:
    """Loads courses catalog into courses table."""
    if not os.path.exists(catalog_file):
        raise FileNotFoundError(f"Catalog file not found: {catalog_file}")

    with open(catalog_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    courses = data.get("resources", [])

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            count = 0
            for c in courses:
                cur.execute(
                    """
                    INSERT INTO courses (
                        id, title, platform, url, cost, currency, hours, level,
                        skills_covered, prerequisite_skills, verified
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        platform = EXCLUDED.platform,
                        url = EXCLUDED.url,
                        cost = EXCLUDED.cost,
                        currency = EXCLUDED.currency,
                        hours = EXCLUDED.hours,
                        level = EXCLUDED.level,
                        skills_covered = EXCLUDED.skills_covered,
                        prerequisite_skills = EXCLUDED.prerequisite_skills,
                        verified = EXCLUDED.verified;
                    """,
                    (
                        c["id"], c["title"], c["platform"], c["url"],
                        c.get("cost", 0.0), c.get("currency", "USD"),
                        c["hours"], c.get("level", 1),
                        c.get("skills_covered", []), c.get("prerequisite_skills", []),
                        c.get("verified", False)
                    )
                )
                count += 1
    print(f"[LOADER] Loaded {count} courses into courses table.")
    return count


def load_job_postings(postings_file: str = "intelligence/market_data/job_postings.json") -> int:
    """Loads cleaned job postings into job_postings table."""
    if not os.path.exists(postings_file):
        print(f"[LOADER WARNING] Job postings file not found: {postings_file}. Skipping.")
        return 0

    with open(postings_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    postings = data if isinstance(data, list) else data.get("postings", [])

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            count = 0
            for p in postings:
                emb_str = str(p.get("embedding")) if p.get("embedding") else None
                cur.execute(
                    """
                    INSERT INTO job_postings (role, text, source, embedding)
                    VALUES (%s, %s, %s, %s::vector);
                    """,
                    (p["role"], p["text"], p.get("source", "baseline_dataset"), emb_str)
                )
                count += 1
    print(f"[LOADER] Loaded {count} postings into job_postings.")
    return count


def load_role_requirements(requirements_file: str = "intelligence/market_data/role_requirements.json") -> int:
    """Loads role requirements into role_requirements table."""
    if not os.path.exists(requirements_file):
        print(f"[LOADER WARNING] Role requirements file not found: {requirements_file}. Skipping.")
        return 0

    with open(requirements_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    reqs = data if isinstance(data, list) else data.get("requirements", [])

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            count = 0
            for r in reqs:
                cur.execute(
                    """
                    INSERT INTO role_requirements (role, skill_id, frequency, required_level)
                    VALUES (%s, %s, %s, %s);
                    """,
                    (r["role"], r["skill_id"], r["frequency"], r.get("required_level", 2))
                )
                count += 1
    print(f"[LOADER] Loaded {count} requirements into role_requirements.")
    return count


def load_all():
    print("=" * 60)
    print("RUNNING SUPABASE DATA LOADERS")
    print("=" * 60)
    c_tax = load_skills_taxonomy()
    c_crs = load_courses()
    c_pst = load_job_postings()
    c_req = load_role_requirements()
    print("=" * 60)
    print(f"SUMMARY: Taxonomy={c_tax}, Courses={c_crs}, Postings={c_pst}, Requirements={c_req}")
    print("=" * 60)


if __name__ == "__main__":
    load_all()

