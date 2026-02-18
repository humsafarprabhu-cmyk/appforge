"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

import type { ChatMessage as ChatMessageType } from "@/types/app";

interface ChatPanelProps {
  messages: ChatMessageType[];
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  lastError: string | null;
  chatInputValue: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  onRetry: () => void;
  isExpanded: boolean;
}

export function ChatPanel({ 
  messages, 
  isGenerating, 
  generationProgress,
  generationMessage,
  lastError,
  chatInputValue, 
  onChatInputChange, 
  onSendMessage,
  onRetry,
  isExpanded 
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div 
      className={`bg-surface/30 border-r border-border transition-all duration-300 ${
        isExpanded ? 'w-1/2' : 'w-2/5'
      }`}
      initial={false}
      animate={{ width: isExpanded ? '50%' : '40%' }}
    >
      <div className="flex flex-col h-full">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome message when chat is empty */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Hi! Describe the app you want to build</h3>
              <p className="text-white/60 mb-6">I'll create it for you with modern design and functionality</p>
              
              {/* Suggested prompts */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['Recipe app', 'Fitness tracker', 'Todo list', 'E-commerce store'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onChatInputChange(suggestion)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                index={index} 
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="max-w-md p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Building Progress */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4"
            >
              <Card className="p-4 glass">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🔨</div>
                  <span className="text-sm text-white">{generationMessage || 'Building your app...'}</span>
                </div>
                <Progress value={generationProgress} animated className="h-2" />
                <div className="text-xs text-white/60 mt-2">{Math.round(generationProgress)}% complete</div>
              </Card>
            </motion.div>
          )}

          {/* Completion Message */}
          {!isGenerating && messages.length > 0 && messages[messages.length - 1]?.role === 'system' && !lastError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="text-2xl mb-2">✅</div>
              <p className="text-white/80 text-sm">Your app is ready! You can now edit any screen by chatting with me.</p>
            </motion.div>
          )}

          {/* Error State with Retry */}
          {lastError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4"
            >
              <Card className="p-4 glass border-red-500/30">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm text-red-300 mb-2">Generation failed: {lastError}</p>
                    <button
                      onClick={onRetry}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          value={chatInputValue}
          onChange={onChatInputChange}
          onSend={onSendMessage}
          isDisabled={isGenerating}
          placeholder={isGenerating ? "AI is thinking..." : "Describe what you want to build or change..."}
        />
      </div>
    </motion.div>
  );
}