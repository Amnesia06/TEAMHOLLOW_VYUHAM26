-- Pathwise PostgreSQL / Supabase Initial Schema Migration
-- Enables pgvector extension, establishes foreign keys, and configures Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table (Supports guest mode demo users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default demo guest user
INSERT INTO users (id, email, full_name, is_guest)
VALUES ('00000000-0000-0000-0000-000000000001', 'guest@pathwise.ai', 'Demo Student', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    interests TEXT[] DEFAULT '{}',
    career_goals TEXT[] DEFAULT '{}',
    learning_preferences JSONB DEFAULT '{"hours_per_week": 5, "budget_monthly": 0}'::jsonb,
    completeness NUMERIC(3, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Conversations and Chat Messages
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Career Exploration',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    ui_components JSONB DEFAULT '[]'::jsonb,
    agent_activity JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Standardized Skills and User Skills Evidence
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',
    prerequisites TEXT[] DEFAULT '{}',
    embedding vector(1536)
);

CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency TEXT DEFAULT 'beginner',
    is_inferred BOOLEAN DEFAULT FALSE,
    confidence TEXT DEFAULT 'medium',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_skill_id UUID REFERENCES user_skills(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL, -- 'project', 'education', 'certification', 'self_reported'
    description TEXT NOT NULL,
    confidence TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Career Roles and Market Snapshots
CREATE TABLE IF NOT EXISTS career_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    salary_range TEXT,
    growth_outlook TEXT,
    data_source TEXT,
    collected_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS job_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id TEXT REFERENCES career_roles(role_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    importance TEXT DEFAULT 'required', -- 'required', 'preferred', 'emerging'
    min_proficiency TEXT DEFAULT 'intermediate',
    weight NUMERIC(3, 2) DEFAULT 1.0
);

-- 6. Roadmaps and Milestones
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    total_estimated_weeks NUMERIC(5, 1),
    total_estimated_cost NUMERIC(8, 2),
    feasibility JSONB,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    skills_covered TEXT[],
    estimated_hours NUMERIC(5, 1),
    estimated_weeks NUMERIC(5, 1),
    estimated_cost NUMERIC(8, 2) DEFAULT 0.0,
    schedule_window TEXT,
    priority_explanation TEXT,
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    progress INT DEFAULT 0
);

-- 7. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    url TEXT NOT NULL,
    topic TEXT,
    skills TEXT[],
    cost NUMERIC(8, 2) DEFAULT 0.0,
    currency TEXT DEFAULT 'USD',
    difficulty TEXT,
    estimated_hours INT,
    prerequisites TEXT[],
    resource_type TEXT,
    last_verified DATE DEFAULT CURRENT_DATE
);

-- Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can access their conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can access their roadmaps" ON roadmaps
    FOR ALL USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000001');
