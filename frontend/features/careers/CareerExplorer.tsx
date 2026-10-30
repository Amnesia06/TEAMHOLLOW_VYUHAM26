"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CareerRecommendation } from "@/lib/types";
import { CareerCard } from "@/components/cards/CareerCard";
import { Search, Compass, Sparkles } from "lucide-react";

export const CareerExplorer: React.FC = () => {
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadCareers() {
      try {
        setLoading(true);
        const data = await api.getRecommendations();
        setCareers(data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const filtered = careers.filter(
    (c) =>
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-text">Explore Career Opportunities</h1>
          </div>
          <p className="text-xs text-text-muted">
            Ranked by capability overlap, transferable project competencies, and live market requirements.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-surface border border-border focus:outline-none focus:border-primary text-text placeholder:text-text-subtle shadow-sm"
          />
        </div>
      </div>

      {/* Career Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <Compass className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
          <h3 className="font-semibold text-text text-sm">No matching career paths found</h3>
          <p className="text-xs text-text-muted mt-1">Try broadening your search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((career) => (
            <CareerCard key={career.role_id || career.role} career={career} />
          ))}
        </div>
      )}
    </div>
  );
};
