-- =============================================================================
-- Pathwise PostgreSQL / Supabase Schema Migration (v2.0)
-- Conforms strictly to README Section 16.
-- Vector dimension: 384 (all-MiniLM-L6-v2)
-- Chat tables and mock guest inserts are excluded.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills Taxonomy Table (Embedding dimension 384)
CREATE TABLE IF NOT EXISTS skills_taxonomy (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Job Postings Table (Embedding dimension 384)
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    source TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    embedding vector(384)
);

-- 4. Role Requirements Table
CREATE TABLE IF NOT EXISTS role_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    skill_id TEXT NOT NULL REFERENCES skills_taxonomy(id) ON DELETE CASCADE,
    frequency NUMERIC(4, 3) NOT NULL,
    required_level INT NOT NULL CHECK (required_level >= 0 AND required_level <= 3),
    snapshot_date DATE DEFAULT CURRENT_DATE
);

-- 5. Courses Catalog Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0.0,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'INR')),
    hours NUMERIC(6, 1) NOT NULL,
    level INT NOT NULL CHECK (level >= 1 AND level <= 3),
    skills_covered TEXT[] DEFAULT '{}',
    prerequisite_skills TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    years_of_experience NUMERIC(4, 1) DEFAULT 0.0,
    years_per_skill JSONB DEFAULT '{}'::jsonb,
    domain TEXT DEFAULT 'Software Engineering',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role TEXT,
    constraints JSONB NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Roadmap Progress Table
CREATE TABLE IF NOT EXISTS roadmap_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Market Snapshots Table
CREATE TABLE IF NOT EXISTS market_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    frequency NUMERIC(4, 3) NOT NULL,
    posting_count INT NOT NULL,
    snapshot_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_skills_taxonomy_embedding ON skills_taxonomy USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_job_postings_embedding ON job_postings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_job_postings_role ON job_postings(role);
CREATE INDEX IF NOT EXISTS idx_role_requirements_role ON role_requirements(role);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_role ON market_snapshots(role, snapshot_date);
