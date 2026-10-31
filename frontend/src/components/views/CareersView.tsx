import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Layers,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Profile } from "../../types/contracts";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";

interface CareersViewProps {
  profile: Profile | null;
  onSelectRole: (roleTitle: string) => void;
  activeTargetRole?: string | null;
  onNavigateToChat: () => void;
}

export interface TelemetryRoleData {
  id: string;
  title: string;
  score: string;
  scoreNum: number;
  growth: string;
  comp: string;
  compMedian: string;
  hiring: string;
  velocity: string;
  skills: string[];
  description: string;
}

export const CAREER_TELEMETRY: Record<string, TelemetryRoleData> = {
  "ai-systems": {
    id: "ai-systems",
    title: "AI Systems Engineer",
    score: "98/100",
    scoreNum: 98,
    growth: "+44% YoY",
    comp: "$185k – $275k avg package",
    compMedian: "Median $215k",
    hiring: "14,820 Verified Openings",
    velocity: "Peak Demand Tier",
    skills: ["CUDA Kernels", "Triton", "vLLM", "FlashAttention", "Tensor Parallelism"],
    description: "Architects and optimizes large-scale model inference, GPU clusters, and distributed neural pipelines.",
  },
  "cloud-architect": {
    id: "cloud-architect",
    title: "Cloud Solutions Architect",
    score: "94/100",
    scoreNum: 94,
    growth: "+36% YoY",
    comp: "$175k – $250k avg package",
    compMedian: "Median $205k",
    hiring: "22,410 Verified Openings",
    velocity: "Enterprise Core Demand",
    skills: ["Kubernetes", "Terraform", "Istio Mesh", "eBPF", "FinOps"],
    description: "Provisions scalable resilient infrastructure, multi-cloud clusters, and enterprise FinOps architectures.",
  },
  "full-stack": {
    id: "full-stack",
    title: "Full-Stack Product Engineer",
    score: "89/100",
    scoreNum: 89,
    growth: "+24% YoY",
    comp: "$140k – $210k avg package",
    compMedian: "Median $168k",
    hiring: "38,150 Verified Openings",
    velocity: "Broad Volume Expansion",
    skills: ["TypeScript", "Next.js 14", "PostgreSQL", "Redis", "GraphQL"],
    description: "Builds responsive reactive web applications and scalable API layers backed by robust relational databases.",
  },
  "ml-infra": {
    id: "ml-infra",
    title: "ML Infrastructure Engineer",
    score: "86/100",
    scoreNum: 86,
    growth: "+38% YoY",
    comp: "$170k – $260k avg package",
    compMedian: "Median $198k",
    hiring: "11,340 Verified Openings",
    velocity: "Surging High-Growth",
    skills: ["Ray.io", "Kubeflow", "PyTorch DDP", "Qdrant", "Slurm"],
    description: "Scales training clusters, MLOps orchestration workflows, and vector retrieval pipelines for production AI.",
  },
  "distributed-sys": {
    id: "distributed-sys",
    title: "Distributed Systems Engineer",
    score: "83/100",
    scoreNum: 83,
    growth: "+32% YoY",
    comp: "$165k – $245k avg package",
    compMedian: "Median $192k",
    hiring: "9,880 Verified Openings",
    velocity: "Core Systems Tier",
    skills: ["Rust", "Go Systems", "Raft Consensus", "Kafka", "RocksDB"],
    description: "Engineers high-throughput, fault-tolerant consensus systems, messaging buses, and real-time streaming engines.",
  },
  "data-platform": {
    id: "data-platform",
    title: "Data Platform Engineer",
    score: "79/100",
    scoreNum: 79,
    growth: "+26% YoY",
    comp: "$150k – $225k avg package",
    compMedian: "Median $175k",
    hiring: "16,720 Verified Openings",
    velocity: "High Sustained Intake",
    skills: ["Apache Spark", "Snowflake", "dbt Core", "Iceberg", "Kafka"],
    description: "Designs batch and real-time ETL streaming pipelines feeding analytical warehouses and lakehouses.",
  },
  "security-eng": {
    id: "security-eng",
    title: "Security & Systems Engineer",
    score: "75/100",
    scoreNum: 75,
    growth: "+29% YoY",
    comp: "$155k – $230k avg package",
    compMedian: "Median $182k",
    hiring: "13,190 Verified Openings",
    velocity: "Zero-Trust Priority",
    skills: ["Zero-Trust IAM", "eBPF Security", "Vault KMS", "SOC2 Automations"],
    description: "Hardens enterprise perimeters, conducts automated threat modeling, and maintains zero-trust compliance.",
  },
};

