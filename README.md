# PATHWISE: AI-Powered Career and Skill-Gap Analysis Agent

> **VYUHAM 2026 Hackathon, Team TEAMHOLLOW_VYUHAM26**
> Team Leader: Rohan Tiwari (Full-Stack Engineer & Architect). Member 2: Adhwaith (Backend & Multi-Agent Orchestration). Member 3: Sankalp (AI Intelligence & Data Systems).

Development plan and technical specification. This replaces the earlier chat-first design. The repository is reworked completely to this plan, organized as three tracks: **frontend**, **backend**, **intelligence**.

Challenge: **AF-03, AI-Powered Career and Skill-Gap Analysis Agent.**
Build an agent that analyzes a user's skills and experience, compares them with role requirements, identifies missing competencies, and creates a prioritized development roadmap. Recommendations must account for learning time, cost, prerequisites, transferable skills, and changing job-market signals, and must explain why each path is suggested.

---

## 1. How to use this document

- This file is the single source of truth. When code and this file disagree, this file wins.
- Sections 2 to 4 say what is built and why. Section 5 says what happens to the existing code. Sections 6 to 10 are the structure, interfaces, contracts, and logic. Sections 11 to 14 are the three track specifications. Sections 15 to 24 cover API, database, stack, environment, execution, phases, tests, risks, demo, and definition of done.
- Every module has an ID (M0 to M15) and a tier (P0, P1, P2). Build in tier order within each track. A lower tier starts only when the tier above it works.
- No feature is cut. P2 items are built last.
- Timeline is expressed as phases with gates, not dates.

---

## 2. Requirement traceability

| AF-03 requirement | Module(s) | Track | How it is satisfied |
|---|---|---|---|
| Analyze user skills and experience | M1 | Intelligence | Resume parsed to canonical skills with proficiency levels |
| Compare with role requirements | M2, M3 | Intelligence | Job requirements retrieved, matched skill by skill |
| Identify missing competencies | M3 | Intelligence | Gap list with priority scores |
| Prioritized development roadmap | M3, M4 | Intelligence, Backend | Ordered by priority score, then by prerequisites |
| Learning time | M4, M5 | Backend | Course hours divided by weekly hours, timeline verified |
| Cost | M4, M5, M13 | Backend | Free-first bundle selection under budget |
| Prerequisites | M4, M9 | Backend | Prerequisite graph with topological ordering |
| Transferable skills | M3 | Intelligence | Partial-similarity matches reduce gap priority |
| Changing job-market signals | M8 | Intelligence | Timestamped market snapshots, rising and declining skills |
| Explain why each path is suggested | M6 | Intelligence | Every roadmap item has an evidence-based reason |
| Map capabilities to suitable roles | M7 | Intelligence | Role ranking when the user has no target role |
| User-facing experience of all the above | M11, M12 UI, M15 | Frontend | Forms, results, trends, progress, quizzes |

---

## 3. Agentic theme alignment

| Agentic property | Where it is demonstrated |
|---|---|
| Autonomy | M2 decides on its own when cached data is insufficient and goes to live search |
| Planning | M4 builds a sequenced plan under constraints |
| Tool use | pgvector retrieval, Tavily web search, course catalog lookup, Supabase |
| Self-correction | M5 rejects invalid plans and sends them back to M4 |
| Memory and adaptation | M10 stores state and replans when progress or constraints change |
| Specialized agents | M1, M2, M3, M6, M7 each own one task with defined inputs and outputs |
| Shared state and orchestration | M0 LangGraph graph with conditional edges |

Design principle: **the LLM handles language tasks (extraction, classification, explanation). Deterministic code handles anything that must be correct (scoring, ordering, budget, time, verification).** The LLM never computes the roadmap.

---

## 4. Honest technique list

| Component | Technique | Type |
|---|---|---|
| Resume to profile | Prompted structured extraction (zero-shot or few-shot) | LLM |
| Proficiency level per skill | Zero-shot LLM classification (levels 0 to 3) | LLM |
| Skill normalization and matching | Embeddings plus cosine similarity with thresholds | Embedding-based |
| Job requirement retrieval | Dense vector search (pgvector), RAG with live-search fallback | Retrieval |
| Role suitability ranking | Similarity-based scoring across roles | Embedding-based |
| Gap prioritization | Frequency weighting multiplied by gap size | Classical scoring |
| Roadmap sequencing | Prerequisite graph with topological sort | Classical (graph) |
| Course bundle selection | Knapsack-style constrained optimization | Classical (optimization) |
| Plan validation | Verifier loop returning plans to the Planner | Agentic control flow |
| Explanations | LLM generation grounded only in computed data | LLM |
| Market trend detection | Skill frequency comparison between timestamped snapshots | Classical |

