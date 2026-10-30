/**
 * Frontend TypeScript contracts mirroring contracts/schemas/ exactly.
 */

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  } | null;
  metadata?: {
    timestamp: string;
    request_id?: string;
  };
}

export interface ProfileSkill {
  skill_id: string;
  name: string;
  level: number; // 0=none, 1=beginner, 2=intermediate, 3=advanced
}

export interface Profile {
  skills: ProfileSkill[];
  unmapped_skills: string[];
  years_of_experience: number;
  years_per_skill: Record<string, number>;
  domain: string;
}

export interface RoleRequirement {
  skill_id: string;
  skill_name: string;
  frequency: number; // 0 to 1
  required_level: number; // 0 to 3
  trend: "rising" | "stable" | "declining" | "unknown";
  source: "cache" | "live";
  timestamp: string;
}

export interface Gap {
  skill_id: string;
  skill_name: string;
  gap_size: number; // 0 to 3
  frequency: number; // 0 to 1
  transferable: boolean;
  supporting_skill?: string | null;
  trend: "rising" | "stable" | "declining" | "unknown";
  priority_score: number;
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  url: string;
  cost: number;
  currency: "USD" | "INR";
  hours: number;
  level: number; // 1 to 3
  skills_covered: string[];
  prerequisite_skills: string[];
  verified: boolean;
}

export interface UserConstraints {
  budget: number;
  currency: "USD" | "INR";
  weekly_hours: number;
  target_timeline?: number | null;
  target_role?: string | null;
}

export interface RoadmapItem {
  order: number;
  course: Course;
  gaps_covered: Gap[];
  start_week: number;
  end_week: number;
  cost: number;
  hours: number;
  added_for_prerequisite: boolean;
  explanation: string;
}

export interface UncoveredGap {
  gap: Gap;
  reason: string;
}

export interface Roadmap {
  items: RoadmapItem[];
  total_cost: number;
  total_hours: number;
  total_weeks: number;
  uncovered_gaps: UncoveredGap[];
  verifier_status: "pass" | "violations_flagged";
  violations: string[];
}

export interface ProgressEvent {
  step: "Profiler" | "Market Intelligence" | "Gap Analyzer" | "Planner" | "Verifier" | "Explainer";
  status: "started" | "finished" | "failed" | "retrying";
  message: string;
}
