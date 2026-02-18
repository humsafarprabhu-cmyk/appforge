"use client";

import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled: boolean;
  placeholder?: string;
}

export function ChatInput({ value, onChange, onSend, isDisabled, placeholder }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-6 border-t border-border/30">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder || "Describe what you want to build or change..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isDisabled}
            className="resize-none"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{value.length}/1000</span>
          </div>
        </div>
        <Button 
          onClick={onSend} 
          disabled={!value.trim() || isDisabled}
          size="lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}