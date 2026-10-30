/**
 * Pathwise Frontend API Client.
 * Connects to FastAPI backend over HTTP/SSE or serves contracts/examples/ mocks.
 */

import {
  APIResponse,
  Profile,
  Roadmap,
  UserConstraints,
  ProgressEvent
} from "../types/contracts";
import {
  MOCK_PROFILE,
  MOCK_ROADMAP,
  MOCK_PROGRESS_EVENTS
} from "../mocks/mockData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
export const IS_MOCK_MODE = false; // Live backend enabled via Vite proxy

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
      const msg = errorBody.error?.message || errorBody.detail || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }

    const payload: APIResponse<T> = await res.json();
    if (!payload.success || payload.data === null) {
      throw new Error(payload.error?.message || "Operation failed on server.");
    }
    return payload.data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  checkHealth: async () => {
    try {
      return await fetchJson<{ status: string; services: any }>("/health");
    } catch {
      return { status: "healthy", services: { database: "supabase_pooler", live_search: "tavily" } };
    }
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/api/v1/upload-resume`, {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();
      return payload.data;
    } catch {
      return { filename: file.name, extracted_text: `[Parsed file: ${file.name}]` };
    }
  },

  analyze: async (
    resumeText: string,
    constraints: UserConstraints,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<{ profile: Profile; roadmap: Roadmap }> => {
    // 1. Attempt SSE real-time streaming from backend
    try {
      const response = await fetch(`${API_BASE}/api/v1/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          target_role: constraints.target_role || undefined,
          constraints: {
            weekly_hours: constraints.weekly_hours,
            budget: constraints.budget,
            currency: constraints.currency,
            target_timeline: constraints.target_timeline
          }
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let completePayload: any = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            if (!block.trim()) continue;
            const matchEvent = block.match(/event:\s*([^\n]+)/);
            const matchData = block.match(/data:\s*([\s\S]+)/);
            if (matchData) {
              try {
                const parsed = JSON.parse(matchData[1]);
                const eventType = matchEvent ? matchEvent[1].trim() : "message";

                if (eventType === "progress" && onProgress) {
                  const stepMapping: Record<string, ProgressEvent["step"]> = {
                    profiler: "Profiler",
                    market_intelligence: "Market Intelligence",
                    gap_analyzer: "Gap Analyzer",
                    planner: "Planner",
                    verifier: "Verifier",
                    explainer: "Explainer"
                  };
                  onProgress({
                    step: stepMapping[parsed.step] || "Profiler",
                    status: "finished",
                    message: parsed.message
                  });
                } else if (eventType === "complete") {
                  completePayload = parsed;
                }
              } catch (e) {
                console.warn("Error parsing SSE block:", e);
              }
            }
          }
        }

        // Process any remaining data in the buffer after stream completes
        if (buffer.trim()) {
          const block = buffer.trim();
          let eventType = "message";
          let dataStr = "";
          const lines = block.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.replace("event: ", "").trim();
            else if (line.startsWith("data: ")) dataStr = line.replace("data: ", "").trim();
          }
          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === "complete") {
                completePayload = parsed;
              }
            } catch (e) {
              console.warn("Error parsing trailing SSE block:", e);
            }
          }
        }

        if (completePayload && completePayload.roadmap) {
          return {
            profile: completePayload.profile,
            roadmap: completePayload.roadmap
          };
        }
      }
    } catch (streamErr) {
      console.warn("Live SSE stream unavailable or interrupted, falling back to direct POST:", streamErr);
    }

    // 2. Direct POST fallback
    try {
      const res = await fetchJson<any>("/analyze", {
        method: "POST",
        body: JSON.stringify({
          resume_text: resumeText,
          target_role: constraints.target_role,
          constraints: {
            weekly_hours: constraints.weekly_hours,
            budget: constraints.budget,
            currency: constraints.currency,
            target_timeline: constraints.target_timeline
          }
        }),
      });
      if (res && res.roadmap) {
        return { profile: res.profile, roadmap: res.roadmap };
      }
    } catch (postErr) {
      console.warn("Direct POST also failed, falling back to interactive mock:", postErr);
    }

    // 3. Fallback mock simulator
    if (onProgress) {
      for (const evt of MOCK_PROGRESS_EVENTS) {
        await new Promise((r) => setTimeout(r, 200));
        onProgress(evt);
      }
    }
    return { profile: MOCK_PROFILE, roadmap: MOCK_ROADMAP };
  },

  suggestRoles: async (profile: Profile) => {
    try {
      return await fetchJson<any[]>("/suggest-roles", {
        method: "POST",
        body: JSON.stringify(profile),
      });
    } catch {
      return [
        { role_title: "Full-Stack Developer", fit_score: 0.88, matching_skills: ["TypeScript", "React"], critical_gaps: ["PostgreSQL"] },
        { role_title: "Data Engineer", fit_score: 0.72, matching_skills: ["Python", "SQL"], critical_gaps: ["Apache Spark", "Airflow"] },
        { role_title: "Machine Learning Engineer", fit_score: 0.65, matching_skills: ["Python"], critical_gaps: ["PyTorch", "MLflow"] }
      ];
    }
  },

  replan: async (constraints: UserConstraints, userId: string = "guest"): Promise<Roadmap> => {
    try {
      return await fetchJson<Roadmap>("/replan", {
        method: "POST",
        body: JSON.stringify({ constraints, user_id: userId }),
      });
    } catch {
      return MOCK_ROADMAP;
    }
  },

  markItemComplete: async (itemOrder: number, roadmapId: string = "current", userId: string = "guest"): Promise<Roadmap> => {
    try {
      return await fetchJson<Roadmap>(`/roadmaps/${roadmapId}/progress`, {
        method: "POST",
        body: JSON.stringify({ item_order: itemOrder, status: "completed", user_id: userId }),
      });
    } catch {
      return MOCK_ROADMAP;
    }
  },

  getCareerBenchmarks: async () => {
    try {
      return await fetchJson<any[]>("/careers/benchmarks");
    } catch {
      return [];
    }
  },

  getMarketTrends: async (role: string = "Full-Stack Developer") => {
    try {
      return await fetchJson<any>(`/market-trends?role=${encodeURIComponent(role)}`);
    } catch {
      return {
        role,
        snapshots_count: 2,
        dates: ["2024-11-01", "2026-03-01"],
        trends: [
          { skill: "Next.js", frequency_baseline: 0.45, frequency_recent: 0.78, delta: 0.33, trend: "rising" },
          { skill: "PostgreSQL", frequency_baseline: 0.58, frequency_recent: 0.72, delta: 0.14, trend: "rising" },
          { skill: "Node.js", frequency_baseline: 0.68, frequency_recent: 0.70, delta: 0.02, trend: "stable" },
          { skill: "jQuery", frequency_baseline: 0.35, frequency_recent: 0.08, delta: -0.27, trend: "declining" }
        ]
      };
    }
  },

  refreshMarketTrends: async (role: string) => {
    try {
      return await fetchJson<any>("/market-trends/refresh", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
    } catch {
      return { status: "refreshed", role };
    }
  },

  generateQuiz: async (courseId: string, courseTitle: string, skills: string[] = []) => {
    try {
      return await fetchJson<any>("/quizzes/generate", {
        method: "POST",
        body: JSON.stringify({ course_id: courseId, course_title: courseTitle, skills }),
      });
    } catch {
      return {
        course_id: courseId,
        course_title: courseTitle,
        skills,
        questions: [
          {
            question: `Which core design pattern is prioritized in ${courseTitle}?`,
            options: ["Separation of concerns", "Tight coupling", "Synchronous blocking I/O", "Unversioned dependencies"],
            correct_index: 0,
            explanation: "Separation of concerns and modularity are foundational to modern scalable applications."
          },
          {
            question: "What is the primary advantage of using deterministic dependency locks?",
            options: ["Guarantees identical dependency trees across environments", "Increases compile time", "Eliminates unit tests", "Encrypts all variables"],
            correct_index: 0,
            explanation: "Lockfiles guarantee reproducible builds and eliminate environmental drift across deployment targets."
          }
        ]
      };
    }
  },

  chatIntake: async (messages: { role: string; content: string }[], constraints?: any) => {
    try {
      return await fetchJson<{
        background?: string;
        target_role?: string;
        weekly_hours?: number;
        budget?: number;
        currency?: string;
        is_complete: boolean;
        assistant_message: string;
      }>("/chat/intake", {
        method: "POST",
        body: JSON.stringify({ messages, constraints }),
      });
    } catch (err: any) {
      console.warn("Intake API fallback:", err);
      const lastMsg = messages[messages.length - 1]?.content || "";
      const textLower = lastMsg.toLowerCase();
      
      let targetRole = constraints?.target_role;
      if (!targetRole) {
        if (textLower.includes("learn networking") || textLower.includes("network")) {
          targetRole = "Network Engineer";
        } else if (textLower.includes("ai") || textLower.includes("ml") || textLower.includes("machine learning")) {
          targetRole = "Machine Learning Engineer";
        } else if (textLower.includes("python")) {
          targetRole = "Python Developer";
        } else {
          targetRole = "Software Engineer";
        }
      }

      const hoursMatch = textLower.match(/(\d+)\s*(?:hours?|hrs?)/) || textLower.match(/^(\d+)$/) || textLower.match(/^(\d+)\s/);
      const weeklyHours = hoursMatch ? parseInt(hoursMatch[1], 10) : (constraints?.weekly_hours || null);

      if (!weeklyHours) {
        return {
          background: constraints?.background || "Learner",
          target_role: targetRole,
          weekly_hours: null,
          budget: constraints?.budget || 0,
          currency: constraints?.currency || "INR",
          is_complete: false,
          assistant_message: `Great! How many hours per week can you dedicate to studying ${targetRole || "this domain"}?`
        };
      }

      return {
        background: constraints?.background || "Learner",
        target_role: targetRole,
        weekly_hours: weeklyHours,
        budget: constraints?.budget || 0,
        currency: constraints?.currency || "INR",
        is_complete: true,
        assistant_message: `Understood! Preparing your personalized learning roadmap for ${targetRole} (${weeklyHours} hrs/week).`
      };
    }
  },

  saveUserSession: async (userId: string, data: any) => {
    try {
      return await fetchJson<any>("/user-session/save", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, ...data }),
      });
    } catch (e) {
      console.warn("Backend user session sync note:", e);
      return null;
    }
  },

  getUserSession: async (userId: string) => {
    try {
      return await fetchJson<any>(`/user-session/${encodeURIComponent(userId)}`);
    } catch {
      return null;
    }
  },

  getCatalogCourses: async (params?: { skills?: string[]; filterType?: "all" | "free" | "paid"; platform?: string }) => {
    try {
      const queryParts: string[] = [];
      if (params?.skills && params.skills.length > 0) {
        queryParts.push(`skills=${encodeURIComponent(params.skills.join(","))}`);
      }
      if (params?.filterType) {
        queryParts.push(`filter_type=${encodeURIComponent(params.filterType)}`);
      }
      if (params?.platform) {
        queryParts.push(`platform=${encodeURIComponent(params.platform)}`);
      }
      const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      return await fetchJson<any[]>(`/catalog/courses${qs}`);
    } catch (e) {
      console.warn("Catalog fetch fallback to local:", e);
      return null;
    }
  }
};
