"use client";

import React, { Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { RoadmapView } from "@/features/roadmap/RoadmapView";

export default function RoadmapPage() {
  return (
    <AppLayout>
      <Header
        title="Personalized Roadmap"
        subtitle="Optimized learning milestones respecting your weekly availability and budget"
      />
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-8 max-w-5xl mx-auto space-y-4">
              <div className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-60 rounded-2xl bg-gray-200 animate-pulse" />
            </div>
          }
        >
          <RoadmapView />
        </Suspense>
      </div>
    </AppLayout>
  );
}
