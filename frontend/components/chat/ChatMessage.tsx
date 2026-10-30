"use client";

import React from "react";
import { ChatMessage as ChatMessageType, UIComponent } from "@/lib/types";
import { CareerCard } from "@/components/cards/CareerCard";
import { Sparkles, Bot, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectSuggestion?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const isUser = message.role === "user";

  const renderUIComponent = (comp: UIComponent, idx: number) => {
    switch (comp.type) {
      case "career_card":
        return <CareerCard key={idx} career={comp.data} />;

      case "transferable_skills":
        return (
          <div
            key={idx}
            className="my-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs"
          >
            <div className="flex items-center gap-2 font-semibold text-primary mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Transferable Skills Discovered</span>
            </div>
            <p className="text-text-muted mb-2.5">{comp.data.insight}</p>
            <div className="space-y-1.5">
              {comp.data.skills?.map((s: any, sIdx: number) => (
                <div
                  key={sIdx}
                  className="p-2 rounded-xl bg-surface border border-purple-100 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-text">{s.skill}: </span>
                    <span className="text-text-muted">{s.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 my-4 animate-fadeIn",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={cn("max-w-[85%] md:max-w-[75%]", isUser && "text-right")}>
        {/* Main message bubble */}
        <div
          className={cn(
            "p-4 rounded-2xl text-sm leading-relaxed shadow-card inline-block text-left",
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-surface border border-border text-text rounded-tl-sm"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Dynamic UI Components rendered directly within AI responses */}
        {!isUser && message.ui_components && message.ui_components.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.ui_components.map((comp, idx) => renderUIComponent(comp, idx))}
          </div>
        )}

        {/* Follow up suggestions pills */}
        {!isUser &&
          message.follow_up_suggestions &&
          message.follow_up_suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {message.follow_up_suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion?.(sug)}
                  className="text-xs px-3 py-1 rounded-xl bg-surface border border-border text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary-subtle/30 transition-colors shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

        <div className="text-[10px] text-text-subtle mt-1 px-1">
          {message.timestamp}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-secondary-subtle border border-secondary/30 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
