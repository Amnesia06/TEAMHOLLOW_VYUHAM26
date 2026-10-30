"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  User,
  Compass,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Explore Careers", href: "/careers", icon: Compass },
  { name: "My Roadmap", href: "/roadmap", icon: MapPin },
  { name: "Resources", href: "/resources", icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-surface border-r border-border transition-all duration-300 flex flex-col justify-between z-30 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight text-text">
                Pathwise
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/chat" && pathname === "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary-subtle text-primary font-semibold"
                    : "text-text-muted hover:text-text hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-text-muted group-hover:text-text"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Mini Card */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-subtle border border-secondary/30 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
            CS
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-text truncate">Demo Student</p>
              <p className="text-[11px] text-text-muted truncate">CS Graduate (Guest)</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
