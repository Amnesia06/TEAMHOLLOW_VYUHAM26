import React from "react";
import { MessageSquare, Briefcase, Map, BookOpen } from "lucide-react";

export type TabKey = "chat" | "careers" | "roadmap" | "modules";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  hasRoadmap: boolean;
  hasProfile: boolean;
  moduleCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  onTabChange,
  hasRoadmap,
  hasProfile,
  moduleCount,
}) => {
  const navItems: Array<{ key: TabKey; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      key: "chat",
      label: "Chat Assistant",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: "AI Agent",
    },
    {
      key: "careers",
      label: "Careers",
      icon: <Briefcase className="w-5 h-5" />,
      badge: hasProfile ? "Matched" : undefined,
    },
    {
      key: "roadmap",
      label: "Roadmap",
      icon: <Map className="w-5 h-5" />,
      badge: hasRoadmap ? "Active" : undefined,
    },
    {
      key: "modules",
      label: "Study Modules",
      icon: <BookOpen className="w-5 h-5" />,
      badge: moduleCount && moduleCount > 0 ? `${moduleCount} Curated` : undefined,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.06)] z-50 flex flex-col justify-between transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] select-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-1 border-b border-slate-100">
          <div className="flex items-center gap-2.5 w-full justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4648d4] to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md hover:shadow-lg transition-shadow duration-200">
                P
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">PATHWISE</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e9ddff] text-[#23005c] text-[11px] font-semibold">
              v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-0.5 font-medium">Career &amp; Skill-Gap Agent</p>
        </div>

        {/* Navigation Items */}
        <div className="px-4 mt-4">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main Navigation
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] ${
                    isActive
                      ? "bg-[#4648d4] text-white shadow-[0_4px_16px_0_rgba(70,72,212,0.3)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-slate-500"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badge === "Active" || item.badge === "Matched"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        <span>Pathwise v2.0</span>
      </div>
    </aside>
  );
};
