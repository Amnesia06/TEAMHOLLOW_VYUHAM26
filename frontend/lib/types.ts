/**
 * TypeScript domain models strictly adhering to docs/API_CONTRACT.md
 */

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    request_id?: string;
  };
}

export interface SkillEvidence {
  type: string;
  description: string;
  confidence: "low" | "medium" | "high";
}

export interface Skill {
  name: string;
  category: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  evidence: SkillEvidence[];
  is_inferred: boolean;
  last_updated?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
  field?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  skills_demonstrated: string[];
}

export interface LearningPreferences {
  hours_per_week?: number;
  budget_monthly?: number;
  preferred_format?: string;
}

export interface UserProfile {
  user_id?: string;
  education: Education[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  interests: string[];
  career_goals: string[];
  learning_preferences: LearningPreferences;
  completeness: number;
  last_updated?: string;
}

export interface MatchingSkill {
  skill: string;
  importance: "required" | "preferred" | "emerging";
  user_proficiency: string;
  relevance: string;
}

export interface TransferableSkill {
  skill: string;
  source: string[];
  explanation: string;
  confidence: "low" | "medium" | "high";
}

export interface PartialSkill {
  skill: string;
  importance: string;
  current_proficiency: string;
  required_proficiency: string;
  priority: string;
}

export interface MissingSkill {
  skill: string;
  importance: string;
  priority: string;
}

export interface CareerRecommendation {
  role_id?: string;
  role: string;
  category?: string;
  description: string;
  match_score: number;
  match_percentage: number;
  match_explanation: string;
  matching_skills: MatchingSkill[];
  transferable_skills: TransferableSkill[];
  partial_skills: PartialSkill[];
  missing_skills: MissingSkill[];
  confidence: number;
  salary_range?: string;
  growth_outlook?: string;
  data_source?: string;
}

export interface LearningResource {
  resource_id: string;
  title: string;
  provider: string;
  url: string;
  topic: string;
  skills: string[];
  cost: number;
  currency: string;
  difficulty: string;
  estimated_hours: number;
  prerequisites: string[];
  type: "course" | "documentation" | "video" | "interactive" | "project";
  last_verified?: string;
}

export interface Milestone {
  milestone_id: string;
  order: number;
  title: string;
  description: string;
  skills_covered: string[];
  estimated_hours: number;
  estimated_weeks: number;
  estimated_cost: number;
  schedule_window?: string;
  prerequisites: string[];
  resources: LearningResource[];
  priority_explanation: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
}

export interface FeasibilityReport {
  is_feasible: boolean;
  total_estimated_hours: number;
  total_estimated_weeks: number;
  total_estimated_months: number;
  total_estimated_cost: number;
  weekly_hours_allocated: number;
  notes: string;
}

export interface Roadmap {
  roadmap_id: string;
  target_role: string;
  total_estimated_weeks: number;
  total_estimated_months: number;
  total_estimated_cost: number;
  feasibility: FeasibilityReport;
  milestones: Milestone[];
  explanation: string;
}

export interface UIComponent {
  type: "career_card" | "skill_badge" | "roadmap_preview" | "transferable_skills";
  data: any;
}

export interface AgentActivity {
  agent: string;
  status: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  agent_activity?: AgentActivity[];
  ui_components?: UIComponent[];
  follow_up_suggestions?: string[];
}