Statement to use: *"Pretrained LLM and embedding models for extraction, matching, and explanation; classical scoring, graph sequencing, and constraint optimization for planning; an agentic verification loop for correctness. No custom model was trained."*

Do not claim trained classifiers, fine-tuning, or custom ML. None exist in this project.

---

## 5. Starting point: what exists and what happens to it

The repository already contains a first version (a chat-first app). It is **reworked completely**. Everything not needed by this plan is removed. The first action in the rework is an audit (Phase A, section 20), which lists every file with a decision before anything is deleted.

### 5.1 Decisions already made

| Topic | Decision |
|---|---|
| Frontend framework | **Vite + React (TypeScript) + Tailwind CSS.** Next.js is removed entirely |
| Frontend style | Form-based input and results views, not a chat interface |
| Python environment | One virtual environment at `backend/.venv`, used by both backend and intelligence |
| Product name | Pathwise (existing repo name) |
| LLM provider | Gemini only. The Anthropic provider is removed |
| Demo mode | Removed. No mock LLM responses at runtime |
| Embeddings | `all-MiniLM-L6-v2`, local, vector size 384 |
| API response envelope | Keep the existing envelope (success, data, error, metadata) and error codes, moved into `contracts/api/` |

### 5.2 Existing code and its fate (known from the first audit of the zip)

| Existing item | Fate |
|---|---|
| `frontend/` (Next.js 14: app router pages, chat components, features, hooks) | **Deleted and rebuilt with Vite.** May be used only as a visual reference. UI primitives (button, card, badge, progress bar) and Tailwind design tokens may be reused after conversion |
| `frontend/` chat UI (`ChatInput`, `ChatMessage`, `ChatWindow`, `ExamplePrompts`, `useChat`) | Removed, not in the plan |
| `backend/app/api/chat.py`, `services/chat_service.py`, `schemas/chat.py`, `conversations` and `messages` tables | Removed |
| `backend/app/core/llm_provider.py` (Gemini plus Anthropic plus mock responses, default `gemini-1.5-pro-latest`) | Removed from backend. Replaced by the Gemini client in `intelligence/` (Gemini only, no mock fallback, models from config) |
| `backend/app/core/config.py` (`DEMO_MODE`, `LLM_PROVIDER`, Anthropic keys, `SECRET_KEY` default) | Reworked. Secrets and URLs only, per section 18 |
| `backend/app/database/supabase_client.py` with in-memory fallback | Reworked. No silent in-memory fallback at runtime. An in-memory fake may exist for tests only |
| `backend/app/database/migrations/001_initial_schema.sql` (vector 1536, chat tables, guest user insert) | Replaced by migrations matching section 16, with vector size 384 |
| `backend/app/graph/workflow.py` (keyword routing on message text, hardcoded 5 hours and budget 0, canned insight text) | Replaced. The graph moves to `intelligence/` as M0, with no hardcoded constraints and no keyword routing |
| `backend/app/schemas/` | Reworked into the contracts in section 8, moved to `contracts/schemas/` |
| `backend/app/services/` | Reworked to match the new endpoints |
| `intelligence/agents/profile_agent.py` | Becomes M1 |
| `intelligence/agents/market_agent.py` | Becomes M2 and M7 |
| `intelligence/agents/skill_agent.py` | Folded into M3 (embedding-based transferable skills) |
| `intelligence/agents/roadmap_agent.py`, `coach_agent.py` | Removed. Roadmaps are never produced by an LLM. Coach logic may be reused for M12 quiz generation if it fits |
| `intelligence/roadmap/optimizer.py`, `scheduler.py` | **Moved to `backend/` as M4**, rewritten to section 9. The existing fallback that invents "Machine Learning Fundamentals" when no gaps exist, and the fallback that attaches any free resource when none matches, are removed |
| `intelligence/skills/taxonomy.py`, `mapper.py` | Replaced by the taxonomy file in `contracts/taxonomy/` and embedding-based mapping. Existing skill names and prerequisite data may seed the new taxonomy and course prerequisites, marked unverified |
| `intelligence/market_data/job_roles.json` | Seed only. It lists required skills per role, but frequency scoring needs real job posting text, so a postings dataset is still required (section 10) |
| `intelligence/resources/learning_resources.json`, `database.py` | Seed for the course catalog (M9). Every entry is treated as **unverified** until its URL, cost, and duration are actually checked. Existing `last_verified` values are not trusted |
| `intelligence/prompts/` | Reworked to the new agents. Kept only where it fits |
| `intelligence/evaluation/` | Removed unless needed by the acceptance tests in section 22 |
| `docs/API_CONTRACT.md` | Replaced by `contracts/api/`. Folder removed |
| `docker-compose.yml` | Removed (the referenced Dockerfiles do not exist and Docker is not in the plan) |
| `.env.example`, `.gitignore` | Rewritten for the new structure (section 18) |
| Existing tests | Kept only where they still apply. Rewritten otherwise |

