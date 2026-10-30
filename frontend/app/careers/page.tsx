"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { CareerExplorer } from "@/features/careers/CareerExplorer";

export default function CareersPage() {
  return (
    <AppLayout>
      <Header
        title="Career Matches"
        subtitle="Roles mapped against your current and transferable skills"
      />
      <div className="flex-1 overflow-y-auto">
        <CareerExplorer />
      </div>
    </AppLayout>
  );
}
