import React, { useState, useEffect } from "react";
import { Search, ExternalLink, MessageSquare, Download, Calendar } from "lucide-react";
import { Roadmap } from "../../types/contracts";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface StudyModulesViewProps {
  roadmap: Roadmap | null;
  onNavigateToChat: () => void;
  targetRole?: string;
}

export const StudyModulesView: React.FC<StudyModulesViewProps> = ({
  roadmap,
  onNavigateToChat,
  targetRole,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    setSearchQuery("");
    setActiveFilter("all");
  }, [roadmap]);

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

  // Filter modules
  const filtered = allItems.filter((item) => {
    const isFree = item.cost === 0 || item.course.cost === 0;
    if (activeFilter === "free" && !isFree) return false;
    if (activeFilter === "paid" && isFree) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = item.course.title.toLowerCase().includes(q);
    const platformMatch = item.course.platform.toLowerCase().includes(q);
    const skillMatch = item.course.skills_covered.some((s) => s.toLowerCase().includes(q));
    return titleMatch || platformMatch || skillMatch;
  });

  const freeCount = allItems.filter((it) => it.cost === 0 || it.course.cost === 0).length;
  const paidCount = allItems.length - freeCount;

  // Export syllabus function
  const handleExportSyllabus = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          targetRole: targetRole || "Verified Role Path",
          totalHours,
          totalWeeks,
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
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pathwise_syllabus_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* Hero Header Section from DESIGN.md */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Curated Study Modules
          </h1>
          <p className="text-sm text-slate-500">
            Targeted modules aligned to close role-specific competency gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4648d4]"></span>
            {totalHours.toFixed(0)} total hours
          </span>
          <span className="text-slate-300">·</span>
          <span>{totalWeeks.toFixed(1)} weeks</span>
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
            placeholder="Search modules or skills..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200/80 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 transition-all duration-200"
          />
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-white text-[#4648d4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("free")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "free"
                ? "bg-white text-[#4648d4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Free ({freeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "paid"
                ? "bg-white text-[#4648d4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paid Certs ({paidCount})
          </button>
        </div>
      </section>

      {/* Alternating Topological Timeline Grid Canvas */}
      <div
        className="relative max-w-3xl mx-auto w-full py-8 px-2"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(203, 213, 225) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Central Vertical Timeline Wire */}
        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-slate-300/80 z-0" />

        <div className="flex flex-col gap-6 relative z-10">
          {filtered.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const course = item.course;
            const isFree = item.cost === 0 || course.cost === 0;
            const primarySkill = course.skills_covered[0] || "core_skill";

            const cardContent = (
              <article className="module-card flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200/80 hover:border-[#4648d4]/40 hover:shadow-sm transition-all duration-200 h-full min-h-[160px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-[#4648d4] font-bold">
                      Module {String(item.order || idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-700 font-semibold">
                      {isFree ? "Free" : `${course.currency || "INR"} ${item.cost || course.cost}`}
                    </span>
                  </div>

                  {course.url && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[#4648d4] hover:bg-slate-100 text-xs font-semibold transition-colors"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="my-2">
                  <h3 className="text-base font-semibold text-slate-900 line-clamp-1" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{course.platform}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-mono text-[11px]">
                    {primarySkill}
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
                <div className="w-full md:w-[calc(50%-24px)]">
                  {isLeft ? cardContent : <div className="hidden md:block" />}
                </div>

                {/* Central Topological Node Dot */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#4648d4] items-center justify-center z-20 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#4648d4]" />
                </div>

                {/* Right Column */}
                <div className="w-full md:w-[calc(50%-24px)] mt-4 md:mt-0">
                  {!isLeft ? cardContent : <div className="hidden md:block" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Feedback & Actions Bar from DESIGN.md */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 text-slate-500 text-xs font-semibold">
        <p>
          Showing {filtered.length} of {allItems.length} modules · Target: {targetRole || "Active Learning Path"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSyllabus}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export Syllabus
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToChat}
            className="gap-1.5 text-xs bg-[#4648d4] hover:bg-[#393bb3] text-white"
          >
            <Calendar className="w-3.5 h-3.5" />
            Sync Schedule
          </Button>
        </div>
      </section>
    </div>
  );
};