const CAREER_KEYS = [
  "ai-systems",
  "cloud-architect",
  "full-stack",
  "ml-infra",
  "distributed-sys",
  "data-platform",
  "security-eng",
] as const;

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

  // Interactive Bar Zoom & Fracture State
  const stageRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [activeRoleKey, setActiveRoleKey] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [shardsAssembled, setShardsAssembled] = useState<boolean>(true);
  const [stageOrigin, setStageOrigin] = useState<string>("50% 70%");
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    api.getCareerBenchmarks().catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getMarketTrends(trendRole).then((data) => {
      if (isMounted) setTrendsData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [trendRole]);

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

  // Zoom and fracture handler matching updates/careers/code.html
  const resetZoomAndReassemble = useCallback(() => {
    if (!isZoomed) return;
    // 1. Collapse shards back to center of original bar
    setShardsAssembled(true);

    // 2. Unzoom stage and clean up
    setTimeout(() => {
      setIsZoomed(false);
      setActiveRoleKey(null);
    }, 550);
  }, [isZoomed]);

  const zoomAndFractureBar = (roleKey: string) => {
    if (isZoomed && activeRoleKey === roleKey) {
      resetZoomAndReassemble();
      return;
    }

    if (isZoomed) {
      resetZoomAndReassemble();
      setTimeout(() => zoomAndFractureBar(roleKey), 350);
      return;
    }

    const stageElem = stageRef.current;
    const barElem = barRefs.current[roleKey];
    if (!stageElem || !barElem) return;

    const innerBar = barElem.querySelector(".bar-inner");
    if (!innerBar) return;

    const stageRect = stageElem.getBoundingClientRect();
    const barRect = innerBar.getBoundingClientRect();

    // Calculate bar center relative to stage container
    const barCenterX = barRect.left + barRect.width / 2 - stageRect.left;
    const barCenterY = barRect.top + barRect.height / 2 - stageRect.top;

    const stageWidth = stageRect.width;
    const stageHeight = stageRect.height;
    const originXPercent = (barCenterX / stageWidth) * 100;
    const originYPercent = (barCenterY / stageHeight) * 100;

    // Keep shards contained within viewport boundaries
    let anchorX = barCenterX;
    const minX = 180;
    const maxX = stageWidth - 180;
    if (anchorX < minX) anchorX = minX;
    if (anchorX > maxX) anchorX = maxX;

    let anchorY = barCenterY - 10;
    if (anchorY < 210) anchorY = 210;
    if (anchorY > stageHeight - 140) anchorY = stageHeight - 140;

    setActiveRoleKey(roleKey);
    setStageOrigin(`${originXPercent}% ${originYPercent}%`);
    setAnchor({ x: anchorX, y: anchorY });
    setIsZoomed(true);
    setShardsAssembled(true);

    // Slight micro delay before fracturing outwards
    requestAnimationFrame(() => {
      setTimeout(() => {
        setShardsAssembled(false);
      }, 40);
    });
  };

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) {
        resetZoomAndReassemble();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed, resetZoomAndReassemble]);

  // Normalized trends list for Subtab 3
  const normalizedTrends = trendsData
    ? (trendsData.trends || trendsData.skills || []).map((item: any, idx: number) => {
        const name = item.skill || item.skill_name || item.name || `Skill ${idx + 1}`;
        const baseFreq = item.frequency_baseline ?? item.baseline_frequency ?? 0;
        const recentFreq = item.frequency_recent ?? item.recent_frequency ?? 0;
        let delta = item.delta;
        if (delta === undefined) {
          delta = item.shift_percentage !== undefined ? item.shift_percentage / 100 : recentFreq - baseFreq;
        }
        const shiftPct = Math.round(delta * 100);
        const direction =
          item.trend ||
          item.direction ||
          (delta >= 0.05 ? "rising" : delta <= -0.05 ? "declining" : "stable");
        return {
          id: item.skill_id || `trend_${idx}`,
          skill_name: name,
          baseline_frequency: baseFreq,
          recent_frequency: recentFreq,
          shift_percentage: shiftPct,
          direction: String(direction).toLowerCase(),
        };
      })
    : [];

  const activeShardData = activeRoleKey ? CAREER_TELEMETRY[activeRoleKey] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Embedded CSS matching updates/careers/code.html */}
      <style>{`
        @keyframes riseUp {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .bar-rise {
          transform-origin: bottom;
          animation: riseUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.12s; }
        .delay-3 { animation-delay: 0.19s; }
        .delay-4 { animation-delay: 0.26s; }
        .delay-5 { animation-delay: 0.33s; }
        .delay-6 { animation-delay: 0.40s; }
        .delay-7 { animation-delay: 0.47s; }

        .role-bar {
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.4s ease, filter 0.4s ease;
        }
        .role-bar:hover:not(.in-focus) {
          transform: translateY(-4px);
        }
        .role-bar:hover:not(.in-focus) .bar-inner {
          filter: brightness(1.08);
          box-shadow: 0 10px 25px -4px rgba(37, 99, 235, 0.45);
        }

        #chart-inner-stage {
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stage-zoomed .faded-out {
          opacity: 0.12 !important;
          filter: blur(3px) grayscale(40%) !important;
          pointer-events: none !important;
        }

        .role-bar.in-focus .bar-inner,
        .role-bar.in-focus .role-label {
          opacity: 0 !important;
          pointer-events: none;
        }

        #fractured-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 40;
        }

        .shard-piece {
          position: absolute;
          transform-origin: center center;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
          will-change: transform, opacity;
          pointer-events: auto;
        }

        .shard-piece.assembled {
          opacity: 0;
          transform: translate(0, 0) scale(0.65) !important;
          pointer-events: none;
        }

        .blueprint-border {
          border: 1px solid rgba(37, 99, 235, 0.25);
        }
        .blueprint-border-strong {
          border: 1.5px solid rgba(37, 99, 235, 0.85);
        }
      `}</style>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSubTab("chart");
              resetZoomAndReassemble();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "chart"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Demand Alignment Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "roles"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Career Fits &amp; Benchmarks</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("trends")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "trends"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Skill Trends</span>
          </button>
        </div>

        {activeTargetRole && (
          <div className="text-xs text-slate-500 bg-blue-50/70 border border-blue-200/80 px-3.5 py-1.5 rounded-xl font-medium">
            Active Target: <b className="text-blue-700">{activeTargetRole}</b>
          </div>
        )}
      </div>

      {/* SUBTAB 1: OG BAR ZOOM & FRACTURE TELEMETRY CHART */}
      {subTab === "chart" && (
        <section
          id="main-card"
          className="w-full p-8 md:p-10 rounded-2xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/5 flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Card Header */}
          <div className="border-b border-slate-200 pb-4 flex items-start justify-between relative z-20">
            <div>
              <h1 className="text-[24px] md:text-[28px] text-slate-900 font-bold tracking-tight">
                Highest In-Demand Careers &amp; Skill Alignment
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Ranked by global hiring requests, verified compensation baselines, and technical market elasticity.
              </p>
            </div>

            {/* Minimal Reset / Back Pill Button */}
            <div
              className={`transition-all duration-300 transform ${
                isZoomed
                  ? "opacity-100 pointer-events-auto translate-y-0"
                  : "opacity-0 pointer-events-none translate-y-1"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoomAndReassemble();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[12px] font-semibold border border-blue-200 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Reset / Back</span>
              </button>
            </div>
          </div>

          {/* Interactive Bar Chart Stage Area */}
          <div className="relative w-full h-[480px] rounded-xl overflow-hidden bg-slate-50/70 border border-blue-100">
            {/* Inner Zoomable Stage */}
            <div
              ref={stageRef}
              id="chart-inner-stage"
              style={{
                transform: isZoomed ? "scale(1.08)" : "none",
                transformOrigin: stageOrigin,
              }}
              className={`w-full h-full relative pt-8 pb-4 px-4 md:px-8 flex flex-col justify-end ${
                isZoomed ? "stage-zoomed" : ""
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (isZoomed && !target.closest(".shard-piece") && !target.closest(".role-bar")) {
                  resetZoomAndReassemble();
                }
              }}
            >
              {/* Grid Reference Lines */}
              <div
                id="grid-lines"
                className={`absolute inset-x-6 top-10 bottom-16 flex flex-col justify-between pointer-events-none transition-all duration-500 ${
                  isZoomed ? "faded-out" : ""
                }`}
              >
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="w-full flex items-center gap-3">
                    <span className="font-mono text-[12px] text-slate-400 w-8 text-right font-medium">
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

              {/* 7 Interactive Clickable Bars */}
              <div
                className="relative z-10 w-full h-[370px] pl-10 pr-2 flex items-end justify-between gap-3 md:gap-7"
                id="bars-row"
              >
                {CAREER_KEYS.map((key, index) => {
                  const data = CAREER_TELEMETRY[key];
                  const isSelected = activeRoleKey === key;
                  const isFaded = isZoomed && !isSelected;

                  return (
                    <div
                      key={key}
                      ref={(el) => {
                        barRefs.current[key] = el;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomAndFractureBar(key);
                      }}
                      className={`role-bar group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer ${
                        isSelected ? "in-focus" : ""
                      } ${isFaded ? "faded-out" : ""}`}
                      data-role={key}
                    >
                      <div
                        style={{ height: `${data.scoreNum}%` }}
                        className={`bar-inner w-full max-w-[62px] bg-blue-600 rounded-t-lg bar-rise delay-${index + 1} relative flex flex-col justify-start items-center pt-2.5 transition-all shadow-md shadow-blue-500/20`}
                      >
                        <span className="font-mono text-white font-bold tracking-tight text-[13px]">
                          {data.scoreNum}
                        </span>
                      </div>
                      <span className="role-label text-[13px] font-semibold text-slate-700 mt-3 text-center truncate max-w-full group-hover:text-blue-600 transition-colors">
                        {key === "ai-systems"
                          ? "AI Systems"
                          : key === "cloud-architect"
                          ? "Cloud Architect"
                          : key === "full-stack"
                          ? "Full-Stack"
                          : key === "ml-infra"
                          ? "ML Infra"
                          : key === "distributed-sys"
                          ? "Distributed Sys"
                          : key === "data-platform"
                          ? "Data Platform"
                          : "Security Eng"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fractured Pieces Container (Positioned within chart viewbox) */}
            <div id="fractured-container">
              {isZoomed && activeShardData && (
                <>
                  {/* Shard 1: Top / Header Shard (Blue banner tile) */}
                  <div
                    className={`shard-piece ${shardsAssembled ? "assembled" : ""}`}
                    style={{
                      left: `${anchor.x}px`,
                      top: `${anchor.y}px`,
                      width: "320px",
                      transform: shardsAssembled
                        ? "translate(0, 0) scale(0.65)"
                        : "translate(-160px, -170px) rotate(-1.2deg)",
                      opacity: shardsAssembled ? 0 : 1,
                    }}
                  >
                    <div className="w-full bg-blue-600 text-white rounded-xl p-3.5 shadow-xl shadow-blue-600/25 border border-blue-400/50 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-100">
                          DEMAND INDEX
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                          {activeShardData.growth}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <h3 className="text-[16px] font-bold tracking-tight text-white truncate">
                          {activeShardData.title}
                        </h3>
                        <span className="font-mono text-[14px] font-extrabold text-blue-100 ml-2">
                          {activeShardData.score}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shard 2: Compensation Shard (Crisp white tile with blue outline) */}
                  <div
                    className={`shard-piece ${shardsAssembled ? "assembled" : ""}`}
                    style={{
                      left: `${anchor.x}px`,
                      top: `${anchor.y}px`,
                      width: "290px",
                      transform: shardsAssembled
                        ? "translate(0, 0) scale(0.65)"
                        : "translate(-185px, -80px) rotate(1.5deg)",
                      opacity: shardsAssembled ? 0 : 1,
                    }}
                  >
                    <div className="w-full bg-white text-slate-900 rounded-xl p-3 shadow-lg shadow-blue-900/10 blueprint-border hover:border-blue-500 transition-colors">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>COMPENSATION BASELINE</span>
                      </div>
                      <div className="font-mono text-[14px] font-bold text-blue-700 mt-1">
                        {activeShardData.comp}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {activeShardData.compMedian} verified
                      </div>
                    </div>
                  </div>

                  {/* Shard 3: Demand & Requisitions Shard (Crisp white tile) */}
                  <div
                    className={`shard-piece ${shardsAssembled ? "assembled" : ""}`}
                    style={{
                      left: `${anchor.x}px`,
                      top: `${anchor.y}px`,
                      width: "270px",
                      transform: shardsAssembled
                        ? "translate(0, 0) scale(0.65)"
                        : "translate(15px, -65px) rotate(-1.8deg)",
                      opacity: shardsAssembled ? 0 : 1,
                    }}
                  >
                    <div className="w-full bg-white text-slate-900 rounded-xl p-3 shadow-lg shadow-blue-900/10 blueprint-border hover:border-blue-500 transition-colors">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>MARKET VELOCITY</span>
                      </div>
                      <div className="text-[14px] font-bold text-slate-900 mt-1">
                        {activeShardData.hiring}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {activeShardData.velocity}
                      </div>
                    </div>
                  </div>

                  {/* Shard 4: Technical Skills Chips Shard (Modular base tile) */}
                  <div
                    className={`shard-piece ${shardsAssembled ? "assembled" : ""}`}
                    style={{
                      left: `${anchor.x}px`,
                      top: `${anchor.y}px`,
                      width: "320px",
                      transform: shardsAssembled
                        ? "translate(0, 0) scale(0.65)"
                        : "translate(-160px, 25px) rotate(0.8deg)",
                      opacity: shardsAssembled ? 0 : 1,
                    }}
                  >
                    <div className="w-full bg-white/95 text-slate-900 rounded-xl p-3 shadow-xl shadow-blue-900/10 blueprint-border-strong backdrop-blur">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          CORE SKILLS &amp; STACK
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 font-semibold">
                          Verified Prereq
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeShardData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Integrated Action Button */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Target this Role?
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRole(activeShardData.title);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Plan Roadmap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SUBTAB 2: CAREER FITS & BENCHMARKS */}
      {subTab === "roles" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {hasProfileSkills ? "Dynamic Career Fit Rankings" : "Indian Tech Market Career Benchmarks"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
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
            {CAREER_KEYS.map((key) => {
              const career = CAREER_TELEMETRY[key];
              const matching = career.skills.filter((req) =>
                Array.from(userSkillNames).some(
                  (u) => req.toLowerCase().includes(u) || u.includes(req.toLowerCase())
                )
              );
              // competency fit calculated below
              const fitPct =
                career.skills.length > 0 ? Math.round((matching.length / career.skills.length) * 100) : 0;

              return (
                <div
                  key={career.id}
                  className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Index {career.score}
                      </span>
                      <span className="font-mono text-xs font-semibold text-emerald-600">
                        {career.growth}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{career.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{career.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
                      <span>{career.comp}</span>
                      <span className="text-slate-400">{career.hiring}</span>
                    </div>

                    {hasProfileSkills && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600">Candidate Alignment:</span>
                          <span className={fitPct >= 60 ? "text-emerald-600" : "text-amber-600"}>
                            {fitPct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fitPct >= 60 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${fitPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectRole(career.title)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      <span>Set as Target Goal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MARKET SKILL TRENDS */}
      {subTab === "trends" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Live Market Skill Trends &amp; Demand Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time frequency shifts calculated across industry job boards (2024–2026 data velocity).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTavily}
                disabled={isRefreshingTrends}
                className="gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isRefreshingTrends ? "Scanning Job Market..." : "Refresh Market Velocity"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {normalizedTrends.map((t: any) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 truncate font-bold">{t.skill_name}</span>
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                      t.direction === "rising"
                        ? "bg-emerald-50 text-emerald-700"
                        : t.direction === "declining"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.shift_percentage > 0 ? `+${t.shift_percentage}%` : `${t.shift_percentage}%`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Baseline: {(t.baseline_frequency * 100).toFixed(0)}%</span>
                  <span>Recent: {(t.recent_frequency * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
