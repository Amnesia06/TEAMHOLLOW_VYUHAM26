"use client";

import React, { useState } from "react";
import { Milestone } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MilestoneCardProps {
  milestone: Milestone;
  onStatusChange?: (milestoneId: string, completed: boolean) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onStatusChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = milestone.status === "completed" || milestone.progress === 100;

  return (
    <Card
      className={`border transition-all my-3 ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/20"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Completion Toggle */}
          <button
            onClick={() => onStatusChange?.(milestone.milestone_id, !isCompleted)}
            className="mt-1 text-text-muted hover:text-primary transition-colors"
            title={isCompleted ? "Mark incomplete" : "Mark completed"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-accent-green" />
            ) : (
              <Circle className="w-5 h-5 text-text-subtle hover:text-primary" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary">
                Step {milestone.order}
              </span>
              {milestone.schedule_window && (
                <span className="text-[11px] text-text-muted">
                  • {milestone.schedule_window}
                </span>
              )}
            </div>

            <h3
              className={`font-semibold text-sm ${
                isCompleted ? "line-through text-text-muted" : "text-text"
              }`}
            >
              {milestone.title}
            </h3>

            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {milestone.description}
            </p>
          </div>
        </div>

        {/* Cost & Hours Badge */}
        <div className="flex flex-col items-end gap-1 shrink-0 text-xs">
          <Badge variant={milestone.estimated_cost === 0 ? "success" : "neutral"} size="sm">
            {formatCurrency(milestone.estimated_cost)}
          </Badge>
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {milestone.estimated_hours}h
          </span>
        </div>
      </div>

      {/* Rationale explanation alert */}
      {milestone.priority_explanation && (
        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-border/80 text-[11px] text-text-muted leading-relaxed">
          <span className="font-semibold text-text">Prerequisite Rationale: </span>
          {milestone.priority_explanation}
        </div>
      )}

      {/* Skills Covered */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-text-muted font-medium">Covers:</span>
        {milestone.skills_covered.map((s) => (
          <span
            key={s}
            className="text-[11px] px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <ProgressBar
          progress={milestone.progress}
          size="sm"
          color={isCompleted ? "success" : "primary"}
        />
      </div>

      {/* Recommended Learning Resources Dropdown */}
      {milestone.resources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-text-muted hover:text-text font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              {milestone.resources.length} Curated Learning Material
              {milestone.resources.length > 1 ? "s" : ""}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 space-y-2">
              {milestone.resources.map((res) => (
                <div
                  key={res.resource_id}
                  className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs hover:border-secondary transition-colors"
                >
                  <div className="overflow-hidden pr-3">
                    <p className="font-medium text-text truncate">{res.title}</p>
                    <p className="text-[11px] text-text-muted">{res.provider} • {res.type} • {res.estimated_hours}h</p>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 text-primary hover:text-primary-hover font-semibold px-2 py-1 rounded-lg bg-primary-subtle"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