If the audit finds items not listed here, the audit report proposes a decision for each, and nothing is deleted until the project owner approves the report.

---

## 6. Repository layout, ownership, and the three-track rule

### 6.1 Target layout

```
pathwise/
  README.md                  (this file)
  .env.example               (variable names only, no values)
  .gitignore
  contracts/                 (SHARED, read-only for tracks, see 6.4)
    schemas/                 (typed schemas for every contract in section 8)
    examples/                (sample JSON for every schema, used for mocks and tests)
    taxonomy/                (skills taxonomy, one for all tracks)
    api/                     (API specification: endpoints, envelope, errors)
  frontend/                  (Track 1: Vite + React + TypeScript + Tailwind)
    .env.example
  backend/                   (Track 2: FastAPI, database, deterministic logic)
    .venv/                   (git-ignored, the single Python environment)
    requirements.txt
  intelligence/              (Track 3: agents, LLM, embeddings, search, graph)
    requirements.txt
```

### 6.2 Folder ownership

| Folder | Owner | Others may |
|---|---|---|
| `frontend/` | Frontend track | Read only |
| `backend/` | Backend track | Read only |
| `intelligence/` | Intelligence track | Read only |
| `contracts/` | Shared | Change only through the contract change process (6.4) |

### 6.3 Python environment

- One virtual environment at `backend/.venv`, created once.
- `backend/requirements.txt` and `intelligence/requirements.txt` are both installed into it. Each track lists only its own dependencies.
- The backend is started from the repository root so that `backend`, `intelligence`, and `contracts` all import as top-level packages.
- The frontend has its own `package.json` and `node_modules`. Node 20 LTS.

### 6.4 Contract change process

`contracts/` is the only shared folder.

1. Propose the change on a branch named `contracts/<short-description>`, with the updated schema and example.
2. All tracks approve (all three people, or the project owner when one agent is building).
3. Merge, then every track pulls it immediately.
4. After Phase 0, contract changes should be rare and announced before being made.

### 6.5 Branches

- `main` is the integration branch. It always runs.
- When three people work in parallel: branches `frontend`, `backend`, `intelligence`, each committing only in their own folder, merging to `main` by pull request at every phase gate.
- When one agent builds everything (section 19): a single branch `rework`, commits grouped by track folder, merged to `main` by the project owner after each phase gate.
- A commit touching files outside its own track's folder is rejected in review, except contract changes.

---

## 7. How the tracks connect without touching each other

### 7.1 Dependency direction
- **Backend imports intelligence. Intelligence never imports backend. Frontend talks to backend only over HTTP.**
- Both backend and intelligence import `contracts`.

### 7.2 Intelligence exposes a small public interface

| Operation | Purpose |
|---|---|
| Run analysis | Executes the full graph: profile, requirements, gaps, plan, verification, explanation |
| Suggest roles | Ranks suitable roles for a profile (M7) |
| Replan | Re-runs the graph from the gap stage with changed progress or constraints |
| Generate quiz | Produces a quiz for a completed roadmap item (M12) |
| Refresh market snapshot | Fetches fresh data and produces a snapshot (M8) |

Each operation accepts an event callback so the backend can stream per-agent progress to the frontend.

### 7.3 Intelligence receives its dependencies from the backend

| Interface defined by intelligence | Implemented by backend |
|---|---|
| Planner (M4) | Backend planner |
| Verifier (M5) | Backend verifier |
| Course lookup (M9) | Backend catalog access |
| Job posting search by vector | Backend database access |
| Taxonomy lookup by vector | Backend database access |
| Snapshot read and write | Backend database access |

Intelligence tests use fake implementations. Backend tests use a stub of intelligence returning `contracts/examples/` data.

### 7.4 Shared data artifacts
- The taxonomy lives in `contracts/taxonomy/`, owned by intelligence, used by backend (course skill ids) and frontend (display names).
- Intelligence produces cleaned job postings and embeddings as data files. Backend loads them into Supabase.
- Backend owns the course catalog and uses taxonomy skill ids only.

### 7.5 Frontend and backend
- Frontend calls only the endpoints in section 15.
- Frontend builds against a mock server serving `contracts/examples/` until the real endpoints exist. Switching to the real backend is a configuration change only.

---

## 8. Shared contracts

Defined in `contracts/schemas/` (Pydantic models are the source of truth for Python; the frontend mirrors them as TypeScript types) with an example JSON for each, and a test that validates every example against its schema. Signed off in Phase 0.

**Profile**
| Field | Description |
|---|---|
| skills | List of canonical skill id, name, proficiency level 0 to 3 |
| unmapped skills | Skills not found in the taxonomy, flagged |
| years of experience | Total, and per skill where available |
| domain | Industry or field |

