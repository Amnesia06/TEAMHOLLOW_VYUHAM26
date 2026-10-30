"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, MessageSquare, Compass, MapPin, User, BookOpen } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ExamplePrompts } from "@/components/chat/ExamplePrompts";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useChat } from "@/hooks/useChat";

export default function HomePage() {
  const router = useRouter();
  const { messages, isLoading, sendMessage } = useChat();
  const [hasStartedConvo, setHasStartedConvo] = useState(false);

  const handleSend = (text: string, resumeContent?: string) => {
    setHasStartedConvo(true);
    sendMessage(text, resumeContent);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Minimal Top Nav */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-border/60 bg-surface/70 backdrop-blur-md sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-text">
            Pathwise
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-xs font-medium text-text-muted">
          <Link href="/profile" className="hover:text-text transition-colors">
            Profile
          </Link>
          <Link href="/careers" className="hover:text-text transition-colors">
            Careers
          </Link>
          <Link href="/roadmap" className="hover:text-text transition-colors">
            Roadmap
          </Link>
          <Link href="/resources" className="hover:text-text transition-colors">
            Resources
          </Link>
          <Link
            href="/chat"
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-semibold transition-colors shadow-sm"
          >
            Launch Chat
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        {!hasStartedConvo ? (
          <div className="w-full text-center space-y-6 animate-fadeIn">
            {/* Elegant Hero Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-subtle text-primary border border-primary/20 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Career Intelligence Agent</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-text tracking-tight">
                Your career, understood.
              </h1>
              <p className="text-sm sm:text-base text-text-muted max-w-md mx-auto leading-relaxed">
                Tell us where you are. Discover where you can go.
              </p>
            </div>

            {/* Central Elegant Chat Input */}
            <div className="pt-2">
              <ChatInput onSendMessage={handleSend} isLoading={isLoading} autoFocus />
            </div>

            {/* Subtle Example Prompts */}
            <ExamplePrompts onSelectPrompt={(prompt) => handleSend(prompt)} />
          </div>
        ) : (
          /* Inline Active Chat Stream */
          <div className="w-full space-y-4 animate-fadeIn">
            <div className="space-y-4 mb-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectSuggestion={(sug) => handleSend(sug)}
                />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border shadow-card max-w-xs animate-pulse text-xs text-text-muted">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>Synthesizing career opportunities & skill gaps...</span>
                </div>
              )}
            </div>

            <div className="sticky bottom-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
              <ChatInput onSendMessage={handleSend} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 text-center text-xs text-text-muted border-t border-border/40">
        <p>Pathwise • Complex intelligence behind a minimal interface</p>
      </footer>
    </div>
  );
}
