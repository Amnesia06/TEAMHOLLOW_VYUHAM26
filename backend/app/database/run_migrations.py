"""
Migration Runner for Pathwise Supabase Database (Track 2: Backend).
Executes SQL migration files using DATABASE_URL.
"""

import os
import sys
from dotenv import load_dotenv
import psycopg

load_dotenv()


def run_migrations(migration_file: str = "backend/app/database/migrations/001_initial_schema.sql"):
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL is not set in environment (.env). BLOCKED.")
        return False

    if not os.path.exists(migration_file):
        print(f"[ERROR] Migration file not found: {migration_file}")
        return False

    with open(migration_file, "r", encoding="utf-8") as f:
        sql = f.read()

    print(f"Connecting to database to execute {migration_file}...")
    try:
        conn = psycopg.connect(db_url, autocommit=True)
        with conn.cursor() as cur:
            # First ensure vector extension exists
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
            # Execute migration sql
            cur.execute(sql)
            print("[SUCCESS] Migrations executed successfully!")

            # Verify tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cur.fetchall()]
            print("Public tables in database:", tables)

        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] Migration execution failed: {e}")
        return False


if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1)