**Role requirement**
| Field | Description |
|---|---|
| skill id and name | Canonical |
| frequency | 0 to 1 |
| required level | 0 to 3 |
| trend | rising, stable, declining, or unknown |
| source and timestamp | cache or live, with date |

**Gap**
| Field | Description |
|---|---|
| skill id and name | Canonical |
| gap size | 0 to 3 |
| frequency | 0 to 1 |
| transferable | true or false |
| supporting skill | Profile skill that supports the transfer, if any |
| trend | As above |
| priority score | Computed per section 9.5 |

**Course**
| Field | Description |
|---|---|
| id, title, platform, url | Identification |
| cost and currency | Zero for free |
| hours | Duration |
| level | 1 to 3 |
| skills covered | Taxonomy skill ids |
| prerequisite skills | Taxonomy skill ids |
| verified | true or false. Unverified entries must be flagged |

**User constraints**
| Field | Description |
|---|---|
| budget and currency | INR or USD |
| weekly hours | Hours available per week |
| target timeline | Weeks, optional |
| target role | Optional |

**Roadmap item**
| Field | Description |
|---|---|
| order | Position in sequence |
| course | Course reference |
| gaps covered | Gap references |
| start week and end week | Timeline |
| cost and hours | Item totals |
| added for prerequisite | true or false |
| explanation | Written by M6 |

**Roadmap**
| Field | Description |
|---|---|
| items | Ordered roadmap items |
| total cost and total hours | Totals |
| total weeks | Timeline |
| uncovered gaps | Gaps with reasons |
| verifier status | Pass, or violations flagged |

**Progress event** (streamed during analysis)
| Field | Description |
|---|---|
| step | Which agent or module is running |
| status | started, finished, failed, retrying |
| message | Short note, such as the reason for the live-search fallback |

---

## 9. Scoring and planning logic

All numeric values are starting values. Tune them on test resumes and record final values in the owning track's config file.

| Rule | Implemented in |
|---|---|
| 9.1 to 9.5 (levels, matching, frequency, gap size, priority) | Intelligence (M3) |
| 9.6 to 9.8 (bundle selection, ordering, timeline) | Backend (M4) |

### 9.1 Proficiency levels
0 = none, 1 = beginner, 2 = intermediate, 3 = advanced.

### 9.2 Skill matching
- Full match: cosine similarity at or above the full-match threshold (start at 0.80).
- Partial match (transferable): at or above the partial threshold (start at 0.60) and below the full-match threshold.
- No match: below the partial threshold.

### 9.3 Skill frequency
Number of retrieved postings that require the skill divided by the total number of retrieved postings.

### 9.4 Gap size
Required level minus current level, floored at zero. Required level is the most common level stated across postings (default 2 if postings do not state one).

### 9.5 Priority score
Priority = frequency × gap size × transfer factor × trend factor.
- Transfer factor: 1.0 for no match, 0.5 for a partial match.
- Trend factor: 1.2 for rising, 1.0 for stable, 0.9 for declining, 1.0 when unknown.

### 9.6 Bundle selection (backend)
- Candidate set: courses that cover at least one gap.
- Objective: maximize the sum of priority scores of covered gaps.
- Constraints: total cost at most the budget; total hours at most weekly hours multiplied by target weeks when a target timeline is given.
- Preference: among equal-coverage bundles, lowest cost, with zero-cost courses taken first.
- Plain deterministic knapsack-style selection.
- Gaps that cannot be covered are returned as uncovered with a reason, never silently dropped. No invented gaps and no unrelated courses are ever added to fill a plan.

### 9.7 Ordering (backend)
- A course depends on the skills listed as its prerequisites.
- If a prerequisite skill is neither held by the user nor covered by a selected course, add the cheapest course that covers it and mark it "added for prerequisite".
- Topologically sort; break ties by higher priority score first.
- Detect cycles in the catalog and fail loudly in tests.

### 9.8 Timeline (backend)
Weeks for an item = course hours divided by weekly hours, rounded up. Items run sequentially. Total timeline is the sum.

### 9.9 Verifier rules (backend, M5)
1. Total cost at most the budget.
2. Total hours fit the weekly hours and the target timeline when provided.
3. Every item appears after all of its prerequisites.
4. Every top-priority gap is covered or listed as uncovered with a reason.
5. No duplicate courses.
6. Every item has the fields the Explainer needs.

On failure, the violations go back to the Planner, which replans with them as constraints. Maximum 3 retries, then the best plan is returned with violations flagged. The retry limit lives in backend config. The graph in intelligence reads the verifier's result and routes accordingly.

---

## 10. Data layer

