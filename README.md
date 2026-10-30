# PATHWISE — AI-Powered Career and Skill-Gap Analysis Agent

> **VYUHAM 2026 Hackathon**  
> **Team: TEAMHOLLOW_VYUHAM26**  
> - **Team Leader:** Rohan Tiwari (Full-Stack Engineer & Architect)  
> - **Member 2:** Adhwaith (Backend & Multi-Agent Orchestration)  
> - **Member 3:** Sankalp (AI Intelligence & Data Systems)  

---

## 1. Problem Statement & Solution

### The Challenge
Learners and professionals often struggle to map their current capabilities to suitable roles, identify meaningful skill gaps, and choose practical learning paths among rapidly changing job requirements.

### The Pathwise Solution
Pathwise is an AI-powered career intelligence platform built around a single core philosophy: **Complex intelligence behind a minimal interface.**

Instead of requiring users to fill out tedious forms, Pathwise begins with an elegant chat bar. Through natural dialogue, specialized multi-agent AI systems:
1. **Extract & Verify Capabilities:** Incrementally constructs a structured profile with evidence provenance.
2. **Discover Transferable Skills:** Maps underlying competencies (e.g. A* path planning on a rover $\to$ graph algorithms & mathematical optimization).
3. **Analyze Job Market Requirements:** Evaluates capabilities against curated market datasets with transparent scoring (no fabricated percentages).
4. **Optimize Constraint-Aware Roadmaps:** Employs deterministic Python graph algorithms (topological sorting over prerequisite DAGs) respecting hard budget constraints ($\$0$ / month) and weekly availability (e.g. $5\text{ hrs/week}$).
5. **Recommend Verified Resources:** Direct links to $100\%$ free courses, official documentation, and practical projects from freeCodeCamp, Scikit-learn, PyTorch, MIT OCW, 3Blue1Brown, and ROS.

---

## 2. Monorepo Architecture

Pathwise is structured as a unified monorepo with three primary team-owned boundaries:

```text
PATHWISE/
├── frontend/                 # MEMBER 1: Next.js 14, React, Tailwind CSS, Lucide
│   ├── app/                  # App router (/, /chat, /profile, /careers, /roadmap, /resources)
│   ├── components/           # UI components, layout, chat bar, cards
│   ├── features/             # Profile dashboard, career explorer, roadmap view, resource catalog
│   ├── hooks/                # useChat, useProfile custom hooks
│   └── lib/                  # API client, TypeScript contracts, utilities
│
├── backend/                  # MEMBER 2: FastAPI, LangGraph, Supabase/In-Memory DB
│   ├── app/
│   │   ├── api/              # Versioned endpoints (/health, /chat, /profile, /careers, /roadmap, /resources)
│   │   ├── core/             # Config, LLM provider abstraction, exceptions
│   │   ├── database/         # Supabase client + local in-memory fallback, migrations
│   │   ├── graph/            # Multi-agent graph orchestrator
│   │   ├── schemas/          # Authoritative Pydantic models (API contract)
│   │   ├── services/         # Business logic services
│   │   └── main.py           # FastAPI entry point
│   └── tests/                # TestClient API and schema tests
│
├── intelligence/             # MEMBER 3: Core AI intelligence package
│   ├── agents/               # ProfileAgent, SkillAgent, MarketAgent, RoadmapAgent, CoachAgent
│   ├── market_data/          # Curated tech role requirements catalog & loader
│   ├── prompts/              # Structured prompt templates
│   ├── resources/            # Verified learning materials catalog & query engine
│   ├── roadmap/              # Prerequisite DAG topological optimizer & constraint scheduler
│   ├── skills/               # 80+ skill taxonomy & transferable competency mapper
│   ├── evaluation/           # Benchmark & constraint validator
│   └── tests/                # Deterministic logic & agent unit tests
│
├── docs/                     # Shared API contracts (API_CONTRACT.md)
├── .env.example              # Environment variables template
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Complete documentation
```

---

## 3. Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **AI / LLM:** Provider abstraction supporting **Google Gemini** (`gemini-1.5-pro`) and **Anthropic Claude** (`claude-3-5-sonnet`), with automatic fallback to **Demo Mode** for zero-setup offline judging.
- **Database:** Supabase / PostgreSQL with `pgvector` extension; includes an automatic in-memory datastore when Supabase keys are not present.
- **Orchestration:** Multi-agent state graph pipeline coordinating 5 specialized agents.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher and npm

### Step 1: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, `DEMO_MODE=true` is enabled, allowing immediate testing without external API keys!)*

### Step 2: Backend Setup & Execution
In a terminal:
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will be live at:
- **API Base:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### Step 3: Frontend Setup & Execution
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running with Docker Compose
```bash
docker-compose up --build
```

---

## 5. Running the Test Suite

Run backend and intelligence tests:
```bash
# Test intelligence agents and deterministic roadmap optimizer
pytest intelligence/tests -v

# Test backend API endpoints and schema validation
pytest backend/tests -v
```

---

## 6. Official Demonstration Scenario Walkthrough

Test the complete end-to-end user scenario:

1. **Open Pathwise** at [http://localhost:3000](http://localhost:3000).
2. **In the central chat bar, type:**
   > *"I'm a computer science graduate interested in AI and robotics. I know Python and C++, and I have worked on an autonomous GPS rover project. What careers would suit me?"*
3. **Observe the Multi-Agent Flow:**
   - **Profile Agent:** Extracts CS degree, Python, C++, and the autonomous GPS rover project.
   - **Skill Intelligence Agent:** Infers transferable competencies in *Graph Algorithms* and *Optimization* from the A* waypoint navigation rover project.
   - **Market Intelligence Agent:** Evaluates market requirements and returns match scores for **Robotics Software Engineer** and **Machine Learning Engineer**, rendering a dynamic Career Recommendation Card in the chat.
4. **Ask a follow-up with hard constraints:**
   > *"I have only five hours per week and my budget is zero. Can you modify the roadmap?"*
5. **Observe the Roadmap Optimization Agent:**
   - Builds a prerequisite dependency DAG (ensuring math and graph foundations precede deep learning and ROS stacks).
   - Enforces the $\$0$ monthly budget by selecting $100\%$ free resources from *freeCodeCamp*, *PyTorch tutorials*, and *ROS 2 docs*.
   - Calculates the timeline at $5\text{ hrs/week}$ ($\approx 24\text{ weeks}$), outputting a scheduled milestone roadmap.
6. **Navigate via Sidebar:**
   - **My Profile:** View extracted skills with evidence indicators and edit constraints.
   - **Explore Careers:** Search role requirements, see salary ranges and market growth outlooks.
   - **My Roadmap:** Toggle completed milestones and inspect allocated learning materials.
   - **Resources:** Filter verified learning resources by difficulty and skill.
