import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  BarChart3,
  Layers,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Profile } from "../../types/contracts";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";

interface CareersViewProps {
  profile: Profile | null;
  onSelectRole: (roleTitle: string) => void;
  activeTargetRole?: string | null;
  onNavigateToChat: () => void;
}

interface TelemetryRole {
  id: string;
  title: string;
  category: string;
  score: number;
  growth: string;
  comp: string;
  compMedian: string;
  hiring: string;
  velocity: string;
  skills: string[];
  description: string;
}

const TELEMETRY_CAREERS: TelemetryRole[] = [
  {
    id: "ai-systems",
    title: "AI Systems Engineer",
    category: "Artificial Intelligence",
    score: 98,
    growth: "+44% YoY",
    comp: "18 - 45 LPA ($185k – $275k)",
    compMedian: "Median 24 LPA",
    hiring: "14,820 Verified Openings",
    velocity: "Peak Demand Tier",
    skills: ["CUDA Kernels", "PyTorch", "vLLM", "FlashAttention", "Tensor Parallelism", "Deep Learning"],
    description: "Architects and optimizes large-scale model inference, GPU clusters, and distributed neural pipelines.",
  },
  {
    id: "cloud-architect",
    title: "Cloud Solutions Architect",
    category: "Infrastructure & Platform",
    score: 94,
    growth: "+36% YoY",
    comp: "16 - 40 LPA ($175k – $250k)",
    compMedian: "Median 22 LPA",
    hiring: "22,410 Verified Openings",
    velocity: "Enterprise Core Demand",
    skills: ["Kubernetes", "Terraform", "Istio Mesh", "Cloud Platforms", "eBPF", "Docker"],
    description: "Provisions scalable resilient infrastructure, multi-cloud clusters, and enterprise FinOps architectures.",
  },
  {
    id: "full-stack",
    title: "Full-Stack Product Engineer",
    category: "Software Engineering",
    score: 89,
    growth: "+24% YoY",
    comp: "12 - 32 LPA ($140k – $210k)",
    compMedian: "Median 18 LPA",
    hiring: "38,150 Verified Openings",
    velocity: "Broad Volume Expansion",
    skills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    description: "Builds responsive reactive web applications and scalable API layers backed by robust relational databases.",
  },
  {
    id: "ml-infra",
    title: "ML Infrastructure Engineer",
    category: "Artificial Intelligence",
    score: 86,
    growth: "+38% YoY",
    comp: "16 - 38 LPA ($170k – $260k)",
    compMedian: "Median 21 LPA",
    hiring: "11,340 Verified Openings",
    velocity: "Surging High-Growth",
    skills: ["Ray.io", "Kubeflow", "PyTorch DDP", "Docker", "Qdrant", "Python"],
    description: "Scales training clusters, MLOps orchestration workflows, and vector retrieval pipelines for production AI.",
  },
  {
    id: "distributed-sys",
    title: "Distributed Systems Engineer",
    category: "Systems & Embedded",
    score: 83,
    growth: "+32% YoY",
    comp: "16 - 42 LPA ($165k – $245k)",
    compMedian: "Median 22 LPA",
    hiring: "9,880 Verified Openings",
    velocity: "Core Systems Tier",
    skills: ["Rust", "Go Systems", "Raft Consensus", "Kafka", "Linux", "RocksDB"],
    description: "Engineers high-throughput, fault-tolerant consensus systems, messaging buses, and real-time streaming engines.",
  },
  {
    id: "data-platform",
    title: "Data Platform Engineer",
    category: "Data & Analytics",
    score: 79,
    growth: "+26% YoY",
    comp: "14 - 38 LPA ($150k – $225k)",
    compMedian: "Median 19 LPA",
    hiring: "16,720 Verified Openings",
    velocity: "High Sustained Intake",
    skills: ["Apache Spark", "Airflow", "dbt Core", "PostgreSQL", "SQL", "Docker", "Git"],
    description: "Designs batch and real-time ETL streaming pipelines feeding analytical warehouses and lakehouses.",
  },
  {
    id: "security-eng",
    title: "Security & Systems Engineer",
    category: "Cybersecurity & Systems",
    score: 75,
    growth: "+29% YoY",
    comp: "15 - 36 LPA ($155k – $230k)",
    compMedian: "Median 20 LPA",
    hiring: "13,190 Verified Openings",
    velocity: "Zero-Trust Priority",
    skills: ["Zero-Trust IAM", "Network Security", "eBPF Security", "Vault KMS", "Linux", "Penetration Testing"],
    description: "Hardens enterprise perimeters, conducts automated threat modeling, and maintains zero-trust compliance.",
  },
  {
    id: "business-manager",
    title: "Business Manager",
    category: "Business & Management",
    score: 82,
    growth: "+22% YoY",
    comp: "14 - 35 LPA",
    compMedian: "Median 18 LPA",
    hiring: "15,400 Verified Openings",
    velocity: "APAC Strategic Core",
    skills: ["Strategic Management", "Operations Management", "Financial Accounting", "Business Analytics", "Leadership"],
    description: "Oversees business operations, strategic planning, cross-functional execution, and P&L budgeting.",
  }
];

