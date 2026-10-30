"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <AppLayout>
      <Header
        title="Career Intelligence Chat"
        subtitle="Discuss capabilities, projects, and receive personalized gap analyses"
      />
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow />
      </div>
    </AppLayout>
  );
}
