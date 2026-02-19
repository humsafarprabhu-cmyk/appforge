"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OnboardingQuestions } from "./OnboardingQuestions";
import { useBuilderStore } from "@/stores/builder-store";

import type { ChatMessage as ChatMessageType } from "@/types/app";

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const onboarding = useBuilderStore((s) => s.onboarding);
  const isOnboardingMessage =
    message.role === "assistant" &&
    message.content === "__ONBOARDING_QUESTIONS__" &&
    onboarding.isOnboarding;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 
        message.role === 'system' ? 'justify-center' : 'justify-start'
      }`}
    >
      {message.role === 'user' ? (
        <div className="max-w-xs bg-primary rounded-2xl px-4 py-2">
          <p className="text-white text-sm">{message.content}</p>
        </div>
      ) : message.role === 'system' ? (
        <div className="max-w-md">
          <Badge variant="secondary" size="sm" className="text-xs">
            {message.content}
          </Badge>
        </div>
      ) : isOnboardingMessage ? (
        <OnboardingQuestions />
      ) : (
        <Card className="max-w-md p-4 glass">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
              {message.model && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <span>{message.model}</span>
                  {message.tokens_used && (
                    <span>• {message.tokens_used} tokens</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
