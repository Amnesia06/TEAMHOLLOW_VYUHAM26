import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ExternalLink,
  MessageSquare,
  Download,
  Calendar,
  Youtube,
  GraduationCap,
  Award,
  BookOpen,
  Code2,
  Sparkles
} from "lucide-react";
import { Roadmap, Course } from "../../types/contracts";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { CATALOG_COURSES } from "../../mocks/catalogData";
import { api } from "../../lib/api";

interface StudyModulesViewProps {
  roadmap: Roadmap | null;
  onNavigateToChat: () => void;
  targetRole?: string;
  currency?: "USD" | "INR";
}

const USD_TO_INR = 85.0;

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

  useEffect(() => {
    setSearchQuery("");
    setActiveFilter("all");
    setFreePlatformFilter("all");
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
        skills.add(s.toLowerCase());
      }
      for (const g of item.gaps_covered || []) {
        if (g.skill_id) skills.add(g.skill_id.toLowerCase());
      }
    }
    return skills;
  }, [roadmap]);

  // Helper to format course price
  const formatCost = (costUsd: number, courseCurrency?: string) => {
    if (costUsd === 0) return "Free (100% Free)";
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

  // Get matching catalog courses for specific skills
  const getCoursesForSkills = (skillList: string[]) => {
    const set = new Set(skillList.map((s) => s.toLowerCase()));
    return catalog.filter((c) => c.skills_covered.some((s) => set.has(s.toLowerCase())));
  };

  // Find all free and paid courses relevant to the user's roadmap
  const allRoadmapCourses = useMemo(() => {
    if (roadmapSkillIds.size === 0) return catalog;
    return catalog.filter((c) =>
      c.skills_covered.some((s) => roadmapSkillIds.has(s.toLowerCase()))
    );
  }, [catalog, roadmapSkillIds]);

  const allFreeCourses = useMemo(() => {
    return allRoadmapCourses.filter((c) => c.cost === 0);
  }, [allRoadmapCourses]);

  const allPaidCourses = useMemo(() => {
    return allRoadmapCourses.filter((c) => c.cost > 0);
  }, [allRoadmapCourses]);

  // If no roadmap has been generated yet
  if (!roadmap || !roadmap.items || roadmap.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 text-center space-y-4">
        <Card className="p-10 space-y-5 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4648d4] flex items-center justify-center mx-auto shadow-xs">
            <Search className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">No Study Modules Selected Yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Study modules are selected dynamically by our optimization engine to close your specific target role gaps. Submit your background in the Chat Assistant to generate your verified path.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToChat}
            className="gap-2 mx-auto bg-[#4648d4] hover:bg-[#393bb3] text-white"
          >
            <MessageSquare className="w-4 h-4" />
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
    const titleMatch = c.title.toLowerCase().includes(q);
    const platformMatch = c.platform.toLowerCase().includes(q);
    const skillMatch = c.skills_covered.some((s) => s.toLowerCase().includes(q));
    return titleMatch || platformMatch || skillMatch;
  });

  const filteredPaidCourses = allPaidCourses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q);
    const platformMatch = c.platform.toLowerCase().includes(q);
    const skillMatch = c.skills_covered.some((s) => s.toLowerCase().includes(q));
    return titleMatch || platformMatch || skillMatch;
  });

  const filteredAllModules = allItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = item.course.title.toLowerCase().includes(q);
    const platformMatch = item.course.platform.toLowerCase().includes(q);
    const skillMatch = item.course.skills_covered.some((s) => s.toLowerCase().includes(q));
    return titleMatch || platformMatch || skillMatch;
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Curated Study Modules
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Free & Paid Options
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Targeted study curriculum with direct free YouTube links, edX courses, freeCodeCamp, and industry-recognized certifications.
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4648d4]"></span>
            {totalHours.toFixed(0)} total hours
          </span>
          <span className="text-slate-300">·</span>
          <span>{totalWeeks.toFixed(1)} weeks</span>
          <span className="text-slate-300">·</span>
          <span className="text-emerald-700 font-bold">100% Verified Links</span>
        </div>
      </section>

      {/* Filter and Search Toolbar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube, edX, certs, skills (e.g. React, Python)..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200/80 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 transition-all duration-200"
          />
        </div>

        {/* Primary Filter Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-white text-[#4648d4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Roadmap Modules</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {allItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("free")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "free"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Free Resources</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {allFreeCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "paid"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Paid Certs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {allPaidCourses.length}
            </span>
          </button>
        </div>
      </section>

      {/* Free Platform Secondary Pills (Visible when in Free tab) */}
      {activeFilter === "free" && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Filter Platform:
          </span>

          <button
            type="button"
            onClick={() => setFreePlatformFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              freePlatformFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            All Free ({allFreeCourses.length})
          </button>

          <button
            type="button"
            onClick={() => setFreePlatformFilter("youtube")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              freePlatformFilter === "youtube"
                ? "bg-red-600 text-white"
                : "bg-white text-red-700 hover:bg-red-50 border border-red-200"
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube Courses ({allFreeCourses.filter(isYouTube).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFreePlatformFilter("edx")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              freePlatformFilter === "edx"
                ? "bg-[#0b2b47] text-white"
                : "bg-white text-[#0b2b47] hover:bg-sky-50 border border-sky-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-sky-700" />
            <span>edX Free Audit ({allFreeCourses.filter(isEdX).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFreePlatformFilter("freecodecamp")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              freePlatformFilter === "freecodecamp"
                ? "bg-[#0a0a23] text-white"
                : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>freeCodeCamp ({allFreeCourses.filter(isFreeCodeCamp).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFreePlatformFilter("other")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              freePlatformFilter === "other"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>MIT OCW & Docs ({allFreeCourses.filter((c) => !isYouTube(c) && !isEdX(c) && !isFreeCodeCamp(c)).length})</span>
          </button>
        </div>
      )}

      {/* VIEW 1: FREE RESOURCES SECTION */}
      {activeFilter === "free" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Showing {filteredFreeCourses.length} free learning resources (YouTube, edX, freeCodeCamp)
            </span>
            <span className="text-emerald-700 font-semibold">
              Always 100% Free Access
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFreeCourses.map((course) => {
              const yt = isYouTube(course);
              const edx = isEdX(course);
              const fcc = isFreeCodeCamp(course);

              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl bg-white p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {yt ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
                            <Youtube className="w-3.5 h-3.5 text-red-600" />
                            YouTube Full Course
                          </span>
                        ) : edx ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
                            <GraduationCap className="w-3.5 h-3.5 text-sky-700" />
                            edX Free Audit
                          </span>
                        ) : fcc ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <Code2 className="w-3.5 h-3.5 text-emerald-700" />
                            freeCodeCamp Interactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            Free Curriculum
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Free
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 font-medium">
                        {course.hours}h duration
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#4648d4] transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Platform: <span className="text-slate-800 font-semibold">{course.platform}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {course.skills_covered.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-mono"
                        >
                          {s.replace("skill_", "")}
                        </span>
                      ))}
                    </div>

                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        yt
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                          : "bg-[#4648d4] hover:bg-[#393bb3] text-white shadow-xs"
                      }`}
                    >
                      {yt ? (
                        <>
                          <span>Watch on YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Start Learning</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      )}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PAID CERTIFICATIONS SECTION */}
      {activeFilter === "paid" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Showing {filteredPaidCourses.length} industry-recognized certifications and professional programs
            </span>
            <span className="text-amber-700 font-semibold">
              Verified Official Credentials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPaidCourses.map((course) => {
              const formattedPrice = formatCost(course.cost, course.currency);

              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl bg-white p-5 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-semibold">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          Industry Certification
                        </span>

                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 font-mono">
                          {formattedPrice}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 font-medium">
                        Level {course.level === 3 ? "Advanced" : "Associate"} · ~{course.hours}h
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Issuing Body / Platform:{" "}
                      <span className="text-slate-900 font-semibold">{course.platform}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {course.skills_covered.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-mono border border-amber-100"
                        >
                          {s.replace("skill_", "")}
                        </span>
                      ))}
                    </div>

                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                    >
                      <span>Enroll / Register</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: ALL ROADMAP MODULES (Topological Timeline with Free & Paid Options) */}
      {activeFilter === "all" && (
        <div
          className="relative max-w-4xl mx-auto w-full py-8 px-2"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(203, 213, 225) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Central Vertical Timeline Wire */}
          <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-slate-300/80 z-0" />

          <div className="flex flex-col gap-8 relative z-10">
            {filteredAllModules.map((item, idx) => {
              const isLeft = idx % 2 === 0;
              const course = item.course;
              const isFree = item.cost === 0 || course.cost === 0;
              const primarySkill = course.skills_covered[0] || "core_skill";

              // Find alternative free options and paid certs matching this module's skills
              const moduleCourses = getCoursesForSkills(course.skills_covered);
              const ytOption = moduleCourses.find((c) => isYouTube(c) && c.id !== course.id);
              const edxOption = moduleCourses.find((c) => isEdX(c) && c.id !== course.id);
              const fccOption = moduleCourses.find((c) => isFreeCodeCamp(c) && c.id !== course.id);
              const paidOption = moduleCourses.find((c) => c.cost > 0);

              const cardContent = (
                <article className="module-card flex flex-col justify-between rounded-xl bg-white p-5 border border-slate-200/80 hover:border-[#4648d4]/40 hover:shadow-md transition-all duration-200 h-full space-y-4">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-[#4648d4] font-bold">
                          Module {String(item.order || idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-700 font-semibold">
                          {isFree ? "Free Course" : formatCost(item.cost || course.cost, course.currency)}
                        </span>
                      </div>

                      {course.url && (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md text-white bg-[#4648d4] hover:bg-[#393bb3] text-xs font-semibold transition-colors shadow-xs"
                        >
                          <span>Visit Course</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Course Title & Platform */}
                    <div className="my-2.5">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>Platform:</span>
                        <span className="text-slate-800 font-semibold">{course.platform}</span>
                      </p>
                    </div>

                    {/* Quick Free & Paid Resource Links for this specific module */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Available Resources for this Skill:
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {ytOption && (
                          <a
                            href={ytOption.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                            title={`YouTube: ${ytOption.title}`}
                          >
                            <Youtube className="w-3 h-3 text-red-600" />
                            <span>YouTube Video</span>
                          </a>
                        )}

                        {edxOption && (
                          <a
                            href={edxOption.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors"
                            title={`edX: ${edxOption.title}`}
                          >
                            <GraduationCap className="w-3 h-3 text-sky-700" />
                            <span>edX Free Audit</span>
                          </a>
                        )}

                        {fccOption && (
                          <a
                            href={fccOption.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title={`freeCodeCamp: ${fccOption.title}`}
                          >
                            <Code2 className="w-3 h-3 text-emerald-700" />
                            <span>freeCodeCamp</span>
                          </a>
                        )}

                        {paidOption && (
                          <a
                            href={paidOption.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors"
                            title={`Paid Cert: ${paidOption.title} (${formatCost(paidOption.cost, paidOption.currency)})`}
                          >
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Paid Cert ({formatCost(paidOption.cost, paidOption.currency)})</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
                    <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-mono text-[11px]">
                      {primarySkill.replace("skill_", "")}
                    </span>
                    <span className="text-slate-500 text-xs ml-auto font-medium">
                      Weeks {item.start_week.toFixed(0)}–{item.end_week.toFixed(0)} ({item.hours.toFixed(0)}h)
                    </span>
                  </div>
                </article>
              );

              return (
                <div
                  key={item.order || idx}
                  className="flex flex-col md:flex-row items-center md:justify-between w-full relative"
                >
                  {/* Left Column */}
                  <div className="w-full md:w-[calc(50%-28px)]">
                    {isLeft ? cardContent : <div className="hidden md:block" />}
                  </div>

                  {/* Central Topological Node Dot */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-[#4648d4] items-center justify-center z-20 shadow-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4648d4]" />
                  </div>

                  {/* Right Column */}
                  <div className="w-full md:w-[calc(50%-28px)] mt-4 md:mt-0">
                    {!isLeft ? cardContent : <div className="hidden md:block" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Algorithm Feedback & Actions Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 text-slate-500 text-xs font-semibold">
        <p>
          Target Role: <span className="text-slate-900 font-bold">{targetRole || "Verified Learning Path"}</span> · {allItems.length} Milestones · {allFreeCourses.length} Free Options · {allPaidCourses.length} Paid Certifications
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSyllabus}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export Syllabus & Links
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToChat}
            className="gap-1.5 text-xs bg-[#4648d4] hover:bg-[#393bb3] text-white"
          >
            <Calendar className="w-3.5 h-3.5" />
            Sync Schedule in Chat
          </Button>
        </div>
      </section>
    </div>
  );
};
