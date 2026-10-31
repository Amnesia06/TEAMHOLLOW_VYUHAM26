import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ExternalLink,
  MessageSquare,
  Download,
  Calendar,
  ChevronDown,
  Check
} from "lucide-react";
import { Roadmap, Course } from "../../types/contracts";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { CATALOG_COURSES } from "../../mocks/catalogData";
import { api } from "../../lib/api";
import { getPracticalGuideForSkill } from "../../mocks/moduleProjectsAndQuestions";

interface StudyModulesViewProps {
  roadmap: Roadmap | null;
  onNavigateToChat: () => void;
  targetRole?: string;
  currency?: "USD" | "INR";
}

const USD_TO_INR = 85.0;

const SKILL_ALIASES: Record<string, string[]> = {
  skill_pg_04: ["skill_postgresql", "skill_sql"],
  skill_postgresql: ["skill_pg_04", "skill_sql"],
  skill_postgres: ["skill_postgresql", "skill_sql"],
  skill_sql_01: ["skill_sql", "skill_postgresql"],
  skill_sql: ["skill_postgresql", "skill_sql_01"],
  skill_ts_01: ["skill_typescript", "skill_javascript"],
  skill_typescript: ["skill_ts_01", "skill_javascript"],
  skill_react_02: ["skill_react", "skill_javascript", "skill_nextjs"],
  skill_react: ["skill_react_02", "skill_javascript", "skill_nextjs"],
  skill_node_03: ["skill_nodejs", "skill_javascript", "skill_rest_apis"],
  skill_nodejs: ["skill_node_03", "skill_javascript", "skill_rest_apis"],
  skill_nextjs: ["skill_react", "skill_typescript"],
  skill_python: ["skill_fastapi", "skill_django", "skill_pandas", "skill_data_engineering"],
  skill_docker: ["skill_kubernetes", "skill_devops", "skill_ci_cd"],
  skill_aws: ["skill_cloud", "skill_devops", "skill_terraform"],
  skill_git: ["skill_github", "skill_devops"],
};

const KEYWORD_TO_SKILLS: Record<string, string[]> = {
  postgres: ["skill_postgresql", "skill_sql"],
  postgresql: ["skill_postgresql", "skill_sql"],
  sql: ["skill_sql", "skill_postgresql"],
  react: ["skill_react", "skill_javascript"],
  next: ["skill_nextjs", "skill_react"],
  node: ["skill_nodejs", "skill_rest_apis"],
  typescript: ["skill_typescript"],
  git: ["skill_git"],
  docker: ["skill_docker", "skill_linux"],
  aws: ["skill_aws", "skill_cloud"],
  python: ["skill_python"],
  kubernetes: ["skill_kubernetes"],
  terraform: ["skill_terraform"],
};

