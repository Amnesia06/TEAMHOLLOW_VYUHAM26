import {
  Profile,
  Gap,
  Course,
  Roadmap,
  ProgressEvent
} from "../types/contracts";

export const MOCK_PROFILE: Profile = {
  skills: [
    { skill_id: "skill_python", name: "Python", level: 2 },
    { skill_id: "skill_sql", name: "SQL", level: 2 },
    { skill_id: "skill_html_css", name: "HTML & CSS", level: 2 }
  ],
  unmapped_skills: ["InternalDeploymentTooling"],
  years_of_experience: 2.5,
  years_per_skill: {
    "Python": 2.0,
    "SQL": 2.0,
    "HTML & CSS": 1.5
  },
  domain: "Full-Stack Web Development"
};

export const MOCK_ROADMAP: Roadmap = {
  items: [
    {
      order: 1,
      course: {
        id: "yt_git_01",
        title: "Git and GitHub for Beginners - Crash Course",
        platform: "YouTube / freeCodeCamp",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        cost: 0.0,
        currency: "USD",
        hours: 6.0,
        level: 1,
        skills_covered: ["skill_git"],
        prerequisite_skills: [],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_git",
          skill_name: "Git",
          gap_size: 1,
          frequency: 0.75,
          transferable: true,
          supporting_skill: null,
          trend: "stable",
          priority_score: 1.5
        }
      ],
      start_week: 1.0,
      end_week: 2.0,
      cost: 0.0,
      hours: 6.0,
      added_for_prerequisite: false,
      explanation: "Version control is foundational for all team software engineering. This free video course covers branches, commits, PRs, and GitHub workflows."
    },
    {
      order: 2,
      course: {
        id: "yt_pg_01",
        title: "PostgreSQL Tutorial for Beginners",
        platform: "YouTube / freeCodeCamp",
        url: "https://www.youtube.com/watch?v=qw--VYLpxG4",
        cost: 0.0,
        currency: "USD",
        hours: 12.0,
        level: 2,
        skills_covered: ["skill_postgresql", "skill_sql"],
        prerequisite_skills: [],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_postgresql",
          skill_name: "PostgreSQL",
          gap_size: 2,
          frequency: 0.82,
          transferable: true,
          supporting_skill: "SQL",
          trend: "rising",
          priority_score: 1.64
        }
      ],
      start_week: 2.0,
      end_week: 4.0,
      cost: 0.0,
      hours: 12.0,
      added_for_prerequisite: false,
      explanation: "PostgreSQL is required in over 80% of modern full-stack postings. Covers relational schema design, indexing, queries, and connection pools."
    },
    {
      order: 3,
      course: {
        id: "yt_ts_02",
        title: "TypeScript Crash Course",
        platform: "YouTube / Traversy Media",
        url: "https://www.youtube.com/watch?v=BCg4U1FzODs",
        cost: 0.0,
        currency: "USD",
        hours: 10.0,
        level: 1,
        skills_covered: ["skill_typescript"],
        prerequisite_skills: [],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_typescript",
          skill_name: "TypeScript",
          gap_size: 2,
          frequency: 0.88,
          transferable: false,
          supporting_skill: null,
          trend: "rising",
          priority_score: 1.76
        }
      ],
      start_week: 4.0,
      end_week: 6.0,
      cost: 0.0,
      hours: 10.0,
      added_for_prerequisite: false,
      explanation: "TypeScript provides static type safety essential for modern production React and Node applications."
    },
    {
      order: 4,
      course: {
        id: "yt_react_02",
        title: "React Full Course for Beginners",
        platform: "YouTube / Bro Code",
        url: "https://www.youtube.com/watch?v=CgkZ7MvWUAA",
        cost: 0.0,
        currency: "USD",
        hours: 18.0,
        level: 2,
        skills_covered: ["skill_react"],
        prerequisite_skills: ["skill_javascript", "skill_html_css"],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_react",
          skill_name: "React",
          gap_size: 2,
          frequency: 0.90,
          transferable: false,
          supporting_skill: null,
          trend: "rising",
          priority_score: 1.80
        }
      ],
      start_week: 6.0,
      end_week: 8.0,
      cost: 0.0,
      hours: 18.0,
      added_for_prerequisite: false,
      explanation: "Industry-standard UI library covering components, state, hooks, lifecycle, and component composition."
    },
    {
      order: 5,
      course: {
        id: "yt_node_01",
        title: "Node.js and Express.js Full Course",
        platform: "YouTube / freeCodeCamp",
        url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
        cost: 0.0,
        currency: "USD",
        hours: 16.0,
        level: 2,
        skills_covered: ["skill_nodejs", "skill_rest_apis"],
        prerequisite_skills: ["skill_javascript"],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_nodejs",
          skill_name: "Node.js",
          gap_size: 2,
          frequency: 0.85,
          transferable: false,
          supporting_skill: null,
          trend: "rising",
          priority_score: 1.70
        },
        {
          skill_id: "skill_rest_apis",
          skill_name: "REST APIs",
          gap_size: 2,
          frequency: 0.80,
          transferable: false,
          supporting_skill: null,
          trend: "stable",
          priority_score: 1.60
        }
      ],
      start_week: 8.0,
      end_week: 10.0,
      cost: 0.0,
      hours: 16.0,
      added_for_prerequisite: false,
      explanation: "Server-side JavaScript runtime with Express router, middleware, authentication, and REST endpoint construction."
    },
    {
      order: 6,
      course: {
        id: "yt_next_01",
        title: "Next.js 14 Full Course - App Router, Server Actions, Auth",
        platform: "YouTube / freeCodeCamp",
        url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
        cost: 0.0,
        currency: "USD",
        hours: 20.0,
        level: 2,
        skills_covered: ["skill_nextjs", "skill_react"],
        prerequisite_skills: ["skill_react", "skill_typescript"],
        verified: true
      },
      gaps_covered: [
        {
          skill_id: "skill_nextjs",
          skill_name: "Next.js",
          gap_size: 2,
          frequency: 0.78,
          transferable: false,
          supporting_skill: null,
          trend: "rising",
          priority_score: 1.56
        }
      ],
      start_week: 10.0,
      end_week: 12.0,
      cost: 0.0,
      hours: 20.0,
      added_for_prerequisite: false,
      explanation: "Full-stack meta-framework with server-side rendering, React Server Components, server actions, and cloud deployment."
    }
  ],
  total_cost: 0.0,
  total_hours: 82.0,
  total_weeks: 12.0,
  uncovered_gaps: [],
  verifier_status: "pass",
  violations: []
};

export const MOCK_COURSE: Course = MOCK_ROADMAP.items[1].course;
export const MOCK_GAP: Gap = MOCK_ROADMAP.items[1].gaps_covered[0];

export const MOCK_PROGRESS_EVENTS: ProgressEvent[] = [
  { step: "Profiler", status: "finished", message: "Extracted 3 canonical skills and 0 unmapped skills." },
  { step: "Market Intelligence", status: "finished", message: "Retrieved 15 cached postings for Full-Stack Developer." },
  { step: "Gap Analyzer", status: "finished", message: "Identified 6 missing competencies for target career path." },
  { step: "Planner", status: "finished", message: "Deterministic knapsack schedule generated with 6 modules over 12 weeks." },
  { step: "Verifier", status: "finished", message: "All 6 verifier rules passed successfully with 0 violations." },
  { step: "Explainer", status: "finished", message: "Evidence-based explanations attached to all 6 roadmap milestones." }
];
