"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && <h1 className="text-base font-semibold text-text">{title}</h1>}
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Link href="/chat">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Open Chat</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
