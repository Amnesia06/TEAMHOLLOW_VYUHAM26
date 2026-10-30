import React, { useState, useEffect } from "react";
import { UserConstraints, Profile, Roadmap, ProgressEvent } from "./types/contracts";
import { MOCK_PROFILE, MOCK_ROADMAP } from "./mocks/mockData";
import { api } from "./lib/api";
import { Sidebar, TabKey } from "./components/layout/Sidebar";
import { ChatView, ChatMessage } from "./components/chat/ChatView";
import { CareersView } from "./components/views/CareersView";
import { StudyModulesView } from "./components/views/StudyModulesView";
import { ResultsView } from "./components/ResultsView";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { MessageSquare, Map, User, PanelLeftClose, PanelLeft, Plus } from "lucide-react";
import { AuthModal } from "./components/auth/AuthModal";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // M14 Auth State (Guest Mode vs Signed-in)
  const [currentUser, setCurrentUser] = useState<{ email?: string; isGuest: boolean }>(() => {
    const saved = localStorage.getItem("pathwise_user");
    return saved ? JSON.parse(saved) : { isGuest: true };
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistent or in-memory chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedUser = localStorage.getItem("pathwise_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.isGuest && u.email) {
          const raw = localStorage.getItem(`pathwise_user_session_${u.email}`);
          if (raw) return JSON.parse(raw).messages || [];
        }
      } catch {}
    }
    return [];
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const savedUser = localStorage.getItem("pathwise_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.isGuest && u.email) {
          const raw = localStorage.getItem(`pathwise_user_session_${u.email}`);
          if (raw) {
            const parsed = JSON.parse(raw).profile;
            if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
              return parsed;
            }
          }
        }
      } catch {}
    }
    return MOCK_PROFILE;
  });

  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    const savedUser = localStorage.getItem("pathwise_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.isGuest && u.email) {
          const raw = localStorage.getItem(`pathwise_user_session_${u.email}`);
          if (raw) {
            const parsed = JSON.parse(raw).roadmap;
            // Upgrade legacy single-item mock to full 6-module MOCK_ROADMAP
            if (parsed && Array.isArray(parsed.items) && parsed.items.length > 1) {
              return parsed;
            }
          }
        }
      } catch {}
    }
    return MOCK_ROADMAP;
  });

  const [constraints, setConstraints] = useState<UserConstraints>(() => {
    const savedUser = localStorage.getItem("pathwise_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.isGuest && u.email) {
          const raw = localStorage.getItem(`pathwise_user_session_${u.email}`);
          if (raw) {
            const c = JSON.parse(raw).constraints;
            if (c) return c;
          }
        }
      } catch {}
    }
    return {
      budget: 0,
      currency: "INR",
      weekly_hours: 15,
      target_timeline: null,
      target_role: "Full-Stack Developer",
    };
  });

  // Guest Mode beforeunload warning: prompt confirmation if guest has active work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentUser.isGuest && (messages.length > 0 || profile || roadmap)) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentUser.isGuest, messages.length, profile, roadmap]);

  // Auto-sync session data for authenticated accounts
  useEffect(() => {
    if (!currentUser.isGuest && currentUser.email) {
      const sessionData = {
        email: currentUser.email,
        messages,
        profile,
        roadmap,
        constraints,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`pathwise_user_session_${currentUser.email}`, JSON.stringify(sessionData));
      api.saveUserSession(currentUser.email, sessionData);
    }
  }, [currentUser, messages, profile, roadmap, constraints]);

  const handleSignIn = async (email: string) => {
    const user = { email, isGuest: false };
    setCurrentUser(user);
    localStorage.setItem("pathwise_user", JSON.stringify(user));

    // 1. Try local storage first
    let savedSession: any = null;
    try {
      const raw = localStorage.getItem(`pathwise_user_session_${email}`);
      if (raw) savedSession = JSON.parse(raw);
    } catch {}

    // 2. If not local, try backend
    if (!savedSession) {
      try {
        savedSession = await api.getUserSession(email);
      } catch {}
    }

    if (savedSession) {
      if (savedSession.messages) setMessages(savedSession.messages);
      if (savedSession.profile) setProfile(savedSession.profile);
      if (savedSession.roadmap) {
        if (Array.isArray(savedSession.roadmap.items) && savedSession.roadmap.items.length > 1) {
          setRoadmap(savedSession.roadmap);
        } else {
          setRoadmap(MOCK_ROADMAP);
        }
      } else {
        setRoadmap(MOCK_ROADMAP);
      }
      if (savedSession.constraints) setConstraints(savedSession.constraints);
    } else {
      // Migrate active work to new account if present
      const initialSession = {
        email,
        messages,
        profile,
        roadmap,
        constraints,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`pathwise_user_session_${email}`, JSON.stringify(initialSession));
      api.saveUserSession(email, initialSession);
    }
  };

  const handleSignOut = () => {
    // Clear active in-memory session back to fresh Guest state with standard demo defaults
    setMessages([]);
    setProfile(MOCK_PROFILE);
    setRoadmap(MOCK_ROADMAP);
    setConstraints({
      budget: 0,
      currency: "INR",
      weekly_hours: 15,
      target_timeline: null,
      target_role: "Full-Stack Developer",
    });
    const guest = { isGuest: true };
    setCurrentUser(guest);
    localStorage.removeItem("pathwise_user");
    setActiveTab("chat");
  };

  const handleUpdateConstraints = (updated: Partial<UserConstraints>) => {
    setConstraints((prev) => ({ ...prev, ...updated }));
  };

  const [chatInputPrompt, setChatInputPrompt] = useState<string>("");

  const handleAnalyze = async (resumeText: string, userConstraints: UserConstraints): Promise<{ profile: Profile; roadmap: Roadmap; events?: ProgressEvent[] } | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    setProgressEvents([]);
    setConstraints(userConstraints);

    try {
      const capturedEvents: ProgressEvent[] = [];
      const result = await api.analyze(resumeText, userConstraints, (event) => {
        capturedEvents.push(event);
        setProgressEvents((prev) => [...prev, event]);
      });

      setProfile(result.profile);
      setRoadmap(result.roadmap);
      return { ...result, events: capturedEvents };
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMessage(err.message || "Failed to complete career path analysis.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoleFromCareers = async (roleTitle: string) => {
    const updatedConstraints: UserConstraints = {
      ...constraints,
      target_role: roleTitle,
      weekly_hours: constraints.weekly_hours > 0 ? constraints.weekly_hours : 10,
    };
    handleUpdateConstraints(updatedConstraints);
    setActiveTab("chat");

    const userPrompt = `Generate a personalized learning roadmap for ${roleTitle}.`;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    const resumeSource = profile?.skills?.map((s) => s.name).join(", ") || `Targeting career path: ${roleTitle}`;
    const result = await handleAnalyze(resumeSource, updatedConstraints);
    if (result && result.roadmap && result.profile) {
      const roadmapAssistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `I've analyzed your competency gaps against live **${roleTitle}** requirements. Here is your verified learning roadmap:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        profile: result.profile,
        roadmap: result.roadmap,
        events: result.events || progressEvents,
      };
      setMessages((prev) => [...prev, roadmapAssistantMsg]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setProfile(MOCK_PROFILE);
    setRoadmap(MOCK_ROADMAP);
    setConstraints({
      budget: 0,
      currency: "INR",
      weekly_hours: 15,
      target_timeline: null,
      target_role: "Full-Stack Developer",
    });
    setChatInputPrompt("");
    setActiveTab("chat");
  };

  return (
    <div className="flex min-h-screen bg-[#faf8ff] antialiased text-[#131b2e]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        hasRoadmap={!!roadmap}
        hasProfile={!!profile}
        moduleCount={roadmap?.items?.length}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? "md:pl-[280px]" : "pl-0"
        }`}
      >
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/70 bg-white/98 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 ease-out cursor-pointer active:scale-95"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
              {activeTab === "chat" && "AI Career Assistant"}
              {activeTab === "careers" && "Target Role Benchmarks"}
              {activeTab === "roadmap" && "Personalized Learning Roadmap"}
              {activeTab === "modules" && "Curated Study Modules"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e1e0ff] text-[#07006c] hover:bg-[#d0bcff] font-semibold text-xs transition-all duration-200 ease-out cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
              title="Start a fresh chat conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW CHAT</span>
            </button>

            {/* User Auth (M14) */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all duration-200 ease-out cursor-pointer active:scale-[0.97]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <User className="w-3.5 h-3.5 text-[#4648d4]" />
              <span>{currentUser.isGuest ? "Guest Mode" : currentUser.email}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className={`flex-1 flex flex-col min-w-0 ${activeTab === "chat" ? "h-[calc(100vh-4rem)] overflow-hidden p-0" : "p-4 md:p-6 lg:p-8"}`}>
          {errorMessage && (
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-accent-roseSubtle border border-accent-rose/30 rounded-xl text-accent-rose text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">Error: </span>
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Chat Tab (Fit to viewport, zero outer scroll, internal chat stream only) */}
          <div className={`h-full flex-1 flex flex-col ${activeTab === "chat" ? "block" : "hidden"}`}>
            <ChatView
              isSidebarOpen={isSidebarOpen}
              messages={messages}
              setMessages={setMessages}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              progressEvents={progressEvents}
              constraints={constraints}
              onUpdateConstraints={handleUpdateConstraints}
              onNavigateToRoadmap={() => setActiveTab("roadmap")}
              inputPrompt={chatInputPrompt}
              onClearInputPrompt={() => setChatInputPrompt("")}
              onClearChat={handleNewChat}
            />
          </div>

          {/* Outer Boundary Box for Careers, Roadmap, and Study Modules (Framed, Zoomed-Out, Natural Page Scroll) */}
          {activeTab !== "chat" && (
            <div className="max-w-6xl mx-auto w-full pb-20">
              {/* 2. Careers Tab */}
              <div className={activeTab === "careers" ? "block" : "hidden"}>
                <CareersView
                  profile={profile}
                  onSelectRole={handleSelectRoleFromCareers}
                  activeTargetRole={constraints.target_role}
                  onNavigateToChat={() => setActiveTab("chat")}
                />
              </div>

              {/* 3. Roadmap Tab */}
              <div className={activeTab === "roadmap" ? "block" : "hidden"}>
                {roadmap && profile ? (
                  <ResultsView
                    profile={profile}
                    roadmap={roadmap}
                    constraints={constraints}
                    onReset={() => setActiveTab("chat")}
                  />
                ) : (
                  <div className="max-w-xl mx-auto my-16 text-center space-y-4">
                    <Card className="p-8 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center mx-auto">
                        <Map className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-text">No Roadmap Generated Yet</h3>
                      <p className="text-xs text-text-muted max-w-sm mx-auto">
                        Submit your resume or explore your target role in the <b>Chat Assistant</b> to compute your skill gaps and generate a verified roadmap.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab("chat")}
                        className="gap-2 mx-auto"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Go to Chat Assistant
                      </Button>
                    </Card>
                  </div>
                )}
              </div>

              {/* 4. Study Modules Tab */}
              <div className={activeTab === "modules" ? "block" : "hidden"}>
                <StudyModulesView
                  roadmap={roadmap}
                  targetRole={constraints.target_role || undefined}
                  currency={constraints.currency || "INR"}
                  onNavigateToChat={() => setActiveTab("chat")}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* M14 Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
    </div>
  );
};

export default App;
