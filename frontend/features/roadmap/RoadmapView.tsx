"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Roadmap, Milestone } from "@/lib/types";
import { MilestoneCard } from "@/components/cards/MilestoneCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const RoadmapView: React.FC = () => {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "Robotics Software Engineer";

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>(initialRole);
  const [hours, setHours] = useState<number>(5);
  const [budget, setBudget] = useState<number>(0);
  const [timelineMonths, setTimelineMonths] = useState<number>(6);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const fetchRoadmap = async (roleName: string, h: number, b: number, t: number) => {
    try {
      setLoading(true);
      const data = await api.generateRoadmap(roleName, {
        hours_per_week: h,
        monthly_budget: b,
        desired_timeline_months: t,
      });
      setRoadmap(data);
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(targetRole, hours, budget, timelineMonths);
  }, []);

  const handleRegenerate = () => {
    fetchRoadmap(targetRole, hours, budget, timelineMonths);
  };

  const handleMilestoneStatus = async (milestoneId: string, completed: boolean) => {
    if (!roadmap) return;
    try {
      await api.updateMilestone(milestoneId, {
        status: completed ? "completed" : "not_started",
        progress: completed ? 100 : 0,
      });

      // Update locally
      setRoadmap((prev) => {
        if (!prev) return null;
        const updated = prev.milestones.map((m) =>
          m.milestone_id === milestoneId
            ? { ...m, status: (completed ? "completed" : "not_started") as any, progress: completed ? 100 : 0 }
            : m
        );
        return { ...prev, milestones: updated };
      });
    } catch (err) {
      console.error("Error updating milestone:", err);
    }
  };

  const completedCount =
    roadmap?.milestones.filter((m) => m.status === "completed" || m.progress === 100).length || 0;
  const totalCount = roadmap?.milestones.length || 1;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Target Role & Metrics Summary Banner */}
      <Card className="bg-gradient-to-r from-primary-subtle/40 via-white to-secondary-subtle/30 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Personalized Development Roadmap
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text">{targetRole}</h1>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              {roadmap?.explanation ||
                "Constraint-aware roadmap generated from prerequisite dependency graph."}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showFilters ? "Hide Constraints" : "Adjust Constraints"}</span>
          </Button>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/80">
          <div className="p-2.5 rounded-xl bg-surface border border-border">
            <span className="text-[11px] text-text-muted block">Duration</span>
            <span className="text-sm font-bold text-text">
              {roadmap?.total_estimated_weeks || 24} weeks
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border">
            <span className="text-[11px] text-text-muted block">Pace</span>
            <span className="text-sm font-bold text-text">{hours} hrs/week</span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border">
            <span className="text-[11px] text-text-muted block">Total Cost</span>
            <span className="text-sm font-bold text-emerald-600">
              {formatCurrency(roadmap?.total_estimated_cost || 0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border">
            <span className="text-[11px] text-text-muted block">Roadmap Progress</span>
            <span className="text-sm font-bold text-primary">
              {completedCount} / {totalCount} ({overallProgress}%)
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <ProgressBar progress={overallProgress} size="sm" color="primary" />
        </div>
      </Card>

      {/* Interactive Constraints Drawer */}
      {showFilters && (
        <Card className="border-secondary/40 bg-secondary-subtle/10 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" /> Modify Hard Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-medium text-text-muted block mb-1">
                Hours Per Week
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                min={1}
                max={40}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-text"
              />
            </div>

            <div>
              <label className="font-medium text-text-muted block mb-1">
                Monthly Budget (USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-text"
              />
            </div>

            <div>
              <label className="font-medium text-text-muted block mb-1">
                Desired Timeline (Months)
              </label>
              <input
                type="number"
                value={timelineMonths}
                onChange={(e) => setTimelineMonths(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-text"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" onClick={handleRegenerate} isLoading={loading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Optimize Roadmap
            </Button>
          </div>
        </Card>
      )}

      {/* Feasibility Evaluation Notice */}
      {roadmap?.feasibility && (
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
            roadmap.feasibility.is_feasible
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
              : "bg-amber-50/70 border-amber-200 text-amber-800"
          }`}
        >
          {roadmap.feasibility.is_feasible ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-semibold">Feasibility Assessment: </span>
            {roadmap.feasibility.notes}
          </div>
        </div>
      )}

      {/* Sequenced Milestones */}
      <div>
        <h2 className="text-sm font-bold text-text mb-3">
          Chronological Learning Milestones ({roadmap?.milestones.length || 0})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {roadmap?.milestones.map((m) => (
              <MilestoneCard
                key={m.milestone_id}
                milestone={m}
                onStatusChange={handleMilestoneStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
