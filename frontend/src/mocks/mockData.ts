import {
  Profile,
  Gap,
  Course,
  Roadmap,
  ProgressEvent
} from "../types/contracts";

export const MOCK_PROFILE: Profile = {
  skills: [
    { skill_id: "skill_ts_01", name: "TypeScript", level: 2 },
    { skill_id: "skill_react_02", name: "React", level: 2 },
    { skill_id: "skill_node_03", name: "Node.js", level: 1 }
  ],
  unmapped_skills: ["InternalDeploymentTooling"],
  years_of_experience: 2.5,
  years_per_skill: {
    "TypeScript": 2.0,
    "React": 2.0,
    "Node.js": 1.0
  },
  domain: "Full-Stack Web Development"
};

export const MOCK_COURSE: Course = {
  id: "course_pg_01",
  title: "PostgreSQL Tutorial for Beginners",
  platform: "freeCodeCamp",
  url: "https://www.freecodecamp.org/news/postgresql-tutorial/",
  cost: 0.0,
  currency: "USD",
  hours: 12.0,
  level: 2,
  skills_covered: ["skill_pg_04"],
  prerequisite_skills: ["skill_sql_01"],
  verified: false
};

export const MOCK_GAP: Gap = {
  skill_id: "skill_pg_04",
  skill_name: "PostgreSQL",
  gap_size: 2,
  frequency: 0.82,
  transferable: true,
  supporting_skill: "SQL",
  trend: "rising",
  priority_score: 0.984
};

export const MOCK_ROADMAP: Roadmap = {
  items: [
    {
      order: 1,
      course: MOCK_COURSE,
      gaps_covered: [MOCK_GAP],
      start_week: 1.0,
      end_week: 2.0,
      cost: 0.0,
      hours: 12.0,
      added_for_prerequisite: false,
      explanation: "PostgreSQL is required in 82% of Full-Stack Developer postings. With your existing SQL experience, this 12-hour free tutorial covers your level 2 gap in weeks 1-2."
    }
  ],
  total_cost: 0.0,
  total_hours: 12.0,
  total_weeks: 2.0,
  uncovered_gaps: [],
  verifier_status: "pass",
  violations: []
};

export const MOCK_PROGRESS_EVENTS: ProgressEvent[] = [
  { step: "Profiler", status: "finished", message: "Extracted 3 canonical skills and 1 unmapped skill." },
  { step: "Market Intelligence", status: "finished", message: "Retrieved 15 cached postings for Full-Stack Developer." },
  { step: "Gap Analyzer", status: "finished", message: "Identified 1 missing competency; transferable skill link verified." },
  { step: "Planner", status: "finished", message: "Deterministic knapsack schedule generated within zero-budget constraint." },
  { step: "Verifier", status: "finished", message: "All 6 verifier rules passed successfully." },
  { step: "Explainer", status: "finished", message: "Evidence-based explanations attached to roadmap items." }
];
