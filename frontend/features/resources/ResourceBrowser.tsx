"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { LearningResource } from "@/lib/types";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { BookOpen, Search, Filter } from "lucide-react";

export const ResourceBrowser: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [maxCostFilter, setMaxCostFilter] = useState<string>("all");

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getResources({
        skill: skillFilter || undefined,
        type: typeFilter || undefined,
        max_cost: maxCostFilter === "free" ? 0 : undefined,
      });
      setResources(data);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [skillFilter, typeFilter, maxCostFilter]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-text">Learning Resource Catalog</h1>
        </div>
        <p className="text-xs text-text-muted">
          Curated open-access documentation, university courses, and practical interactive tutorials.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by skill (e.g. Python, PyTorch, ROS)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-surface border border-border focus:outline-none focus:border-primary text-text placeholder:text-text-subtle shadow-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-surface border border-border text-text focus:outline-none focus:border-primary shadow-sm"
        >
          <option value="">All Formats</option>
          <option value="course">Courses</option>
          <option value="documentation">Documentation</option>
          <option value="video">Videos</option>
          <option value="interactive">Interactive</option>
          <option value="project">Projects</option>
        </select>

        <select
          value={maxCostFilter}
          onChange={(e) => setMaxCostFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-surface border border-border text-text focus:outline-none focus:border-primary shadow-sm"
        >
          <option value="all">Any Cost</option>
          <option value="free">100% Free / Open Source</option>
        </select>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
          <h3 className="font-semibold text-text text-sm">No resources match your filter</h3>
          <p className="text-xs text-text-muted mt-1">Try resetting filters to view all entries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <ResourceCard key={res.resource_id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
};
