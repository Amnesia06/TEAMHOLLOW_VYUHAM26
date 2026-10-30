/**
 * Pathwise API Client
 * Centralized HTTP service for connecting to FastAPI backend
 */

import {
  APIResponse,
  UserProfile,
  CareerRecommendation,
  Roadmap,
  LearningResource,
  Milestone,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(
        errorBody.error?.message || `Request failed with status ${res.status}`
      );
    }

    const payload: APIResponse<T> = await res.json();
    return payload.data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Chat
  sendMessage: async (
    message: string,
    sessionId?: string,
    attachments?: Array<{ type: string; content: string; filename?: string }>
  ) => {
    return fetchJson<{
      message: string;
      session_id: string;
      agent_activity: any[];
      profile_update?: any;
      ui_components: any[];
      follow_up_suggestions: string[];
    }>("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        session_id: sessionId,
        attachments,
      }),
    });
  },

  // Profile
  getProfile: async (userId: string = "00000000-0000-0000-0000-000000000001") => {
    return fetchJson<UserProfile>(`/profile/${userId}`);
  },

  updateProfile: async (
    userId: string = "00000000-0000-0000-0000-000000000001",
    updates: Partial<UserProfile>
  ) => {
    return fetchJson<UserProfile>(`/profile/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // Careers
  getRecommendations: async (
    userId: string = "00000000-0000-0000-0000-000000000001",
    limit: number = 5
  ) => {
    return fetchJson<CareerRecommendation[]>(
      `/careers/recommendations?user_id=${userId}&limit=${limit}`
    );
  },

  analyzeTargetCareer: async (
    targetRole: string,
    userId: string = "00000000-0000-0000-0000-000000000001"
  ) => {
    return fetchJson<CareerRecommendation>("/careers/analyze", {
      method: "POST",
      body: JSON.stringify({
        target_role: targetRole,
        user_id: userId,
      }),
    });
  },

  // Roadmap
  getRoadmap: async (userId: string = "00000000-0000-0000-0000-000000000001") => {
    return fetchJson<Roadmap>(`/roadmap/${userId}`);
  },

  generateRoadmap: async (
    targetRole: string,
    constraints?: {
      hours_per_week?: number;
      monthly_budget?: number;
      desired_timeline_months?: number;
    },
    userId: string = "00000000-0000-0000-0000-000000000001"
  ) => {
    return fetchJson<Roadmap>("/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({
        target_role: targetRole,
        constraints,
        user_id: userId,
      }),
    });
  },

  updateMilestone: async (
    milestoneId: string,
    updates: { status?: string; progress?: number; notes?: string }
  ) => {
    return fetchJson<Milestone>(`/roadmap/milestones/${milestoneId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // Resources
  getResources: async (params?: {
    skill?: string;
    difficulty?: string;
    max_cost?: number;
    type?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.skill) query.append("skill", params.skill);
    if (params?.difficulty) query.append("difficulty", params.difficulty);
    if (params?.max_cost !== undefined) query.append("max_cost", params.max_cost.toString());
    if (params?.type) query.append("type", params.type);
    if (params?.limit) query.append("limit", params.limit.toString());

    return fetchJson<LearningResource[]>(`/resources?${query.toString()}`);
  },

  // Health
  checkHealth: async () => {
    return fetchJson<any>("/health");
  },
};
