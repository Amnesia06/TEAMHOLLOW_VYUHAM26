"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CareerRecommendation } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CareerCardProps {
  career: CareerRecommendation;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card hoverEffect className="border-border/80 shadow-subtle my-3">
      {/* Header with Title and Match Score */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {career.category || "Career Match"}
            </span>
            {career.growth_outlook && (
              <Badge variant="primary" size="sm" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{career.growth_outlook}</span>
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-text">{career.role}</h3>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
            {career.description}
          </p>
        </div>

        {/* Circular Match Score Badge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-primary-subtle border border-primary/20 flex flex-col items-center justify-center text-primary">
            <span className="text-base font-extrabold leading-none">
              {career.match_percentage}%
            </span>
            <span className="text-[10px] font-semibold uppercase mt-0.5">Match</span>
          </div>
        </div>
      </div>

      {/* Match Explanation */}
      <div className="mt-3.5 p-3 rounded-xl bg-gray-50/80 border border-border/60 text-xs text-text leading-relaxed">
        <span className="font-semibold text-text">Why you match: </span>
        {career.match_explanation}
      </div>

      {/* Key Skills Row */}
      <div className="mt-4 space-y-2">
        {/* Direct Matches */}
        {career.matching_skills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> Direct Matches:
            </span>
            {career.matching_skills.map((m) => (
              <span
                key={m.skill}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
              >
                {m.skill}
              </span>
            ))}
          </div>
        )}

        {/* Transferable Skills */}
        {career.transferable_skills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Transferable:
            </span>
            {career.transferable_skills.map((t) => (
              <span
                key={t.skill}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-primary-subtle text-primary border border-primary/20 font-medium"
                title={t.explanation}
              >
                {t.skill}
              </span>
            ))}
          </div>
        )}

        {/* Missing / High-Priority Gaps */}
        {career.missing_skills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-accent-rose" /> Skill Gaps:
            </span>
            {career.missing_skills.slice(0, 3).map((g) => (
              <span
                key={g.skill}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium"
              >
                {g.skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Details Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3 text-xs">
          {career.transferable_skills.map((t) => (
            <div key={t.skill} className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100">
              <div className="font-semibold text-primary flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Transferable: {t.skill}
              </div>
              <p className="text-text-muted">{t.explanation}</p>
            </div>
          ))}

          <div className="flex justify-between items-center text-text-muted text-[11px] pt-1">
            <span>Market Data Source: {career.data_source || "Curated Tech Index"}</span>
            <span>Salary: {career.salary_range || "Competitive"}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-text-muted hover:text-text font-medium flex items-center gap-1 transition-colors"
        >
          <span>{expanded ? "Show less" : "Explain breakdown"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <Link href={`/roadmap?role=${encodeURIComponent(career.role)}`}>
          <Button size="sm" variant="primary" className="gap-1.5 text-xs">
            <span>Create Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
