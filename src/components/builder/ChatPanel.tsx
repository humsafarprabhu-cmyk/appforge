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
  chatInputValue: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  isExpanded: boolean;
}

export function ChatPanel({ 
  messages, 
  isGenerating, 
  chatInputValue, 
  onChatInputChange, 
  onSendMessage,
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
                  <div className="spinner" />
                  <span className="text-sm text-white">Building your app...</span>
                </div>
                <Progress value={65} animated className="h-2" />
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