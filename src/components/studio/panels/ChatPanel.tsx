"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User, AlertCircle, Loader2, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types/app";
import { useBuilderStore } from "@/stores/builder-store";
import { OnboardingQuestions } from "@/components/builder/OnboardingQuestions";

interface ChatPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  lastError: string | null;
}

export function ChatPanel({ messages, isGenerating, generationProgress, generationMessage, lastError }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { onboarding } = useBuilderStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-white/60 text-sm">Start by describing your app idea below</p>
          <p className="text-white/30 text-xs mt-1">AI will build 5 production screens</p>
        </div>
      )}

      {messages.map((msg, i) => {
        // Handle onboarding questions sentinel
        if (msg.content === "__ONBOARDING_QUESTIONS__" && onboarding?.isOnboarding) {
          return (
            <div key={i} className="py-2">
              <OnboardingQuestions />
            </div>
          );
        }

        const isUser = msg.role === "user";
        const isSystem = msg.role === "system";

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isUser ? "bg-indigo-500/20" : isSystem ? "bg-white/[0.06]" : "bg-purple-500/20"
            }`}>
              {isUser ? <User className="w-3.5 h-3.5 text-indigo-400" /> : <Bot className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <div className={`max-w-[280px] rounded-xl px-3 py-2 text-sm ${
              isUser
                ? "bg-indigo-500/20 text-white/90"
                : isSystem
                ? "bg-white/[0.04] text-white/50 text-xs italic"
                : "bg-white/[0.06] text-white/80"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        );
      })}

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2.5"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          </div>
          <div className="bg-white/[0.06] rounded-xl px-3 py-2">
            <p className="text-sm text-white/60">{generationMessage || "Building..."}</p>
            <div className="mt-1.5 w-32 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {lastError && (
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-sm text-red-300">
            {lastError}
          </div>
        </div>
      )}
    </div>
  );
}
