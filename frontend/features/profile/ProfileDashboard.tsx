"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillBadge } from "@/components/cards/SkillBadge";
import {
  GraduationCap,
  Briefcase,
  Code,
  Target,
  Clock,
  DollarSign,
  Edit3,
  Check,
  Award,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const ProfileDashboard: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [hours, setHours] = useState<number>(5);
  const [budget, setBudget] = useState<number>(0);

  if (loading || !profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3 animate-pulse" />
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const handleSavePreferences = async () => {
    await updateProfile({
      learning_preferences: {
        hours_per_week: hours,
        budget_monthly: budget,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner with Profile Completeness */}
      <Card className="bg-gradient-to-r from-primary-subtle/50 via-white to-secondary-subtle/40 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Active Career Profile
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                Verified from Project Evidence
              </span>
            </div>
            <h2 className="text-2xl font-bold text-text">
              {profile.education[0]?.degree || "Computer Science Graduate"}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Extracted via Pathwise Conversational Profiler
            </p>
          </div>

          <div className="w-full md:w-56 shrink-0 bg-surface p-3.5 rounded-xl border border-border shadow-sm">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-text">Profile Completeness</span>
              <span className="font-bold text-primary">
                {Math.round((profile.completeness || 0.65) * 100)}%
              </span>
            </div>
            <ProgressBar progress={(profile.completeness || 0.65) * 100} size="sm" />
          </div>
        </div>
      </Card>

      {/* Grid: Skills and Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Skills & Education */}
        <div className="md:col-span-2 space-y-6">
          {/* Extracted & Verified Skills */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text">Demonstrated Capabilities</h3>
              </div>
              <span className="text-xs text-text-muted">{profile.skills.length} skills identified</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <SkillBadge
                  key={skill.name}
                  name={skill.name}
                  proficiency={skill.proficiency}
                  hasEvidence={skill.evidence?.length > 0}
                />
              ))}
            </div>
          </Card>

          {/* Practical Projects */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-text">Demonstrated Projects</h3>
            </div>

            <div className="space-y-4">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/70 border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-semibold text-sm text-text">{proj.name}</h4>
                    <span className="text-[11px] font-medium text-primary bg-primary-subtle px-2 py-0.5 rounded-md">
                      Autonomy & Navigation
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-text font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-text">Education</h3>
            </div>
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-text">{edu.degree}</p>
                  <p className="text-text-muted">{edu.institution}</p>
                </div>
                {edu.year && <span className="text-text-muted">{edu.year}</span>}
              </div>
            ))}
          </Card>
        </div>

        {/* Right Column: Preferences & Goals */}
        <div className="space-y-6">
          {/* Target Ambitions */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-text">Career Goals</h3>
            </div>
            <div className="space-y-2">
              {profile.career_goals.map((goal, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-primary-subtle/40 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text">Constraints</h3>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-text-muted font-medium block mb-1">
                    Hours Available Per Week
                  </label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    min={1}
                    max={40}
                    className="w-full px-3 py-1.5 border border-border rounded-lg text-text bg-surface"
                  />
                </div>
                <div>
                  <label className="text-text-muted font-medium block mb-1">
                    Monthly Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-1.5 border border-border rounded-lg text-text bg-surface"
                  />
                </div>
                <Button size="sm" className="w-full mt-2" onClick={handleSavePreferences}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Constraints
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                  <span className="text-text-muted">Weekly Availability</span>
                  <span className="font-semibold text-text">
                    {profile.learning_preferences.hours_per_week || 5} hours/week
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                  <span className="text-text-muted">Monthly Budget</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(profile.learning_preferences.budget_monthly || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-text-muted">Preferred Style</span>
                  <span className="font-semibold text-text">
                    {profile.learning_preferences.preferred_format || "Open-Access / Hands-on"}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