### 10.1 Skill taxonomy
- Base: ESCO ICT skills, filtered to the demo roles. ESCO may lack tool-level skills (Kubernetes, Terraform, Airflow, PyTorch). Supplement from O*NET technology skills or add manually. Mark every entry not from ESCO or O*NET as `SUPPLEMENTED` and list them for review.
- One file in `contracts/taxonomy/` with id, canonical name, aliases, category. Owner: intelligence.
- The existing `taxonomy.py` skill names may be used as input, marked `SUPPLEMENTED`.

### 10.2 Job descriptions
- Baseline: a curated public dataset (for example a Kaggle tech job postings set), cleaned and embedded by intelligence, loaded by backend.
- Fresh: Tavily results, stored with retrieval timestamp and source URL.
- Never scrape job boards live.
- The existing `job_roles.json` cannot replace postings, because frequency needs posting text.

### 10.3 Course catalog (backend, M9)
- Built first for the demo roles. A coverage check script confirms every skill that can appear as a gap for those roles has at least one course.
- Free resources first (freeCodeCamp, official documentation, roadmap.sh, curated YouTube series), then low-cost options.
- Prices, durations, and URLs must be real. Anything not actually checked is flagged `UNVERIFIED` and listed for human review. Never invent catalog data.

### 10.4 Market snapshots
One record per role per snapshot date: skill, frequency, posting count, source.

### 10.5 Demo roles
1. Full-Stack Developer (TypeScript, React, Node.js, Next.js, PostgreSQL, REST APIs, Git)
2. Data Engineer (Python, SQL, PostgreSQL, Apache Spark, Airflow, Data Modeling, Docker)
3. Machine Learning Engineer (Python, PyTorch, Scikit-learn, MLOps, Docker, Git, Data Pipelines)
4. Cloud / DevOps Engineer (Linux, Docker, Kubernetes, Terraform, AWS/GCP, CI/CD, Bash)

Niche role for the live-search test: **Rust Embedded Systems Engineer.**

---

## 11. Track 3: Intelligence (`intelligence/`)

Owns everything involving an LLM, embeddings, retrieval, or search, plus the graph that connects all steps.

| Tier | Module | What it does |
|---|---|---|
| P0 | M0 Orchestrator | LangGraph graph, shared state, conditional edges, per-node timeouts and structured errors, progress events. Calls planner and verifier through the interfaces in 7.3 |
| P0 | M1 Profiler | Resume text to skills; taxonomy normalization by embedding match (LLM only for unresolved cases); proficiency 0 to 3 per skill; unmapped skills flagged |
| P0 | M2 Market Intelligence | Embed role, retrieve top-k postings, extract requirements, compute frequencies; autonomous fallback to live search when mean similarity is below threshold or too few postings return; merge fresh data with timestamps |
| P0 | M3 Gap Analyzer | Skill-level matching, transferable detection, priority scores (9.1 to 9.5) |
| P0 | M6 Explainer | Reason per roadmap item and a short summary, using only supplied fields |
| P1 | M7 Role Matcher | Ranks roles by fit when no target role is given |
| P1 | M8 Market Trends | Snapshot refresh via Tavily, rising and declining labels fed into M3 and M6 |
| P1 | Replan operation | Re-runs the graph from the gap stage for M10 |
| P2 | M12 Quiz generation | Quiz per completed item, grounded in the course's skills |

Also owned:
- Embedding module (`all-MiniLM-L6-v2`, size 384).
- Gemini client: JSON output validated against contract schemas, one retry on malformed output, then a structured error. No mock fallback. If the LLM is unavailable, the operation fails with a clear error.
- Search client (Tavily).
- Taxonomy file, and job posting cleaning and embedding scripts.
- Config file: model names (`gemini-2.5-flash` primary, `gemini-2.0-flash` fallback), rate limits, similarity thresholds, priority multipliers, top-k, minimum posting count.
- Fake LLM, search, and interface implementations for unit tests.

Acceptance:
- M1: on 10 varied test resumes, synonyms resolve to one canonical skill, every skill has a level, unmapped skills are flagged, not invented.
- M2: a common role uses the cache only; a niche role triggers live search and the progress event states why.
- M3: gaps ranked correctly on fixed sample data; transferable skills flagged with the supporting profile skill; a user holding every required skill gets an empty gap list with a clear message.
- M6: every item cites its frequency, gap, and prerequisite or transferable link where applicable; no invented figures.
- M7: for sample resumes, the top three roles are sensible and fit scores are explainable.
- M8: at least two snapshots per demo role; rising and declining labels are produced.

---

## 12. Track 2: Backend (`backend/`)

Owns the API, the database, all deterministic logic, and the glue that runs intelligence and serves the frontend.

