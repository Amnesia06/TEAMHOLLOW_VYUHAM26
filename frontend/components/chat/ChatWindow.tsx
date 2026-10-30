"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ExamplePrompts } from "@/components/chat/ExamplePrompts";
import { useChat } from "@/hooks/useChat";
import { Sparkles, Bot } from "lucide-react";

export const ChatWindow: React.FC = () => {
  const { messages, isLoading, activeAgents, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 md:px-6">
      {/* Scrollable message feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text">Your career, understood.</h2>
            <p className="text-sm text-text-muted max-w-md mt-1 mb-8">
              Describe your studies, coding projects, and ambitions. Our multi-agent intelligence
              will extract your capabilities, map transferable skills, and structure a custom learning roadmap.
            </p>
            <ExamplePrompts onSelectPrompt={(prompt) => sendMessage(prompt)} />
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectSuggestion={(sug) => sendMessage(sug)}
            />
          ))
        )}

        {/* Agent Activity Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border shadow-card max-w-sm animate-pulse">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-white">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="overflow-hidden text-xs">
              <p className="font-semibold text-text">
                {activeAgents[0]?.agent || "Career Intelligence Multi-Agent"}
              </p>
              <p className="text-text-muted truncate">
                {activeAgents[0]?.summary || "Analyzing capabilities & searching market roles..."}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Chat Input Bar */}
      <div className="pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
