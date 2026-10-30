"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, MicOff, Paperclip, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string, resumeContent?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Tell me about your skills, experience or career goals...",
  autoFocus = false,
}) => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentContent, setAttachmentContent] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !attachmentContent) || isLoading) return;

    onSendMessage(text, attachmentContent || undefined);
    setText("");
    setAttachmentName(null);
    setAttachmentContent(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachmentContent(content);
    };
    reader.readAsText(file);
  };

  const toggleMic = () => {
    // Secondary feature: Web Speech API if supported
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use text.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* File attachment preview pill */}
      {attachmentName && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-primary/20 text-xs text-primary font-medium animate-fadeIn">
          <FileText className="w-3.5 h-3.5" />
          <span className="truncate max-w-xs">{attachmentName}</span>
          <button
            onClick={() => {
              setAttachmentName(null);
              setAttachmentContent(null);
            }}
            className="text-text-muted hover:text-text p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Elegant Chat Bar */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-end bg-surface border border-border rounded-2xl p-2.5 shadow-card hover:border-secondary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.md"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          title="Upload resume or project description"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Optional Secondary Voice Input */}
        <button
          type="button"
          onClick={toggleMic}
          className={cn(
            "p-2 rounded-xl transition-colors shrink-0",
            isRecording
              ? "text-rose-500 bg-rose-50 animate-pulse"
              : "text-text-muted hover:text-text hover:bg-gray-100"
          )}
          title={isRecording ? "Listening..." : "Optional voice input"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-0 resize-none px-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-0 max-h-36 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !attachmentContent) || isLoading}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
            (text.trim() || attachmentContent) && !isLoading
              ? "bg-primary text-white shadow-sm hover:bg-primary-hover active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
          title="Send message"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