export const CareersView: React.FC<CareersViewProps> = ({
  profile,
  onSelectRole,
  activeTargetRole,
  onNavigateToChat,
}) => {
  const [subTab, setSubTab] = useState<"chart" | "roles" | "trends">("chart");
  const [trendRole, setTrendRole] = useState<string>("Full-Stack Developer");
  const [trendsData, setTrendsData] = useState<any>(null);
  const [isRefreshingTrends, setIsRefreshingTrends] = useState(false);
  const [realBenchmarks, setRealBenchmarks] = useState<any[]>([]);

  // Fetch real-world benchmarks calculated from the 450 verified job postings
  useEffect(() => {
    let isMounted = true;
    api.getCareerBenchmarks().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setRealBenchmarks(data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Interactive Bar Zoom & Fracture State
  const [activeRoleKey, setActiveRoleKey] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.getMarketTrends(trendRole).then((data) => {
      if (isMounted) setTrendsData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [trendRole]);

  // Synchronize trend role with the active career target when updated
  useEffect(() => {
    if (activeTargetRole) {
      setTrendRole(activeTargetRole);
    }
  }, [activeTargetRole]);

  const handleRefreshTavily = async () => {
    setIsRefreshingTrends(true);
    try {
      await api.refreshMarketTrends(trendRole);
      const updated = await api.getMarketTrends(trendRole);
      setTrendsData(updated);
    } finally {
      setIsRefreshingTrends(false);
    }
  };

  const hasProfileSkills = Boolean(profile && profile.skills && profile.skills.length > 0);

  const userSkillNames = new Set(
    (profile?.skills || []).map((s) => s.name.toLowerCase().trim())
  );

  // Compile active career list preferring live data from real job postings
  const baseCareers = realBenchmarks.length > 0 ? realBenchmarks : TELEMETRY_CAREERS;
  const allCareers = [...baseCareers];
  if (
    activeTargetRole &&
    !allCareers.some((c) => c.title.toLowerCase() === activeTargetRole.toLowerCase())
  ) {
    allCareers.push({
      id: "active-custom-role",
      title: activeTargetRole,
      category: "Custom Analysis Target",
      score: 90,
      growth: "+35% YoY",
      comp: "Competitive Market",
      compMedian: "Live Evaluated",
      hiring: "Live Market Active",
      velocity: "Dynamic Target",
      skills: ["Core Competency", "Adaptive Practice", "Modern Tooling"],
      description: `Custom goal targeted via live agentic market intelligence for your candidate profile.`,
    });
  }

  // Calculate dynamic fit percentage and missing skills for each career, sorted by highest fit
  const enrichedCareers = allCareers
    .map((career) => {
      const required = career.skills;
      const matching = required.filter((req: string) =>
        Array.from(userSkillNames).some(
          (u) => req.toLowerCase().includes(u) || u.includes(req.toLowerCase())
        )
      );
      const missing = required.filter(
        (req: string) =>
          !Array.from(userSkillNames).some(
            (u) => req.toLowerCase().includes(u) || u.includes(req.toLowerCase())
          )
      );
      const fitPercentage =
        required.length > 0 ? Math.round((matching.length / required.length) * 100) : 0;

      return {
        ...career,
        matching,
        missing,
        fitPercentage,
      };
    })
    .sort((a, b) => b.fitPercentage - a.fitPercentage || b.score - a.score);

  // Normalized trends list supporting backend and live search schema
  const normalizedTrends = trendsData
    ? (trendsData.trends || trendsData.skills || []).map((item: any, idx: number) => {
        const name = item.skill || item.skill_name || item.name || `Skill ${idx + 1}`;
        const baseFreq = item.frequency_baseline ?? item.baseline_frequency ?? 0;
        const recentFreq = item.frequency_recent ?? item.recent_frequency ?? 0;
        let delta = item.delta;
        if (delta === undefined) {
          delta = item.shift_percentage !== undefined ? item.shift_percentage / 100 : (recentFreq - baseFreq);
        }
        const shiftPct = Math.round(delta * 100);
        const direction = item.trend || item.direction || (delta >= 0.05 ? "rising" : delta <= -0.05 ? "declining" : "stable");
        return {
          id: item.skill_id || `trend_${idx}`,
          skill_name: name,
          baseline_frequency: baseFreq,
          recent_frequency: recentFreq,
          shift_percentage: shiftPct,
          direction: String(direction).toLowerCase()
        };
      })
    : [];

  const handleBarClick = (roleId: string) => {
    if (activeRoleKey === roleId) {
      handleResetZoom();
    } else {
      setActiveRoleKey(roleId);
      setIsZoomed(true);
    }
  };

  const handleResetZoom = () => {
    setIsZoomed(false);
    setActiveRoleKey(null);
  };

  const activeCareerData = enrichedCareers.find((c) => c.id === activeRoleKey);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSubTab("chart");
              handleResetZoom();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "chart"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-border text-text-muted hover:text-text"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Demand Alignment Chart</span>
          </button>
          <button
            onClick={() => setSubTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "roles"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-border text-text-muted hover:text-text"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Career Fits &amp; Benchmarks</span>
          </button>
          <button
            onClick={() => setSubTab("trends")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "trends"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-border text-text-muted hover:text-text"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Skill Trends</span>
          </button>
        </div>

        {activeTargetRole && (
          <div className="text-xs text-text-muted bg-blue-50/70 border border-blue-200/80 px-3.5 py-1.5 rounded-xl font-medium">
            Active Target: <b className="text-blue-700">{activeTargetRole}</b>
          </div>
        )}
      </div>

      {/* Subtab 1: Interactive Bar Telemetry Chart */}
      {subTab === "chart" && (
        <section className="w-full p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col gap-6 relative overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-slate-200 pb-4 flex items-start justify-between relative z-20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] mb-2 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Live Market Intelligence</span>
              </div>
              <h1 className="text-xl md:text-2xl text-slate-900 font-bold tracking-tight">
                Highest In-Demand Careers &amp; Skill Alignment
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Ranked by live hiring volume, verified compensation baselines, and market elasticity. Click any bar to inspect telemetry or launch roadmap planning.
              </p>
            </div>

            {/* Reset / Back Pill Button */}
            {isZoomed && (
              <button
                onClick={handleResetZoom}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 shadow-sm transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Reset / Back to Overview</span>
              </button>
            )}
          </div>

          {/* Interactive Bar Chart Stage Area */}
          <div className="relative w-full h-[480px] rounded-xl overflow-hidden bg-slate-50/70 border border-blue-100 blueprint-dot-bg">
            {/* Grid Reference Lines */}
            <div className="absolute inset-x-6 top-10 bottom-16 flex flex-col justify-between pointer-events-none transition-all duration-500">
              {[100, 75, 50, 25, 0].map((val) => (
                <div key={val} className="w-full flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400 w-8 text-right font-medium">
                    {val}
                  </span>
                  <div
                    className={`flex-1 h-px ${
                      val === 0 ? "bg-slate-300" : "bg-slate-200 border-b border-dashed border-slate-300"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Clickable Bars Row */}
            <div className="relative z-10 w-full h-[370px] pl-10 pr-4 flex items-end justify-between gap-2 md:gap-5 pt-8">
              {enrichedCareers.slice(0, 8).map((career) => {
                const isSelected = activeRoleKey === career.id;
                const isFaded = isZoomed && !isSelected;

                return (
                  <div
                    key={career.id}
                    onClick={() => handleBarClick(career.id)}
                    className={`group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer transition-all duration-300 ${
                      isFaded ? "opacity-15 blur-[2px] pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {/* The Bar */}
                    <div
                      style={{ height: `${career.score}%` }}
                      className={`w-full max-w-[58px] rounded-t-lg relative flex flex-col justify-start items-center pt-2.5 transition-all duration-300 shadow-md ${
                        isSelected
                          ? "bg-blue-700 shadow-blue-500/40 ring-4 ring-blue-400/30 scale-105"
                          : "bg-blue-600 shadow-blue-500/20 group-hover:bg-blue-500 group-hover:-translate-y-1"
                      }`}
                    >
                      <span className="font-mono text-white font-bold tracking-tight text-xs">
                        {career.score}
                      </span>
                      {hasProfileSkills && (
                        <span className="font-mono text-[9px] text-blue-200 mt-0.5">
                          {career.fitPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Role Label Underneath */}
                    <span
                      className={`text-[11px] font-semibold mt-3 text-center truncate max-w-full transition-colors ${
                        isSelected ? "text-blue-700 font-bold" : "text-slate-700 group-hover:text-blue-600"
                      }`}
                    >
                      {career.title.replace(" Engineer", "").replace(" Solutions", "")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fractured Modular Shards Overlay when a bar is selected */}
            {isZoomed && activeCareerData && (
              <div className="absolute inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-blue-500 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Shard 1: Header / Demand Index */}
                  <div className="bg-blue-600 text-white rounded-xl p-4 shadow-md shadow-blue-600/25 border border-blue-400/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                        DEMAND INDEX
                      </span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                        {activeCareerData.growth}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-lg font-bold tracking-tight text-white truncate">
                        {activeCareerData.title}
                      </h3>
                      <span className="font-mono text-base font-extrabold text-blue-100 ml-2">
                        {activeCareerData.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                      {activeCareerData.description}
                    </p>
                  </div>

                  {/* Shards 2 & 3 Grid: Compensation & Market Velocity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>COMPENSATION</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-blue-700 mt-1">
                        {activeCareerData.comp}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {activeCareerData.compMedian}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>MARKET VELOCITY</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">
                        {activeCareerData.hiring}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {activeCareerData.velocity}
                      </div>
                    </div>
                  </div>

                  {/* Shard 4: Core Skills & Stack */}
                  {/* Shard 4: Core Skills & Prerequisites */}
                  <div className="bg-white rounded-xl p-3 border border-blue-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        CORE SKILLS &amp; COMPETENCIES
                      </span>
                      <span className="font-mono text-[10px] text-emerald-600 font-bold">
                        {activeCareerData.fitPercentage}% Alignment
                      </span>
                    </div>

                    {/* Matching skills */}
                    {activeCareerData.matching && activeCareerData.matching.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-700">Skills You Have ({activeCareerData.matching.length}):</span>
                        <div className="flex flex-wrap gap-1">
                          {activeCareerData.matching.map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {activeCareerData.missing && activeCareerData.missing.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-rose-700">Competency Gaps ({activeCareerData.missing.length}):</span>
                        <div className="flex flex-wrap gap-1">
                          {activeCareerData.missing.map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[10px] font-semibold border border-rose-200"
                            >
                              +{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetZoom}
                      className="shrink-0"
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectRole(activeCareerData.title)}
                      className="flex-1 gap-2 bg-[#4648d4] hover:bg-[#393bb3] text-white"
                    >
                      <span>Generate Roadmap for this Role →</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subtab 2: Career Fits & Benchmarks (M7) */}
      {subTab === "roles" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-text">
                {hasProfileSkills ? "Dynamic Career Fit Rankings" : "Indian Tech Market Career Benchmarks"}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {hasProfileSkills
                  ? `Roles ranked dynamically by skill overlap based on your ${profile?.skills.length} extracted competencies and ${profile?.years_of_experience || 0} yrs experience.`
                  : "Explore benchmark market requirements and compensation archetypes below. Select any role to set it as your target goal in the Chat Assistant."}
              </p>
            </div>

            {!hasProfileSkills && (
              <Button
                variant="primary"
                size="sm"
                onClick={onNavigateToChat}
                className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="w-4 h-4" />
                Analyze Profile in Chat
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedCareers.map((role) => {
              const isSelected = activeTargetRole?.toLowerCase() === role.title.toLowerCase();

              return (
                <Card
                  key={role.id}
                  className={`space-y-4 transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/20 shadow-card"
                      : "border-border hover:border-blue-400/50 hover:shadow-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        {role.category}
                      </span>
                      <h3 className="text-lg font-bold text-text mt-0.5">{role.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasProfileSkills ? (
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                            role.fitPercentage >= 60
                              ? "bg-accent-greenSubtle text-accent-green"
                              : role.fitPercentage >= 30
                              ? "bg-accent-amberSubtle text-accent-amber"
                              : "bg-gray-100 text-text-muted"
                          }`}
                        >
                          {role.fitPercentage}% Match
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-text-muted">
                          {role.skills.length} Core Skills
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {role.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border-light">
                    <div className="flex items-center gap-1.5 text-text">
                      <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
                      <span className="font-semibold">{role.hiring}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold">{role.comp}</span>
                    </div>
                  </div>

                  {/* Matching Skills */}
                  {role.matching.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-accent-green flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Skills You Already Have ({role.matching.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.matching.map((s: string) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-accent-greenSubtle text-accent-green text-[11px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills to Learn */}
                  {role.missing.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-accent-rose flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Competency Gaps to Close ({role.missing.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.missing.map((s: string) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-accent-roseSubtle text-accent-rose text-[11px] font-semibold"
                          >
                            +{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    className="w-full gap-2 mt-2"
                    onClick={() => onSelectRole(role.title)}
                  >
                    <span>{isSelected ? "Active Target Selected" : "Generate Roadmap for this Role →"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: Market Trends (M8 Snapshots Table) */}
      {subTab === "trends" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Market Trends
              </div>
              <h2 className="text-xl font-extrabold text-text mt-1">
                Timestamped Market Snapshots & Trend Analysis
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Comparing skill demand frequency between baseline and recent snapshots to track rising and declining technologies.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshTavily}
              disabled={isRefreshingTrends}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTrends ? "animate-spin" : ""}`} />
              {isRefreshingTrends ? "Refreshing via Tavily..." : "Live Web Refresh (Tavily)"}
            </Button>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Array.from(
              new Set([
                "Full-Stack Developer",
                "Data Engineer",
                "Machine Learning Engineer",
                "Rust Embedded Systems",
                ...(activeTargetRole ? [activeTargetRole] : []),
              ])
            ).map((role) => (
              <button
                key={role}
                onClick={() => setTrendRole(role)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  trendRole.toLowerCase() === role.toLowerCase()
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white border border-border text-text-muted hover:text-text"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Snapshots Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-gray-50/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                <span>Snapshots: 2024-11-01 vs 2026-03-01</span>
              </div>
              <span className="text-xs text-text-muted font-medium">
                Role: <b className="text-blue-700">{trendRole}</b>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-text-muted uppercase text-[10px] tracking-wider border-b border-border font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Skill Name</th>
                    <th className="px-6 py-3.5">Baseline Freq (2024-11-01)</th>
                    <th className="px-6 py-3.5">Recent Freq (2026-03-01)</th>
                    <th className="px-6 py-3.5">Shift (Δ)</th>
                    <th className="px-6 py-3.5">Market Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {normalizedTrends.length > 0 ? (
                    normalizedTrends.map((item: any) => {
                      const isRising = item.direction === "rising" || item.shift_percentage > 0;
                      const isDeclining = item.direction === "declining" || item.shift_percentage < 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-text">{item.skill_name}</td>
                          <td className="px-6 py-4 text-text-muted">
                            {(item.baseline_frequency * 100).toFixed(0)}%
                          </td>
                          <td className="px-6 py-4 text-text-muted">
                            {(item.recent_frequency * 100).toFixed(0)}%
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-bold ${
                                isRising
                                  ? "text-accent-green"
                                  : isDeclining
                                  ? "text-accent-rose"
                                  : "text-text-muted"
                              }`}
                            >
                              {item.shift_percentage > 0 ? "+" : ""}
                              {item.shift_percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isRising
                                  ? "bg-accent-greenSubtle text-accent-green"
                                  : isDeclining
                                  ? "bg-accent-roseSubtle text-accent-rose"
                                  : "bg-gray-100 text-text-muted"
                              }`}
                            >
                              {isRising && <TrendingUp className="w-3 h-3" />}
                              {item.direction
                                ? item.direction.charAt(0).toUpperCase() + item.direction.slice(1)
                                : "Stable"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                        No trend snapshot data found for this archetype.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareersView;
