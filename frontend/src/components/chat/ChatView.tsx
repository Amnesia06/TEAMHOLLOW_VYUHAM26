import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Mic,
  ArrowUp,
  Bot,
  FileText,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { UserConstraints, Profile, Roadmap, ProgressEvent } from "../../types/contracts";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isResumeSubmission?: boolean;
  resumeSummary?: string;
  fullResumeText?: string;
  fileName?: string;
  profile?: Profile;
  roadmap?: Roadmap;
  events?: ProgressEvent[];
}

export interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onAnalyze: (resumeText: string, constraints: UserConstraints) => Promise<{ profile: Profile; roadmap: Roadmap } | null>;
  isLoading: boolean;
  progressEvents: ProgressEvent[];
  constraints: UserConstraints;
  onUpdateConstraints: (updated: Partial<UserConstraints>) => void;
  onNavigateToRoadmap: () => void;
  inputPrompt?: string;
  onClearInputPrompt?: () => void;
  onClearChat?: () => void;
  isSidebarOpen?: boolean;
}

const PIPELINE_STEPS: { step: ProgressEvent["step"]; label: string; description: string }[] = [
  { step: "Profiler", label: "M1 Profiler Agent", description: "Extracting skills & candidate competencies" },
  { step: "Market Intelligence", label: "M2 Market Intelligence", description: "Querying live job requirements & market demand" },
  { step: "Gap Analyzer", label: "M3 Gap Analyzer", description: "Computing skill gaps & priority scoring" },
  { step: "Planner", label: "M4 Deterministic Planner", description: "Topological sequencing & knapsack optimization" },
  { step: "Verifier", label: "M5 Plan Verifier", description: "Validating deterministic curriculum integrity rules" },
  { step: "Explainer", label: "M6 Explainer Agent", description: "Synthesizing evidence-based rationale" },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  onAnalyze,
  isLoading,
  progressEvents,
  constraints,
  onUpdateConstraints,
  onNavigateToRoadmap,
  inputPrompt,
  onClearInputPrompt,
  isSidebarOpen = true,
}) => {
  const [inputText, setInputText] = useState("");
  const [pendingResumeText, setPendingResumeText] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isProcessing = Boolean(isLoading || isAiThinking);

  useEffect(() => {
    if (inputPrompt) {
      setInputText(inputPrompt);
      onClearInputPrompt?.();
    }
  }, [inputPrompt, onClearInputPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, progressEvents, isAiThinking, isLoading, isProcessing]);

  // Natural language extraction for user constraints
  const extractConstraintsFromText = (text: string): Partial<UserConstraints> => {
    const extracted: Partial<UserConstraints> = {};
    const textLower = text.toLowerCase();

    // Hours extraction: "15 hours", "10 hrs/wk", "2 hours a day" (2*7=14)
    const dailyHoursMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:a\s*day|daily|per\s*day)/);
    if (dailyHoursMatch) {
      extracted.weekly_hours = Math.round(parseFloat(dailyHoursMatch[1]) * 7);
    } else {
      const weeklyHoursMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)(?:\s*(?:\/|\s*per\s*)week)?/);
      if (weeklyHoursMatch) {
        extracted.weekly_hours = parseFloat(weeklyHoursMatch[1]);
      }
    }

    // Budget extraction: "free", "$0", "₹0", "budget 100", "5000 inr"
    if (textLower.includes("free") || textLower.includes("$0") || textLower.includes("₹0") || textLower.includes("zero budget")) {
      extracted.budget = 0;
    } else {
      const budgetMatch = textLower.match(/(?:₹|\$|inr\s*|budget(?:\s*of)?\s*)(\d+(?:\.\d+)?)/);
      if (budgetMatch) {
        extracted.budget = parseFloat(budgetMatch[1]);
      }
    }

    // Currency: default to INR unless USD ($) is specifically typed
    if (textLower.includes("usd") || textLower.includes("$") || textLower.includes("dollars")) {
      extracted.currency = "USD";
    } else if (textLower.includes("inr") || textLower.includes("₹") || textLower.includes("rupees")) {
      extracted.currency = "INR";
    }

    // Target role detection
    const rolePrefixMatch = textLower.match(/(?:target\s*role|role|position|become(?:\s*a)?|transition\s*to(?:\s*a)?)\s*(?::|\s)\s*([a-zA-Z0-9\.\+\#\-\s]{3,35})/);
    if (rolePrefixMatch) {
      extracted.target_role = rolePrefixMatch[1].trim().replace(/\.$/, "");
    }

    return extracted;
  };

  const handleSend = async (customPrompt?: string, customResume?: string, roleOverride?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && !customResume && !pendingResumeText) return;

    const resumeToUse = customResume || pendingResumeText || textToSend;
    const isLikelyResume =
      customResume ||
      textToSend.length > 200 ||
      textToSend.toLowerCase().includes("experience") ||
      textToSend.toLowerCase().includes("skills:") ||
      textToSend.toLowerCase().includes("education");

    let summaryText = textToSend;
    let fullText = textToSend;

    if (isLikelyResume) {
      summaryText = `Submitted Resume`;
      fullText = resumeToUse;
      setPendingResumeText(fullText);
    }

    const inlineExtracted = extractConstraintsFromText(textToSend);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: summaryText,
      resumeSummary: isLikelyResume ? textToSend.split("\n")[0].trim() : undefined,
      fullResumeText: isLikelyResume ? fullText : undefined,
      isResumeSubmission: !!isLikelyResume,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsAiThinking(true);

    try {
      // 1. Call Gemini Dynamic AI Intake
      const intakeHistory = newMessages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.fullResumeText || m.text,
      }));

      const intakeConstraints: Partial<UserConstraints> = {
        target_role: roleOverride || constraints.target_role || inlineExtracted.target_role || undefined,
        weekly_hours: inlineExtracted.weekly_hours || constraints.weekly_hours || undefined,
        budget: inlineExtracted.budget !== undefined ? inlineExtracted.budget : constraints.budget,
        currency: inlineExtracted.currency || constraints.currency || "INR",
        target_timeline: constraints.target_timeline,
      };
      if (roleOverride) {
        intakeConstraints.target_role = roleOverride;
      } else if (inlineExtracted.target_role) {
        intakeConstraints.target_role = inlineExtracted.target_role;
      }
      if (inlineExtracted.weekly_hours) {
        intakeConstraints.weekly_hours = inlineExtracted.weekly_hours;
      }
      if (inlineExtracted.budget !== undefined) {
        intakeConstraints.budget = inlineExtracted.budget;
        intakeConstraints.currency = inlineExtracted.currency || "INR";
      }

      const intakeRes = await api.chatIntake(intakeHistory, intakeConstraints);

      const activeRole = intakeRes.target_role || roleOverride || inlineExtracted.target_role || constraints.target_role || "";
      const activeHours = (intakeRes.weekly_hours && intakeRes.weekly_hours > 0)
        ? intakeRes.weekly_hours
        : (inlineExtracted.weekly_hours && inlineExtracted.weekly_hours > 0)
        ? inlineExtracted.weekly_hours
        : (constraints.weekly_hours || 0);
      const activeBudget = intakeRes.budget ?? inlineExtracted.budget ?? constraints.budget ?? 0;
      const activeCurrency = intakeRes.currency || inlineExtracted.currency || constraints.currency || "INR";

      const mergedConstraints: UserConstraints = {
        target_role: activeRole,
        weekly_hours: activeHours,
        budget: activeBudget,
        currency: (activeCurrency as any) || "INR",
        target_timeline: constraints.target_timeline,
      };
      onUpdateConstraints(mergedConstraints);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: intakeRes.assistant_message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Only launch analysis if intake confirmed complete AND we have both a target role AND stated weekly hours
      if (intakeRes.is_complete && mergedConstraints.target_role && mergedConstraints.weekly_hours > 0) {
        let lastRoadmapIdx = -1;
        for (let i = newMessages.length - 1; i >= 0; i--) {
          if (newMessages[i].roadmap) {
            lastRoadmapIdx = i;
            break;
          }
        }

        const relevantMessages = lastRoadmapIdx >= 0 ? newMessages.slice(lastRoadmapIdx + 1) : newMessages;
        const currentPivotUserTurns = relevantMessages
          .filter((m) => m.sender === "user")
          .map((m) => m.fullResumeText || m.text)
          .join("\n\n");

        const textToAnalyze = currentPivotUserTurns.trim() || newMessages.filter((m) => m.sender === "user").map((m) => m.fullResumeText || m.text).join("\n\n");

        const result = await onAnalyze(textToAnalyze, mergedConstraints);
        if (result && result.roadmap && result.profile) {
          const roadmapAssistantMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            sender: "assistant",
            text: `I've analyzed your competency gaps against live **${mergedConstraints.target_role || "target"}** requirements. Here is your verified learning roadmap:`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            profile: result.profile,
            roadmap: result.roadmap,
            events: progressEvents,
          };
          setMessages((prev) => [...prev, roadmapAssistantMsg]);
        }
      }
    } catch (err: any) {
      console.error("Dynamic Intake error:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || "";
        handleSend(`Uploaded: ${file.name}`, content);
      };
      reader.readAsText(file);
    } else {
      const mockText = `[Uploaded Resume: ${file.name}]\nEducational background and tech interest.\nSkills: Python, SQL, REST APIs, Git.\nExperience: Fresher.`;
      handleSend(`Uploaded: ${file.name}`, mockText);
    }
  };

  const currencySymbol = constraints.currency === "INR" ? "₹" : "$";

  return (
    <div className="relative w-full h-full flex flex-col bg-[#faf8ff] overflow-hidden">
      {/* Subtle Ambient Glow Orbs from DESIGN.md */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#e1e0ff] blur-3xl opacity-40 pointer-events-none rounded-full" />
      <div className="absolute top-48 right-12 w-80 h-80 bg-[#e9ddff] blur-3xl opacity-30 pointer-events-none rounded-full" />

      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full pb-36 relative z-10">
        {messages.length === 0 ? (
          <div className="py-24 space-y-6 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4648d4] to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Where do you want to take your tech career?
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste your resume, describe your goals, or type your target role. Pathwise analyzes your skills, derives live market demand, and crafts a verified topological roadmap.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="w-full space-y-3">
              {msg.sender === "user" ? (
                msg.isResumeSubmission ? (
                  /* User Resume Submission Card */
                  <div className="flex flex-col items-end gap-2 w-full animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 w-full sm:max-w-md shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#e1e0ff] flex items-center justify-center text-[#4648d4] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">Submitted Resume</p>
                          <p className="text-[12px] text-slate-500 truncate">{msg.resumeSummary || "Candidate Profile"}</p>
                        </div>
                      </div>
                      {msg.fullResumeText && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="bg-[#f2f3ff] rounded-lg p-2.5 font-mono text-[12px] text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                            {msg.fullResumeText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard User Message Bubble */
                  <div className="flex justify-end w-full animate-fade-in">
                    <div className="bg-[#eaedff] text-[#131b2e] rounded-3xl px-5 py-2.5 max-w-[75%] sm:max-w-xl text-[15px] leading-relaxed shadow-sm">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                )
              ) : (
                /* Assistant Turn */
                <div className="flex items-start gap-3.5 w-full animate-fade-in">
                  <div className="w-8 h-8 rounded-full border border-slate-200/80 bg-white flex items-center justify-center shrink-0 text-[#4648d4] shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="text-[15px] leading-relaxed text-[#131b2e] pt-1 whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Verified Learning Path Card in Chat */}
                    {msg.roadmap && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 max-w-xl animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#4648d4]">
                            Recommended Learning Path
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            Verified ({msg.roadmap.items.length} Modules)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center py-2.5 border-y border-slate-100">
                          <div>
                            <div className="text-[10px] text-slate-500 font-medium">Timeline</div>
                            <div className="text-sm font-extrabold text-slate-900">
                              {msg.roadmap.total_weeks.toFixed(1)} wks
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-medium">Total Hours</div>
                            <div className="text-sm font-extrabold text-slate-900">
                              {msg.roadmap.total_hours.toFixed(0)} hrs
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-medium">Total Cost</div>
                            <div className="text-sm font-extrabold text-slate-900">
                              {currencySymbol}{msg.roadmap.total_cost.toFixed(0)}
                            </div>
                          </div>
                        </div>

                        {/* First 3 Courses Preview */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-500">Topological Sequence:</div>
                          {msg.roadmap.items.slice(0, 3).map((item) => (
                            <div
                              key={item.order}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-[#4648d4]">#{item.order}</span>
                                <span className="truncate font-medium text-slate-900">{item.course.title}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 shrink-0">
                                {item.hours}h • {item.cost === 0 ? "Free" : `${currencySymbol}${item.cost}`}
                              </span>
                            </div>
                          ))}
                          {msg.roadmap.items.length > 3 && (
                            <div className="text-[11px] text-center text-slate-500 italic pt-1">
                              + {msg.roadmap.items.length - 3} more modules in the complete roadmap
                            </div>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full mt-2 bg-[#4648d4] hover:bg-[#393bb3] text-white"
                          onClick={onNavigateToRoadmap}
                        >
                          View Full Interactive Roadmap & Gaps →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Real-time Multi-Agent Processing & Thinking Card */}
        {isProcessing && (
          <div className="flex items-start gap-3.5 w-full animate-fade-in">
            <div className="w-8 h-8 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center shrink-0 text-[#4648d4] shadow-sm mt-0.5 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>

            <div className="flex-1 max-w-xl bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-sm space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4648d4] animate-spin" />
                  <span className="text-xs font-bold text-slate-900">
                    {progressEvents.length > 0
                      ? "Orchestrating Multi-Agent Pipeline..."
                      : "Analyzing Background & Constraints..."}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-[#4648d4] font-semibold">
                  {progressEvents.length > 0 ? `${progressEvents.length} / 6 Agents Completed` : "Processing"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#4648d4] to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      progressEvents.length === 0
                        ? 15
                        : Math.min(100, Math.round((progressEvents.length / 6) * 100))
                    }%`
                  }}
                />
              </div>

              {/* 6 Multi-Agent Pipeline Steps */}
              <div className="space-y-2 pt-1">
                {PIPELINE_STEPS.map((stepInfo, idx) => {
                  const ev = progressEvents.find((e) => e.step === stepInfo.step);
                  const isDone = !!ev;
                  const isCurrent =
                    !isDone &&
                    (idx === 0 || !!progressEvents.find((e) => e.step === PIPELINE_STEPS[idx - 1].step));

                  return (
                    <div
                      key={stepInfo.step}
                      className={`flex items-start gap-2.5 text-xs transition-all duration-300 ${
                        isDone
                          ? "text-slate-800"
                          : isCurrent
                          ? "text-[#4648d4] font-medium"
                          : "text-slate-400 opacity-60"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#4648d4] animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{stepInfo.label}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#4648d4] animate-pulse">Running...</span>
                          )}
                        </div>
                        {isDone && ev?.message ? (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {ev.message}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            {stepInfo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Docked Floating Input Bar from DESIGN.md */}
      <div
        className={`fixed bottom-0 right-0 z-30 pb-5 pt-3 bg-gradient-to-t from-[#faf8ff] via-[#faf8ff]/90 to-transparent pointer-events-none transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "left-[280px]" : "left-0"
        }`}
      >
        <div className="w-full max-w-3xl mx-auto px-4 pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full px-4 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#4648d4]/40 focus-within:border-[#4648d4]/60 focus-within:shadow-[0_4px_20px_rgba(70,72,212,0.12)] transition-all"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full w-9 h-9 transition-colors cursor-pointer shrink-0"
              title="Upload resume or document"
            >
              <Plus className="w-5 h-5 text-slate-600" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf"
            />

            {/* Input Text Box */}
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isProcessing}
                placeholder={
                  isProcessing
                    ? "AI multi-agent pipeline is active..."
                    : "Write a message..."
                }
                className="w-full bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 text-sm px-1 py-1 focus:ring-0 disabled:opacity-50"
              />
            </div>

            {/* Right Quick Controls: Mic & Submit */}
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
              <button
                type="button"
                disabled={isProcessing}
                className="flex items-center gap-0.5 px-2 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-40"
                title="Voice input"
              >
                <Mic className="w-4 h-4 text-slate-600" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="submit"
                disabled={(!inputText.trim() && !pendingResumeText) || isProcessing}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4648d4] text-white hover:bg-[#393bb3] transition-all disabled:opacity-30 disabled:hover:bg-[#4648d4] cursor-pointer shadow-xs"
                title="Send message"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