| Tier | Module | What it does |
|---|---|---|
| P0 | Database | Supabase schema as SQL migration files (pgvector enabled, vectors sized 384), loader scripts |
| P0 | M9 Course Catalog | Catalog data, coverage check, cycle check on prerequisites |
| P0 | M4 Planner | Section 9.6 to 9.8, fully deterministic, built from the existing optimizer where useful |
| P0 | M5 Verifier | Section 9.9, fully deterministic |
| P0 | Analysis API | Resume text extraction, analyze endpoint, progress streaming |
| P1 | M10 Memory and Replanning | Persist profile, gaps, roadmap, progress; trigger replan on progress or constraint change |
| P1 | Roles, trends, saved roadmap endpoints | Serve M7 and M8 results and saved data |
| P2 | M13 Multi-currency | INR and USD with a fixed, documented conversion rate |
| P2 | M14 Auth and modes | Supabase auth for signed-in mode (tokens validated by calling Supabase auth, no JWT secret stored); guest mode without persistence |
| P2 | Quiz endpoint | Serves M12 output |

Also owned:
- Implementations of the interfaces in 7.3, passed into intelligence at startup.
- Loading intelligence's taxonomy and job posting artifacts into Supabase.
- PDF text extraction. Scanned PDFs with no extractable text return a clear message asking for text input.
- Config file: retry limit, currency conversion rate, database settings, CORS origin.
- The Supabase service role key stays in the backend environment only.

Acceptance:
- M4: same input gives identical output on every run; zero-budget input yields only free courses; uncoverable gaps are reported with reasons.
- M5: each of the six rules is triggered by a purpose-built failing plan; an infeasible input ends flagged within the retry limit.
- M9: coverage check passes for all four demo roles; cycle check passes.
- M10: marking an item complete and changing weekly hours returns an updated roadmap without a new resume upload.
- API: every endpoint matches `contracts/api/` exactly.

---

## 13. Track 1: Frontend (`frontend/`)

Vite + React (TypeScript) + Tailwind CSS, a standalone SPA calling the backend over HTTP. Dev server on Vite's default port.

| Tier | Module | What it does |
|---|---|---|
| P0 | Input screen | Resume upload or paste, target role (optional), budget and currency, weekly hours, target timeline |
| P0 | Progress view | Live agent steps from progress events (Profiler, Market Intelligence, Gap Analyzer, Planner, Verifier, Explainer), including retry and fallback messages |
| P0 | Results views | Profile with levels, gaps with priority scores and transferable flags, roadmap with order, cost, hours, timeline, and the explanation per item, uncovered gaps with reasons, verifier status |
| P1 | Role suggestions view | Ranked roles with fit scores and a way to select one |
| P1 | Market trends view | Rising and declining skills table with timestamps |
| P1 | Saved roadmaps view | Past roadmaps for signed-in users |
| P1 | Replan controls | Change weekly hours or budget, mark an item complete, show the updated roadmap |
| P2 | M11 Milestone checklist | Per-item completion and progress bar |
| P2 | M12 Quiz UI | Quiz per completed module |
| P2 | M14 UI | Sign in, sign up, guest mode |
| P2 | M13 UI | Currency selector |
| P2 | M15 Polish | Loading, empty, and error states; responsive layout |

Rules:
- Build against the mock server serving `contracts/examples/` first. Switch to the real backend by configuration only.
- Never hold the Supabase service role key. Only the public URL and anon key are allowed, and only for auth.
- Display unverified courses with a visible "unverified" marker.
- Every backend error shows a readable message. No blank screens.
- No chat interface.

Acceptance:
- All screens render correctly from every example in `contracts/examples/`, including empty gap list, uncovered gaps, verifier violations, and fallback events.
- Progress view shows steps in order and shows the reason when live search triggers.
- Switching from mock to real backend needs only a configuration change.

---

## 14. Decisions on models

| Item | Decision |
|---|---|
| LLM | `gemini-2.5-flash` primary, `gemini-2.0-flash` fallback, both in the intelligence config file. JSON output mode with schema validation. `gemini-1.5-*` is retired and must not be used |
| Embeddings | `all-MiniLM-L6-v2` via sentence-transformers, vector size 384. Fixed. Changing it later means re-embedding everything |
| Verification | Model names and free-tier limits stated here come from general knowledge and are not verified. Verify at the first live call. If a model name is rejected, stop and report. If a model is deprecated, report it instead of silently switching |

---

## 15. API endpoints (backend-owned, specified in `contracts/api/`)

All responses use the existing envelope (success, data, error, metadata) and error codes.

| Endpoint | Purpose | Used by |
|---|---|---|
| Health | Service status (database, LLM, search) | Frontend startup check |
| Upload resume | Accepts a file, returns extracted text | Input screen |
| Analyze | Accepts resume text and constraints, optional target role; streams progress events; returns profile, gaps, roadmap, explanations | Input screen, progress view, results |
| Suggest roles | Accepts a profile, returns ranked roles | Role suggestions view |
| Market trends | Returns the skill trend table for a role | Trends view |
| Save roadmap | Persists a roadmap for a signed-in user | Results |
| Get roadmaps | Returns a user's saved roadmaps | Saved roadmaps view |
| Update progress | Marks an item complete and triggers replanning | Checklist, replan controls |
| Replan | Applies changed budget, hours, or target and returns an updated roadmap | Replan controls |
| Generate quiz | Returns a quiz for a completed item | Quiz UI |

