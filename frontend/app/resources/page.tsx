"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { ResourceBrowser } from "@/features/resources/ResourceBrowser";

export default function ResourcesPage() {
  return (
    <AppLayout>
      <Header
        title="Learning Resources"
        subtitle="Verified courses, documentation, and open-source projects"
      />
      <div className="flex-1 overflow-y-auto">
        <ResourceBrowser />
      </div>
    </AppLayout>
  );
}
