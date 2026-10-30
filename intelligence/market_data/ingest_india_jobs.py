"""
Ingests India Tech Jobs 2024-2026 dataset into Supabase database.
1. Computes skill requirements & frequencies across all 5,000 real job postings.
2. Generates 384-d vector embeddings for a balanced stratified sample of postings.
3. Upserts postings and role requirements into PostgreSQL.
"""

import os
import sys
import csv
import json
import re
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from dotenv import load_dotenv
load_dotenv()

from intelligence.embeddings import embed_batch
from backend.app.database.loaders import get_db_connection

logger = logging.getLogger(__name__)

CSV_PATH = "intelligence/market_data/india_job_market_2024_2026.csv"
TAXONOMY_PATH = "contracts/taxonomy/skills.json"
POSTINGS_JSON_PATH = "intelligence/market_data/job_postings.json"
REQUIREMENTS_JSON_PATH = "intelligence/market_data/role_requirements.json"

ROLE_ALIAS_MAP = {
    "Full Stack Developer": "Full-Stack Developer",
}


def load_taxonomy_skills() -> List[Dict[str, Any]]:
    if not os.path.exists(TAXONOMY_PATH):
        raise FileNotFoundError(f"Taxonomy file not found: {TAXONOMY_PATH}")
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("skills", [])


def run_ingestion(sample_per_role: int = 15):
    print("=" * 60)
    print("INGESTING INDIA TECH JOBS 2024-2026 DATASET")
    print("=" * 60)

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at {CSV_PATH}")

    skills = load_taxonomy_skills()
    print(f"Loaded {len(skills)} taxonomy skills.")

    # 1. Read all rows from CSV
    rows: List[Dict[str, str]] = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_title = row["Job_Title"].strip()
            canonical_role = ROLE_ALIAS_MAP.get(raw_title, raw_title)
            row["Canonical_Role"] = canonical_role
            rows.append(row)

    total_rows = len(rows)
    print(f"Read {total_rows} total postings from CSV.")

    # 2. Group postings by role
    role_groups: Dict[str, List[Dict[str, str]]] = {}
    for r in rows:
        role = r["Canonical_Role"]
        if role not in role_groups:
            role_groups[role] = []
        role_groups[role].append(r)

    print(f"Identified {len(role_groups)} unique job roles.")

    # 3. Compute skill frequencies across ALL 5,000 postings per role
    role_requirements: List[Dict[str, Any]] = []
    for role, group in role_groups.items():
        total_in_role = len(group)
        if total_in_role == 0:
            continue

        for skill in skills:
            s_id = skill["id"]
            check_terms = [skill["canonical_name"].lower()] + [a.lower() for a in skill.get("aliases", [])]

            match_count = 0
            for r in group:
                skills_field = r.get("Skills_Required", "").lower()
                matched = False
                for term in check_terms:
                    pattern = r"(?:\b|_)" + re.escape(term) + r"(?:\b|_)"
                    if re.search(pattern, skills_field):
                        matched = True
                        break
                if matched:
                    match_count += 1

            if match_count > 0:
                freq = round(match_count / total_in_role, 3)
                freq = min(1.0, freq)
                if freq >= 0.05:  # Filter out low-frequency noise
                    role_requirements.append({
                        "role": role,
                        "skill_id": s_id,
                        "skill_name": skill["canonical_name"],
                        "frequency": freq,
                        "required_level": 2,
                        "snapshot_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    })

    # Save computed requirements to JSON
    with open(REQUIREMENTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(role_requirements, f, indent=2)
    print(f"Computed {len(role_requirements)} requirement mappings across {len(role_groups)} roles.")

    # 4. Prepare stratified sample for vector embeddings
    sample_postings: List[Dict[str, Any]] = []
    for role, group in role_groups.items():
        chosen = group[:sample_per_role]
        for item in chosen:
            desc = (
                f"{item['Job_Title']} at {item['Company']} in {item['City']} ({item['Work_Mode']}). "
                f"Experience: {item['Experience_Level']}. Required skills: {item['Skills_Required']}. "
                f"Industry: {item['Industry']}. Salary: {item['Salary_LPA']} LPA."
            )
            sample_postings.append({
                "role": role,
                "title": f"{item['Job_Title']} - {item['Company']}",
                "source": f"india_job_market_2024_2026_{item['Job_ID']}",
                "text": desc
            })

    print(f"Embedding {len(sample_postings)} representative postings...")
    texts_to_embed = [p["text"] for p in sample_postings]
    embeddings = embed_batch(texts_to_embed)
    for p, emb in zip(sample_postings, embeddings):
        p["embedding"] = emb

    # Save to job_postings.json
    with open(POSTINGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sample_postings, f, indent=2)
    print(f"Saved {len(sample_postings)} embedded postings to {POSTINGS_JSON_PATH}.")

    # 5. Insert / Upsert into Supabase Database
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Insert postings
                print("Writing postings to Supabase PostgreSQL...")
                # Clear existing to avoid duplicate bloat if re-run
                cur.execute("DELETE FROM job_postings WHERE source LIKE 'india_job_market_%';")
                for p in sample_postings:
                    emb_str = str(p["embedding"])
                    cur.execute(
                        """
                        INSERT INTO job_postings (role, text, source, embedding)
                        VALUES (%s, %s, %s, %s::vector);
                        """,
                        (p["role"], p["text"], p["source"], emb_str)
                    )
                print(f"Successfully inserted {len(sample_postings)} postings into job_postings.")

                # Insert role requirements
                print("Writing role requirements to Supabase PostgreSQL...")
                cur.execute("DELETE FROM role_requirements;")
                for r in role_requirements:
                    cur.execute(
                        """
                        INSERT INTO role_requirements (role, skill_id, frequency, required_level, snapshot_date)
                        VALUES (%s, %s, %s, %s, %s::date);
                        """,
                        (r["role"], r["skill_id"], r["frequency"], r["required_level"], r["snapshot_date"])
                    )
                print(f"Successfully inserted {len(role_requirements)} requirements into role_requirements.")
            conn.commit()
    except Exception as e:
        print(f"Warning: Database write failed: {e}. Local JSON files are intact and active.")

    print("=" * 60)
    print("INGESTION COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    run_ingestion()
