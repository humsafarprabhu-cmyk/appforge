"use client";

import { useEffect, useState, useRef } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { StudioLayout } from "@/components/studio/StudioLayout";
import { Sparkles, ArrowRight, Zap, Smartphone, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SUGGESTIONS = [
  "A fitness tracking app with workout logging and progress charts",
  "A recipe manager with meal planning and grocery lists",
  "A personal finance tracker with budgets and expense categories",
  "A habit tracker with streaks, reminders, and statistics",
  "A social book club app with reading lists and reviews",
  "A pet care app with vet appointments and feeding schedules",
];

export function TryClient() {
  const [showLanding, setShowLanding] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isGenerating,
    generationProgress,
    generationMessage,
    lastError,
    appName,
    screens,
    currentScreen,
    chatInputValue,
    setAppId,
    setAppName,
    generateApp,
    retryGeneration,
    setCurrentScreen,
    setChatInputValue,
    clearScreens,
    clearMessages,
  } = useBuilderStore();

  useEffect(() => {
    setAppId("try-mode");
    clearScreens();
    clearMessages();
    
    // Check if arriving from template gallery
    if (typeof window !== 'undefined') {
      const templatePrompt = localStorage.getItem('af_template_prompt');
      const templateName = localStorage.getItem('af_template_name');
      if (templatePrompt) {
        localStorage.removeItem('af_template_prompt');
        localStorage.removeItem('af_template_name');
        // Auto-start with template
        setInputValue(templatePrompt);
        if (templateName) setAppName(templateName);
        setTimeout(() => handleStart(templatePrompt), 500);
      }
    }
  }, []);

  const handleStart = async (prompt: string) => {
    if (!prompt.trim()) return;
    setShowLanding(false);
    setChatInputValue("");
    
    try {
      await generateApp(prompt.trim());
      toast.success("App generated! 🎉");
    } catch {
      toast.error("Generation failed. Try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInputValue.trim() || isGenerating) return;
    const msg = chatInputValue.trim();
    setChatInputValue("");
    try {
      await generateApp(msg);
    } catch {
      toast.error("Failed. Try again.");
    }
  };

  if (showLanding && screens.length === 0 && !isGenerating) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              No signup needed — try it free
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Describe your app.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Watch AI build it.
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Type what you want. Our AI builds 5 production-quality screens with real data, animations, and navigation.
            </p>
          </motion.div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl mb-8"
          >
            <div className="relative glass rounded-2xl border border-white/10 overflow-hidden">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleStart(inputValue);
                  }
                }}
                placeholder="Describe your app idea... e.g. 'A fitness app with workout tracking and progress charts'"
                className="w-full bg-transparent text-white placeholder:text-white/30 p-5 pr-20 resize-none outline-none text-lg min-h-[80px]"
                rows={2}
                autoFocus
              />
              <button
                onClick={() => handleStart(inputValue)}
                disabled={!inputValue.trim()}
                className="absolute right-4 bottom-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-medium flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Build
              </button>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center max-w-3xl"
          >
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(s);
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm transition-all"
              >
                {s.length > 50 ? s.substring(0, 47) + "..." : s}
              </button>
            ))}
          </motion.div>

          {/* Templates link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <a href="/templates" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm transition-all">
              📱 Or start from a template ({20} ready-made apps)
              <ArrowRight className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Features strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-8 mt-12 text-white/40 text-sm"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              5 screens per app
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              ~2 min to build
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download as ZIP/PWA
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show Studio once generation starts
  return (
    <StudioLayout
      appId="try-mode"
      onSendMessage={(msg: string) => {
        generateApp(msg).catch(() => toast.error("Failed. Try again."));
      }}
    />
  );
}
