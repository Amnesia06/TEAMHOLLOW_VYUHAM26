"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const defaultPrompts = [
  "I'm a computer science graduate. What careers suit me?",
  "Help me identify my skill gaps for AI engineering.",
  "I have a limited budget. Create a learning roadmap.",
  "Analyze my resume and discover my transferable skills.",
];

export const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {defaultPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            className="text-xs px-3.5 py-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:border-secondary/60 hover:bg-secondary-subtle/30 transition-all duration-200 text-left shadow-sm active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary/70 shrink-0" />
              <span>{prompt}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