export const StudyModulesView: React.FC<StudyModulesViewProps> = ({
  roadmap,
  onNavigateToChat,
  targetRole,
  currency = "INR",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "paid">("all");
  const [freePlatformFilter, setFreePlatformFilter] = useState<"all" | "youtube" | "edx" | "freecodecamp" | "other">("all");
  const [catalog, setCatalog] = useState<Course[]>(CATALOG_COURSES);

  // Practical Guide state: Minimalist accordion, task checklist, and question toggles
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    module_1: true,
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [moduleSubTabs, setModuleSubTabs] = useState<Record<string, "project" | "questions">>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleQuestion = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const setSubTabForModule = (moduleId: string, tab: "project" | "questions") => {
    setModuleSubTabs((prev) => ({ ...prev, [moduleId]: tab }));
  };

  useEffect(() => {
    setSearchQuery("");
    setActiveFilter("all");
    setFreePlatformFilter("all");
    setExpandedModules({ module_1: true });
  }, [roadmap]);

  // Fetch fresh catalog from backend on mount, falling back to CATALOG_COURSES
  useEffect(() => {
    let isMounted = true;
    api.getCatalogCourses().then((data) => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setCatalog(data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Collect all unique skills needed across all roadmap items
  const roadmapSkillIds = useMemo(() => {
    if (!roadmap?.items) return new Set<string>();
    const skills = new Set<string>();
    for (const item of roadmap.items) {
      for (const s of item.course.skills_covered || []) {
        const lower = s.toLowerCase();
        skills.add(lower);
        if (SKILL_ALIASES[lower]) {
          SKILL_ALIASES[lower].forEach((alias) => skills.add(alias));
        }
      }
      for (const g of item.gaps_covered || []) {
        if (g.skill_id) {
          const lower = g.skill_id.toLowerCase();
          skills.add(lower);
          if (SKILL_ALIASES[lower]) {
            SKILL_ALIASES[lower].forEach((alias) => skills.add(alias));
          }
        }
      }
      const titleLower = item.course.title.toLowerCase();
      for (const [kw, mappedSkills] of Object.entries(KEYWORD_TO_SKILLS)) {
        if (titleLower.includes(kw)) {
          mappedSkills.forEach((ms) => skills.add(ms));
        }
      }
    }
    return skills;
  }, [roadmap]);

  // Helper to format course price
  const formatCost = (costUsd: number, courseCurrency?: string) => {
    if (costUsd === 0) return "Free";
    if (currency === "INR" || courseCurrency === "INR") {
      const inrValue = courseCurrency === "INR" ? costUsd : Math.round(costUsd * USD_TO_INR);
      return `₹${inrValue.toLocaleString("en-IN")}`;
    }
    return `$${costUsd.toFixed(0)}`;
  };

  // Classify platform helpers
  const isYouTube = (c: Course) => c.platform.toLowerCase().includes("youtube");
  const isEdX = (c: Course) => c.platform.toLowerCase().includes("edx");
  const isFreeCodeCamp = (c: Course) => c.platform.toLowerCase().includes("freecodecamp");

  // Find all free and paid courses relevant to the user's roadmap
  const allRoadmapCourses = useMemo(() => {
    if (roadmapSkillIds.size === 0) return catalog;
    const matched = catalog.filter((c) =>
      c.skills_covered.some((s) => roadmapSkillIds.has(s.toLowerCase()))
    );
    return matched.length > 0 ? matched : catalog;
  }, [catalog, roadmapSkillIds]);

  const allFreeCourses = useMemo(() => {
    const free = allRoadmapCourses.filter((c) => c.cost === 0);
    return free.length > 0 ? free : catalog.filter((c) => c.cost === 0);
  }, [allRoadmapCourses, catalog]);

  const allPaidCourses = useMemo(() => {
    const paid = allRoadmapCourses.filter((c) => c.cost > 0);
    return paid.length > 0 ? paid : catalog.filter((c) => c.cost > 0);
  }, [allRoadmapCourses, catalog]);

  // If no roadmap has been generated yet
  if (!roadmap || !roadmap.items || roadmap.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <Card className="p-8 space-y-4 text-center bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">No Study Modules Selected Yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Study modules are generated dynamically based on your target role gaps. Start by sharing your background in the Chat tab.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToChat}
            className="gap-2 mx-auto bg-slate-900 hover:bg-slate-800 text-white text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Analyze Profile in Chat
          </Button>
        </Card>
      </div>
    );
  }

  const allItems = roadmap.items;
  const totalHours = roadmap.total_hours || allItems.reduce((acc, it) => acc + (it.hours || 0), 0);
  const totalWeeks = roadmap.total_weeks || Math.max(...allItems.map((it) => it.end_week || 1), 1);

  // Filter modules/courses based on active search & filter mode
  const filteredFreeCourses = allFreeCourses.filter((c) => {
    if (freePlatformFilter === "youtube" && !isYouTube(c)) return false;
    if (freePlatformFilter === "edx" && !isEdX(c)) return false;
    if (freePlatformFilter === "freecodecamp" && !isFreeCodeCamp(c)) return false;
    if (freePlatformFilter === "other" && (isYouTube(c) || isEdX(c) || isFreeCodeCamp(c))) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q) || c.skills_covered.some((s) => s.toLowerCase().includes(q));
  });

  const filteredPaidCourses = allPaidCourses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q) || c.skills_covered.some((s) => s.toLowerCase().includes(q));
  });

  const filteredAllModules = allItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.course.title.toLowerCase().includes(q) || item.course.platform.toLowerCase().includes(q) || item.course.skills_covered.some((s) => s.toLowerCase().includes(q));
  });

  // Export syllabus function
  const handleExportSyllabus = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          targetRole: targetRole || "Verified Role Path",
          totalHours,
          totalWeeks,
          currency,
          modules: allItems.map((it) => ({
            order: it.order,
            title: it.course.title,
            platform: it.course.platform,
            url: it.course.url,
            hours: it.hours,
            cost: it.cost,
            weeks: `${it.start_week} - ${it.end_week}`,
            skills: it.course.skills_covered,
          })),
          paidCertifications: allPaidCourses.map((c) => ({
            title: c.title,
            platform: c.platform,
            cost: formatCost(c.cost, c.currency),
            url: c.url,
            hours: c.hours,
            skills: c.skills_covered,
          })),
          freeResources: allFreeCourses.map((c) => ({
            title: c.title,
            platform: c.platform,
            url: c.url,
            hours: c.hours,
            skills: c.skills_covered,
          }))
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pathwise_study_modules_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const allModulesOpen = filteredAllModules.every((it, idx) => expandedModules[`module_${it.order || idx + 1}`]);
  const toggleAllModules = () => {
    const next: Record<string, boolean> = {};
    filteredAllModules.forEach((it, idx) => {
      next[`module_${it.order || idx + 1}`] = !allModulesOpen;
    });
    setExpandedModules(next);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 py-3">
      {/* Minimalist Header */}
      <section className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-200/70">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Study Modules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hands-on capstones, technical interview preparation, and curated learning tracks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
          <span>{allItems.length} milestones</span>
          <span>·</span>
          <span>{totalHours.toFixed(0)} hrs</span>
          <span>·</span>
          <span>{totalWeeks.toFixed(0)} wks</span>
        </div>
      </section>

      {/* Minimalist Controls Toolbar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills or courses..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {/* Minimalist Segmented Tabs */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/60 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Capstones & Interview Prep</span>
            <span className="font-mono text-[10px] text-slate-400">({allItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("free")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "free"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Free Resources</span>
            <span className="font-mono text-[10px] text-slate-400">({allFreeCourses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("paid")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "paid"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Certifications</span>
            <span className="font-mono text-[10px] text-slate-400">({allPaidCourses.length})</span>
          </button>
        </div>
      </section>

      {/* Secondary filter for Free Resources */}
      {activeFilter === "free" && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1">FILTER:</span>
          {(
            [
              { key: "all", label: `All (${allFreeCourses.length})` },
              { key: "youtube", label: `YouTube (${allFreeCourses.filter(isYouTube).length})` },
              { key: "edx", label: `edX (${allFreeCourses.filter(isEdX).length})` },
              { key: "freecodecamp", label: `freeCodeCamp (${allFreeCourses.filter(isFreeCodeCamp).length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFreePlatformFilter(item.key)}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                freePlatformFilter === item.key
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: CAPSTONE PROJECTS & INTERVIEW PREP (MINIMALIST ACCORDION) */}
      {activeFilter === "all" && (
        <div className="space-y-3 pt-1">
          {/* Quick Toolbar to Expand / Collapse All */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
            <span className="font-mono text-[11px]">
              {filteredAllModules.length} MILESTONE TRACKS
            </span>
            <button
              type="button"
              onClick={toggleAllModules}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {allModulesOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredAllModules.map((item, idx) => {
              const course = item.course;
              const primarySkill = course.skills_covered[0] || "core_skill";
              const practical = getPracticalGuideForSkill(primarySkill, course.title);
              const moduleId = `module_${item.order || idx + 1}`;
              const isOpen = !!expandedModules[moduleId];
              const activeSubTab = moduleSubTabs[moduleId] || "project";

              const deliverables = practical.project.deliverables;
              const completedInModule = deliverables.filter((_, dIdx) => completedTasks[`${moduleId}_task_${dIdx}`]).length;
              const progressPct = deliverables.length > 0 ? Math.round((completedInModule / deliverables.length) * 100) : 0;

              return (
                <div
                  key={moduleId}
                  className="rounded-xl border border-slate-200/80 bg-white transition-all overflow-hidden"
                >
                  {/* Minimalist Module Bar */}
                  <div
                    onClick={() => toggleModule(moduleId)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-semibold text-slate-400 shrink-0 w-6">
                        {String(item.order || idx + 1).padStart(2, "0")}
                      </span>

                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {course.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 shrink-0">
                          {primarySkill.replace("skill_", "")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400">
                        {completedInModule > 0
                          ? `${completedInModule}/${deliverables.length} done`
                          : `Weeks ${item.start_week.toFixed(0)}–${item.end_week.toFixed(0)}`}
                      </span>

                      {/* Sub-tab Pill Switcher */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center p-0.5 rounded-md bg-slate-100 text-[11px]"
                      >
                        <button
                          type="button"
                          onClick={() => setSubTabForModule(moduleId, "project")}
                          className={`px-2 py-0.5 rounded font-medium transition-all ${
                            activeSubTab === "project"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Project
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubTabForModule(moduleId, "questions")}
                          className={`px-2 py-0.5 rounded font-medium transition-all ${
                            activeSubTab === "questions"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          5 Q&As
                        </button>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Minimalist Content */}
                  {isOpen && (
                    <div className="border-t border-slate-100 p-4 space-y-4 bg-white">
                      {/* SUB-VIEW 1: CAPSTONE PROJECT */}
                      {activeSubTab === "project" && (
                        <div className="space-y-3.5">
                          <div>
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <h4 className="text-xs font-bold text-slate-900">
                                {practical.project.title}
                              </h4>
                              {course.url && (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 shrink-0"
                                >
                                  <span>{course.platform}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {practical.project.description}
                            </p>
                          </div>

                          {/* Minimalist Deliverables Checklist */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>DELIVERABLES ({completedInModule}/{deliverables.length})</span>
                              {completedInModule > 0 && (
                                <span className="text-emerald-600 font-medium">{progressPct}% complete</span>
                              )}
                            </div>

                            <div className="space-y-1">
                              {deliverables.map((task, dIdx) => {
                                const taskId = `${moduleId}_task_${dIdx}`;
                                const isDone = !!completedTasks[taskId];

                                return (
                                  <div
                                    key={taskId}
                                    onClick={() => toggleTask(taskId)}
                                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group select-none"
                                  >
                                    <div
                                      className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                        isDone
                                          ? "bg-slate-900 border-slate-900 text-white"
                                          : "border-slate-300 group-hover:border-slate-400"
                                      }`}
                                    >
                                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span
                                      className={`text-xs leading-relaxed transition-colors ${
                                        isDone ? "line-through text-slate-400" : "text-slate-700"
                                      }`}
                                    >
                                      {task}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Minimalist Proof of Mastery */}
                          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2">
                            <span className="font-semibold text-slate-700 shrink-0 text-[11px] font-mono">
                              PROOF OF MASTERY:
                            </span>
                            <span className="text-slate-500 text-xs leading-relaxed">
                              {practical.project.proofOfMastery}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SUB-VIEW 2: TOP 5 INTERVIEW QUESTIONS */}
                      {activeSubTab === "questions" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                            <span>TOP 5 TECHNICAL QUESTIONS</span>
                            <button
                              type="button"
                              onClick={() => {
                                const allOpen = practical.interviewQuestions.every((q) => expandedQuestions[q.id]);
                                const updated = { ...expandedQuestions };
                                practical.interviewQuestions.forEach((q) => {
                                  updated[q.id] = !allOpen;
                                });
                                setExpandedQuestions(updated);
                              }}
                              className="text-xs text-slate-500 hover:text-slate-900 font-sans cursor-pointer"
                            >
                              {practical.interviewQuestions.every((q) => expandedQuestions[q.id])
                                ? "Collapse answers"
                                : "Reveal all"}
                            </button>
                          </div>

                          <div className="space-y-1 divide-y divide-slate-100">
                            {practical.interviewQuestions.map((q, qIdx) => {
                              const isQOpen = !!expandedQuestions[q.id];

                              return (
                                <div key={q.id} className="pt-2 first:pt-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleQuestion(q.id)}
                                    className="w-full text-left py-1 flex items-start justify-between gap-3 group cursor-pointer"
                                  >
                                    <span className="text-xs font-medium text-slate-800 group-hover:text-slate-900 leading-snug">
                                      <span className="text-slate-400 font-mono mr-1.5">0{qIdx + 1}.</span>
                                      {q.question}
                                    </span>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 transition-transform duration-150 ${
                                        isQOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>

                                  {isQOpen && (
                                    <div className="mt-1.5 mb-2 pl-4 text-xs text-slate-600 leading-relaxed space-y-2">
                                      <p className="bg-slate-50 p-2.5 rounded-lg text-slate-700 border border-slate-100 leading-relaxed">
                                        {q.answer}
                                      </p>
                                      {q.keyConcepts && q.keyConcepts.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-[10px] text-slate-400 font-mono">CONCEPTS:</span>
                                          {q.keyConcepts.map((kc, kidx) => (
                                            <span
                                              key={kidx}
                                              className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded"
                                            >
                                              {kc}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FREE RESOURCES */}
      {activeFilter === "free" && (
        <div className="space-y-3 pt-1">
          <div className="text-xs text-slate-400 font-mono px-0.5">
            {filteredFreeCourses.length} FREE COURSES & RESOURCES
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFreeCourses.map((course) => {
              const yt = isYouTube(course);

              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200/80 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        {course.platform}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {course.hours}h
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {course.skills_covered.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                          {s.replace("skill_", "")}
                        </span>
                      ))}
                    </div>

                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      <span>{yt ? "Watch" : "Open"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAID CERTIFICATIONS */}
      {activeFilter === "paid" && (
        <div className="space-y-3 pt-1">
          <div className="text-xs text-slate-400 font-mono px-0.5">
            {filteredPaidCourses.length} PROFESSIONAL CERTIFICATIONS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPaidCourses.map((course) => {
              const formattedPrice = formatCost(course.cost, course.currency);

              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200/80 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        {course.platform}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        {formattedPrice}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {course.skills_covered.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                          {s.replace("skill_", "")}
                        </span>
                      ))}
                    </div>

                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      <span>Enroll</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimalist Footer Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70 text-xs text-slate-400 font-mono">
        <p>
          Role: <span className="text-slate-700 font-semibold">{targetRole || "Verified Role Path"}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSyllabus}
            className="h-7 text-xs text-slate-600 gap-1.5"
          >
            <Download className="w-3 h-3" />
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToChat}
            className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <Calendar className="w-3 h-3" />
            Sync with Schedule
          </Button>
        </div>
      </section>
    </div>
  );
};