---

## 16. Database schema (backend-owned)

| Table | Key fields |
|---|---|
| users | id, email, created at |
| skills_taxonomy | id, canonical name, aliases, category, embedding (384) |
| job_postings | id, role, text, source, retrieved at, embedding (384) |
| role_requirements | role, skill id, frequency, required level, snapshot date |
| courses | id, title, platform, url, cost, currency, hours, level, skills covered, prerequisite skills, verified |
| profiles | id, user id, skills with levels, years, domain, created at |
| roadmaps | id, user id, target role, constraints, items, status, created at |
| roadmap_progress | roadmap id, item id, completed at |
| market_snapshots | role, skill id, frequency, posting count, snapshot date |

The chat tables (`conversations`, `messages`) and the guest-user insert from the old migration are not carried over.

---

## 17. Tech stack

| Layer | Choice |
|---|---|
| Orchestration | LangGraph (Python), in `intelligence/` |
| LLM | Gemini, Google AI Studio API (section 14) |
| Embeddings | sentence-transformers, local |
| Database | Supabase (PostgreSQL with pgvector). No local Postgres |
| Backend | FastAPI, Python 3.10 or newer, in `backend/.venv` |
| Search | Tavily API |
| Frontend | Vite + React (TypeScript) + Tailwind CSS, Node 20 LTS |
| PDF extraction | A Python PDF text library, in backend |

---

## 18. Environment variables

Secrets and URLs only. Model names, thresholds, retry limits, and the currency rate live in each track's config file, not in the environment.

**Root `.env`** (read by the backend process and by intelligence scripts; git-ignored; `.env.example` lists names only)

| Variable | Used by | Purpose |
|---|---|---|
| `APP_ENV` | Backend | development or production |
| `FRONTEND_URL` | Backend | Allowed CORS origin (the Vite dev URL) |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Database and vector access |
| `DATABASE_URL` | Backend | Postgres connection string for running migrations |
| `GEMINI_API_KEY` | Intelligence | LLM calls |
| `TAVILY_API_KEY` | Intelligence | Live search and trend refresh |

**`frontend/.env`** (git-ignored; `frontend/.env.example` lists names only)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL, or the mock server URL while mocking |
| `VITE_SUPABASE_URL` | Supabase project URL (auth only) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key (auth only) |

