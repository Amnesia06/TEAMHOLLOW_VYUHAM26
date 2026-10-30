"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { ChatMessage, AgentActivity } from "@/lib/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeAgents, setActiveAgents] = useState<AgentActivity[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I'm a computer science graduate. What careers suit me?",
    "Help me identify my skill gaps for AI engineering.",
    "I have a limited budget. Create a learning roadmap.",
    "Analyze my resume and discover my transferable skills.",
  ]);

  useEffect(() => {
    // Initialize session ID from storage or create new
    const saved = localStorage.getItem("pathwise_session_id");
    if (saved) {
      setSessionId(saved);
    } else {
      const newId = `sess_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("pathwise_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string, resumeAttachment?: string) => {
      if (!text.trim() && !resumeAttachment) return;

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Temporary agent indicator
      setActiveAgents([
        { agent: "ProfileAgent", status: "started", summary: "Analyzing capabilities..." },
      ]);

      try {
        const attachments = resumeAttachment
          ? [{ type: "resume", content: resumeAttachment, filename: "resume.txt" }]
          : undefined;

        const response = await api.sendMessage(text, sessionId, attachments);

        if (response.session_id) {
          setSessionId(response.session_id);
          localStorage.setItem("pathwise_session_id", response.session_id);
        }

        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          agent_activity: response.agent_activity,
          ui_components: response.ui_components,
          follow_up_suggestions: response.follow_up_suggestions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (response.follow_up_suggestions?.length) {
          setSuggestions(response.follow_up_suggestions);
        }
        setActiveAgents(response.agent_activity || []);
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Showing local demonstration insights for your background in Computer Science, C++, and Autonomous Rover navigation.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  return {
    messages,
    isLoading,
    activeAgents,
    suggestions,
    sendMessage,
  };
}
