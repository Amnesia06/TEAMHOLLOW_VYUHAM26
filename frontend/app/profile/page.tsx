"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { ProfileDashboard } from "@/features/profile/ProfileDashboard";

export default function ProfilePage() {
  return (
    <AppLayout>
      <Header
        title="My Career Profile"
        subtitle="Extracted capabilities, project evidence, and verified skill levels"
      />
      <div className="flex-1 overflow-y-auto">
        <ProfileDashboard />
      </div>
    </AppLayout>
  );
}