Removed from the old file: `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `LLM_MODEL_NAME`, `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL_NAME`, `SECRET_KEY`, `DEMO_MODE`, `BACKEND_URL`, `SUPABASE_ANON_KEY` (moves to the frontend file).

When each key is needed: Supabase values in Phase 1, Gemini and Tavily keys in Phase 2 (Tavily for trends again in Phase 4), frontend Supabase values in Phase 5.

### Blocking rules
1. A test that uses a fake client does not count toward a gate. Label it "fake-client test".
2. A gate needing live Supabase, Gemini, or Tavily is **BLOCKED** until the key exists. It is never reported as passed.
3. Every report lists which tests are real, which used fake clients, and which are blocked.
4. Report the first point where each key is required.
5. Never invent, hardcode, or print a key.

---

## 19. Execution mode: single agent

One AI coding agent builds all three tracks, working from this file.

- Branch: `rework`. Commits grouped by track folder.
- The folder boundaries and the dependency direction in section 7 still apply, so the work can be handed to three people later without restructuring.
- The agent works one phase at a time, reports at the end of each, and waits for the project owner to say "proceed".
- The agent does not delete anything before the Phase A audit report is approved.
- The agent may not simplify the plan silently. If something cannot be done as written, it stops and reports.
- The project owner provides the accounts and keys, confirms model names, and reviews catalog and dataset contents.

---

## 20. Phases and gates

| Phase | Work | Gate |
|---|---|---|
| A. Audit | Inventory every existing file, decide keep, move, rework, or delete per section 5, list unverified data, list unknowns | Audit report approved by the project owner. Nothing deleted before this |
| 0. Foundations | Teardown per the approved audit; new layout; `backend/.venv`; requirements files; config files; `.env.example` files; `.gitignore`; contracts (schemas, examples, API spec, taxonomy); Supabase migration files written; interfaces and fakes; Vite app skeleton with mock server | Contracts and API spec approved; every example validates against its schema; taxonomy file exists; project runs with fakes |
| 1. Data | Job dataset cleaned and embedded; migrations run; loaders run; M9 catalog and coverage check; frontend input screen and results views against mocks | Coverage check passes for all demo roles; taxonomy and postings are in Supabase (BLOCKED until Supabase keys exist) |
| 2. P0 modules | M1, M2, M3; M4, M5; progress view against mock events | Each module passes its acceptance tests alone. Real tests need keys; fake-client tests are labeled |
| 3. P0 integration | M0 graph wired, M6, analyze endpoint with streaming, frontend switched from mocks to the real endpoint | Resume to explained roadmap works end to end for all four demo roles (BLOCKED until keys exist) |
| 4. P1 | M7, M8, replan, M10, roles and trends endpoints, saved roadmaps, matching frontend views | Role suggestion, trend table, and replanning work in the UI |
| 5. P2 | M11 to M15, M12 quiz generation | Each item finished independently; unfinished items hidden from the demo |
| 6. Hardening | Fix failures from testing, rehearse demo | All ten acceptance tests pass with real clients; demo script runs twice without errors |

---

## 21. End-to-end acceptance tests

| # | Test | Primary track |
|---|---|---|
| 1 | A standard resume and a common role produce a roadmap that respects budget and weekly hours | Backend and Intelligence |
| 2 | A zero-budget user receives only free courses, and any uncovered gap is reported with a reason | Backend |
| 3 | The niche role (Rust Embedded Systems Engineer) triggers live search, and the progress event shows the reason | Intelligence |
| 4 | A user with no target role receives ranked roles and can select one | Intelligence and Frontend |
| 5 | Prerequisite order holds in every generated roadmap (checked automatically) | Backend |
| 6 | Every roadmap item has an explanation that cites its computed data | Intelligence |
| 7 | Changing weekly hours or marking an item complete replans without a new resume upload | Backend and Frontend |
| 8 | An infeasible input ends in a flagged result within the retry limit | Backend |
| 9 | A resume with unusual skill wording still normalizes to canonical skills | Intelligence |
| 10 | The trend table shows at least two snapshots with rising or declining labels | Intelligence and Frontend |

---

## 22. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Existing code carries hidden shortcuts (mock LLM output, hardcoded constraints, invented fallbacks) | Audit in Phase A; these are removed per section 5 |
| Tracks drift apart on data shapes | Contracts in one shared folder, validated examples, change process in 6.4 |
| Course catalog does not cover a gap | Coverage check in Phase 1; uncovered gaps reported, never hidden |
| Catalog or job data is fabricated or stale | Unverified entries flagged and reviewed by a human |
| Existing job_roles data lacks posting text | A real postings dataset is loaded; job_roles.json is seed only |
| LLM returns malformed JSON | JSON output mode, schema validation, one retry, then a structured error |
| LLM invents skills or numbers | Taxonomy-bound normalization; Explainer restricted to supplied fields |
| Live search fails or is rate limited | Fall back to cache, show timestamp, flag lower confidence |
| Model name or API changes | Names in config only; verify at first live call |
| Embedding dimension mismatch (old schema used 1536) | Migrations rewritten for 384; fixed in Phase 0 |
| Thresholds poorly tuned | Tune on test resumes; record final values |
| Scanned or unusual PDFs | Detect empty extraction and ask for text input |
| Fake tests mistaken for real passes | Blocking rules in section 18 |
| Unfinished P2 features harm the demo | Show only finished modules |

---

## 23. Demo plan

Rehearse the P0 plus P1 flow. Show P2 only if finished.

1. Upload a resume, set budget and weekly hours, pick a target role.
2. Show the agent progress steps as they run.
3. Show the profile with canonical skills and levels.
4. Show gaps with priority scores and transferable skills flagged.
5. Show the roadmap: order, cost, hours, timeline, and the reason for each item.
6. Trigger the live-search fallback with the niche role and show why it triggered.
7. Show the market trend table with rising and declining skills.
8. Reduce the budget to force a constraint violation and show the Verifier returning the plan to the Planner.
9. Change weekly hours or mark a course complete and show replanning.
10. Show role suggestions for a user with no target role.

If asked about classifiers: proficiency level and role fit use zero-shot LLM classification and embedding similarity, not a trained model. If asked about the agentic claim: point to the autonomous fallback decision, the Verifier feedback loop, replanning from memory, and the separation between LLM tasks and deterministic planning.

---

## 24. Definition of done

- Every row of the traceability table (section 2) works in the demo.
- All ten end-to-end acceptance tests pass with real clients, not fakes.
- Each track's own acceptance criteria pass.
- Nothing from section 5 marked for removal remains in the repository.
- No demo mode, mock LLM output, hardcoded constraints, or invented fallback remains in the code.
- Thresholds and model names are recorded in the owning track's config file.
- No catalog or job data is marked UNVERIFIED without a human review decision.
- README technique claims match what is implemented.
