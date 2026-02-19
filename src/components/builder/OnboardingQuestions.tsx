"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuilderStore } from "@/stores/builder-store";

export function OnboardingQuestions() {
  const { onboarding, submitOnboarding, isGenerating } = useBuilderStore();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  if (!onboarding.isOnboarding || onboarding.questions.length === 0) {
    return (
      <div className="w-full max-w-lg p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          <p className="text-sm text-white/60">Preparing questions...</p>
        </div>
      </div>
    );
  }

  const toggleCheckbox = (qId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[qId] as string[]) || [];
      return {
        ...prev,
        [qId]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const setRadio = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const setText = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    if (isGenerating) return;
    submitOnboarding(answers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg"
    >
      {/* Acknowledgment */}
      {onboarding.acknowledgment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
          </div>
          <p className="text-sm text-white/90 leading-relaxed pt-1">
            {onboarding.acknowledgment}
          </p>
        </motion.div>
      )}

      {/* Questions */}
      <div className="space-y-4 mt-3">
        <AnimatePresence>
          {onboarding.questions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + qi * 0.1, duration: 0.35 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4"
            >
              <p className="text-sm font-medium text-white/90 mb-3">{q.text}</p>

              {/* Checkbox */}
              {q.type === "checkbox" && q.options && (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = ((answers[q.id] as string[]) || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleCheckbox(q.id, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          selected
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                            : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white/80"
                        }`}
                      >
                        {selected && (
                          <span className="mr-1">✓</span>
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Radio */}
              {q.type === "radio" && q.options && (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRadio(q.id, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          selected
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                            : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white/80"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Text */}
              {q.type === "text" && (
                <input
                  type="text"
                  placeholder={q.placeholder || "Type your answer..."}
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setText(q.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-colors"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + onboarding.questions.length * 0.1 + 0.1 }}
        onClick={handleSubmit}
        disabled={isGenerating}
        className="mt-5 w-full py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Building..." : "Build My App →"}
      </motion.button>
    </motion.div>
  );
}
