import React, { useState, useEffect } from "react";
import { Profile, Roadmap, UserConstraints } from "../types/contracts";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Workflow,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  ArrowRight
} from "lucide-react";
import { api } from "../lib/api";
import { QuizModal, QuizData } from "./quiz/QuizModal";

interface ResultsViewProps {
  profile: Profile;
  roadmap: Roadmap;
  constraints: UserConstraints;
  onReset: () => void;
}

const PROFICIENCY_LABELS = ["None", "Beginner", "Intermediate", "Advanced"];
const USD_TO_INR = 85.0; // Fixed documented rate (M13)

export const ResultsView: React.FC<ResultsViewProps> = ({
  profile,
  roadmap: initialRoadmap,
  constraints,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<"roadmap" | "gaps" | "profile">("roadmap");
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap>(initialRoadmap);
  const [currency, setCurrency] = useState<"USD" | "INR">(constraints.currency || "USD");
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanNotice, setReplanNotice] = useState<string | null>(null);

  // M11 Progress Tracking State
  const [completedOrders, setCompletedOrders] = useState<Set<number>>(new Set());

  // Canvas zoom & pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Synchronize internal state whenever a new roadmap arrives
  useEffect(() => {
    setCurrentRoadmap(initialRoadmap);
    setCurrency(constraints.currency || "INR");
    setCompletedOrders(new Set());
    setReplanNotice(null);
    setZoomLevel(1.0);
  }, [initialRoadmap, constraints]);

  // M12 Quiz State
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Currency helpers (M13)
  const currencySymbol = currency === "INR" ? "₹" : "$";
  const convertCost = (costUsd: number) => (currency === "INR" ? costUsd * USD_TO_INR : costUsd);
  const formatCost = (costUsd: number) =>
    costUsd === 0 ? "Free" : `${currencySymbol}${convertCost(costUsd).toFixed(0)}`;

  // Determine active milestone step (first uncompleted step)
  const activeStepOrder =
    currentRoadmap.items.find((item) => !completedOrders.has(item.order))?.order ||
    (currentRoadmap.items.length > 0 ? currentRoadmap.items[0].order : 1);

  const handleMarkComplete = async (itemOrder: number, title: string) => {
    setIsReplanning(true);
    setReplanNotice(null);
    const newCompleted = new Set(completedOrders);
    if (newCompleted.has(itemOrder)) {
      newCompleted.delete(itemOrder);
    } else {
      newCompleted.add(itemOrder);
    }
    setCompletedOrders(newCompleted);

    try {
      const updated = await api.markItemComplete(itemOrder);
      setCurrentRoadmap(updated);
      setReplanNotice(`Updated progress for "${title}"! Reactive graph replanned remaining modules.`);
    } catch (err: any) {
      console.error("Failed to replan on complete:", err);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleOpenQuiz = async (item: any) => {
    setIsLoadingQuiz(true);
    try {
      const quiz = await api.generateQuiz(
        item.course.id,
        item.course.title,
        item.course.skills_covered
      );
      setActiveQuiz(quiz);
      setIsQuizOpen(true);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };


  // Node position geometry for 2-column alternating blueprint canvas
  const getNodeCoordinates = (index: number) => {
    const isLeft = index % 2 === 0;
    const rowIndex = Math.floor(index / 2);
    const x = isLeft ? 180 : 660;
    const y = 220 + rowIndex * 350;
    return { x, y };
  };

  const totalRows = Math.max(1, Math.ceil(currentRoadmap.items.length / 2));
  const canvasHeight = 220 + totalRows * 360 + 180;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 py-2 font-sans antialiased text-slate-900">
      {/* Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {constraints.target_role || "Target Pathway"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Replan Notification Banner */}
      {(replanNotice || isReplanning) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{isReplanning ? "Recalculating roadmap pace..." : replanNotice}</span>
        </div>
      )}


      {/* Subtab Selector for Views */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "roadmap"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-border text-slate-600 hover:text-slate-900"
            }`}
          >
            Learning Roadmap ({currentRoadmap.items.length} Modules)
          </button>
          <button
            onClick={() => setActiveTab("gaps")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gaps"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-border text-slate-600 hover:text-slate-900"
            }`}
          >
            Skill Gap Analysis
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-border text-slate-600 hover:text-slate-900"
            }`}
          >
            Extracted Profile ({profile.skills.length} Skills)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "roadmap" && (
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
              <button
                onClick={() => setViewMode("graph")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "graph"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Workflow className="w-3.5 h-3.5 text-blue-600" />
                <span>Graph Canvas</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Curriculum List</span>
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-2 py-1 rounded text-[11px] transition-all ${
                currency === "USD" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-2 py-1 rounded text-[11px] transition-all ${
                currency === "INR" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              INR (₹)
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={onReset} className="text-xs">
            ← Back to Chat
          </Button>
        </div>
      </div>

      {/* MAIN VIEW: ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          {viewMode === "graph" ? (
            /* ========================================================================= */
            /* GRAPH VIEW: THE INTERACTIVE BLUEPRINT CANVAS                              */
            /* ========================================================================= */
            <div
              className="relative w-full rounded-2xl bg-[#f8fafc] border-2 border-blue-200/80 shadow-md blueprint-dot-bg select-none overflow-hidden"
              style={{ minHeight: `${canvasHeight}px` }}
            >
              {/* Floating Camera Controls on Left */}
              <div className="absolute left-5 top-5 z-30 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="px-1 py-0.5 border-t border-slate-200 text-center">
                  <span className="font-mono text-[9px] text-slate-500 font-bold">
                    {(zoomLevel * 100).toFixed(0)}%
                  </span>
                </div>
              </div>


              {/* Canvas Smooth Stage */}
              <div
                className="w-full max-w-[1200px] mx-auto relative transition-transform duration-500 origin-top-center p-6"
                style={{
                  transform: `scale(${zoomLevel})`,
                  minHeight: `${canvasHeight}px`,
                  height: `${canvasHeight}px`,
                }}
              >
                {/* SVG Connecting Flow Wires Layer */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  style={{ height: `${canvasHeight}px` }}
                >
                  <defs>
                    <linearGradient id="activeBlueGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* Wire from Gateway to Node 1 */}
                  {currentRoadmap.items.length > 0 && (
                    <path
                      className={completedOrders.has(1) ? "" : "flow-wire-active"}
                      d="M 600 75 C 600 135, 360 155, 360 220"
                      fill="none"
                      stroke={completedOrders.has(1) ? "#059669" : "url(#activeBlueGrad)"}
                      strokeWidth={completedOrders.has(1) ? "2" : "2.5"}
                    />
                  )}

                  {/* Wire from Gateway to Node 2 if present */}
                  {currentRoadmap.items.length > 1 && (
                    <path
                      d="M 600 75 C 600 135, 840 155, 840 220"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeDasharray="4 4"
                      strokeWidth="1.8"
                    />
                  )}

                  {/* Sequential and Branched Wires between subsequent steps */}
                  {currentRoadmap.items.map((item, idx) => {
                    if (idx === currentRoadmap.items.length - 1) return null;
                    const fromPos = getNodeCoordinates(idx);
                    const toPos = getNodeCoordinates(idx + 1);
                    const isFromCompleted = completedOrders.has(item.order);
                    const isToActive = item.order + 1 === activeStepOrder;

                    return (
                      <path
                        key={`wire-${item.order}`}
                        d={`M ${fromPos.x + 180} ${fromPos.y + 260} C ${fromPos.x + 180} ${
                          fromPos.y + 320
                        }, ${toPos.x + 180} ${toPos.y - 40}, ${toPos.x + 180} ${toPos.y}`}
                        fill="none"
                        className={isToActive ? "flow-wire-active" : ""}
                        stroke={
                          isToActive
                            ? "url(#activeBlueGrad)"
                            : isFromCompleted
                            ? "#059669"
                            : "#cbd5e1"
                        }
                        strokeWidth={isToActive ? "2.5" : "1.8"}
                        strokeDasharray={isToActive ? "6 6" : isFromCompleted ? "none" : "4 4"}
                      />
                    );
                  })}
                </svg>

                {/* LEVEL 0: ROOT START GATEWAY */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[30px] flex flex-col items-center z-10">
                  <div className="bg-white border-2 border-blue-600 px-6 py-2 rounded-full flex items-center gap-2.5 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    <span className="font-mono text-xs font-bold tracking-wider text-slate-900 uppercase">
                      START {constraints.target_role?.toUpperCase() || "CAREER"} PATHWAY
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-1.5 font-semibold">
                    Prerequisite Tier Zero • Verified Taxonomy
                  </span>
                </div>

                {/* TOPOLOGICAL NODES ON CANVAS */}
                {currentRoadmap.items.map((item, idx) => {
                  const coords = getNodeCoordinates(idx);
                  const isCompleted = completedOrders.has(item.order);
                  const isActive = item.order === activeStepOrder;
                  const isSelected = selectedNodeId === item.order;

                  return (
                    <div
                      key={item.order}
                      onClick={() => setSelectedNodeId(item.order)}
                      style={{
                        position: "absolute",
                        left: `${coords.x}px`,
                        top: `${coords.y}px`,
                        width: "360px",
                      }}
                      className={`z-20 cursor-pointer rounded-2xl p-5 transition-all duration-300 bg-white border ${
                        isActive
                          ? "border-2 border-blue-600 shadow-xl shadow-blue-500/20 halo-pulse-active"
                          : isCompleted
                          ? "border-emerald-500/60 bg-emerald-50/15 shadow-sm"
                          : "border-slate-200 hover:border-blue-400 shadow-sm"
                      } ${isSelected ? "ring-4 ring-blue-400/40" : ""}`}
                    >
                      {/* Step Header Badge */}
                      <div className="flex items-center justify-between mb-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            STEP {item.order}: IN PROGRESS
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            <Lock className="w-2.5 h-2.5" />
                            STEP {item.order}: UPCOMING
                          </span>
                        )}

                        <span className="font-mono text-[11px] font-semibold text-slate-500">
                          Weeks {item.start_week.toFixed(1)}–{item.end_week.toFixed(1)}
                        </span>
                      </div>

                      {/* Course Title & Platform with Clickable Links */}
                      {item.course.url ? (
                        <a
                          href={item.course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline leading-snug line-clamp-2 flex items-start justify-between gap-1 group/title cursor-pointer"
                          title="Open course resource in new tab"
                        >
                          <span>{item.course.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-blue-600 shrink-0 mt-0.5" />
                        </a>
                      ) : (
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.course.title}
                        </h3>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-mono">
                        {item.course.url ? (
                          <a
                            href={item.course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 px-2 py-0.5 rounded border border-blue-200/80 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title={`Open ${item.course.platform} link`}
                          >
                            <span>{item.course.platform}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
                            {item.course.platform}
                          </span>
                        )}
                        <span>•</span>
                        <span>{item.hours.toFixed(0)} hrs</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{formatCost(item.cost)}</span>
                      </div>

                      {/* Gaps Addressed Tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.gaps_covered.map((gap) => (
                          <span
                            key={gap.skill_id}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200/80"
                          >
                            {gap.skill_name} (+{gap.gap_size} lvl)
                          </span>
                        ))}
                      </div>

                      {/* Evidence Rationale Preview */}
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.explanation}
                      </p>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkComplete(item.order, item.course.title);
                          }}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQuiz(item);
                            }}
                            className="text-[11px] font-mono font-semibold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <HelpCircle className="w-3 h-3 text-blue-600" />
                            <span>Quiz</span>
                          </button>

                          {item.course.url && (
                            <a
                              href={item.course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                              title="Open course website / video"
                            >
                              <span>Visit Course</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Minimap in Bottom-Right Corner */}
              <div className="absolute right-5 bottom-5 z-30 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md w-40 flex flex-col gap-1.5 pointer-events-none">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  PATH TOPOLOGY
                </span>
                <div className="w-full h-16 bg-slate-50 border border-slate-200 rounded relative overflow-hidden flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border border-blue-400/80 rounded bg-blue-50/40 relative">
                    <div className="w-2 h-2 rounded-full bg-blue-600 absolute left-2 top-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute right-3 top-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute left-2 bottom-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute right-3 bottom-2" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* LIST VIEW: SEQUENTIAL LINEAR CURRICULUM CARDS                             */
            /* ========================================================================= */
            <div className="space-y-4">
              {currentRoadmap.items.map((item) => {
                const isCompleted = completedOrders.has(item.order);
                const isActive = item.order === activeStepOrder;

                return (
                  <Card
                    key={item.order}
                    className={`p-5 transition-all duration-200 border-2 ${
                      isActive
                        ? "border-blue-600 bg-blue-50/10 shadow-md"
                        : isCompleted
                        ? "border-emerald-300 bg-emerald-50/15"
                        : "border-border hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-xs ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.order}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.course.url ? (
                              <a
                                href={item.course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base font-bold text-slate-900 hover:text-blue-600 hover:underline leading-snug flex items-center gap-1.5"
                                title="Open course in new tab"
                              >
                                <span>{item.course.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                              </a>
                            ) : (
                              <h3 className="text-base font-bold text-slate-900 leading-snug">
                                {item.course.title}
                              </h3>
                            )}
                            {item.course.url ? (
                              <a
                                href={item.course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 flex items-center gap-1"
                                title={`Open ${item.course.platform} link`}
                              >
                                <span>{item.course.platform}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                                {item.course.platform}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                            <span>
                              Timeline: Weeks {item.start_week.toFixed(1)}–{item.end_week.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{item.hours.toFixed(0)} hrs</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{formatCost(item.cost)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {item.course.url && (
                          <a
                            href={item.course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
                            title="Open course in new tab"
                          >
                            <span>Visit Course</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQuiz(item)}
                          disabled={isLoadingQuiz}
                          className="gap-1.5 text-xs font-mono"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                          Take Quiz
                        </Button>

                        <button
                          onClick={() => handleMarkComplete(item.order, item.course.title)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Evidence Rationale */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-blue-900 block mb-1">Why this is recommended:</span>
                      {item.explanation}
                    </div>

                    {/* Gaps Covered & URL */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Gaps addressed:</span>
                        {item.gaps_covered.map((gap) => (
                          <span
                            key={gap.skill_id}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/80"
                          >
                            {gap.skill_name} (+{gap.gap_size} lvl)
                          </span>
                        ))}
                      </div>

                      {item.course.url && (
                        <a
                          href={item.course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-4"
                        >
                          <span>Go to Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SKILL GAP ANALYSIS */}
      {activeTab === "gaps" && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Computed Skill Gaps</h2>
            <p className="text-xs text-slate-500 mt-1">
              Delta between candidate profile and target market role requirements.
            </p>
          </div>

          <div className="space-y-3">
            {currentRoadmap.items.flatMap((it) => it.gaps_covered).length > 0 ? (
              currentRoadmap.items.flatMap((it) => it.gaps_covered).map((gap) => (
                <div
                  key={gap.skill_id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900">{gap.skill_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Priority Score: {(gap.priority_score * 100).toFixed(0)} • Transferable: {gap.transferable ? "Yes" : "No"}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-rose bg-accent-roseSubtle px-2 py-0.5 rounded">
                    +{gap.gap_size} Level Gap
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No skill gaps identified.</p>
            )}
          </div>
        </Card>
      )}

      {/* SUBTAB 3: EXTRACTED PROFILE */}
      {activeTab === "profile" && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Candidate Profile Baseline</h2>
            <p className="text-xs text-slate-500 mt-1">
              Extracted from resume or interactive chat intake.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Experience</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {profile.years_of_experience || 0} Years
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Identified Domain</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {profile.domain || "Technical Domain"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">
              Extracted Skills ({profile.skills.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s.skill_id}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-medium"
                >
                  {s.name} ({PROFICIENCY_LABELS[s.level]})
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* M12 Quiz Modal */}
      {isQuizOpen && activeQuiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          quiz={activeQuiz}
          onPassed={() => {
            const item = currentRoadmap.items.find((i) => i.course.id === activeQuiz.course_id);
            if (item) {
              handleMarkComplete(item.order, item.course.title);
            }
          }}
        />
      )}
    </div>
  );
};

export default ResultsView;
