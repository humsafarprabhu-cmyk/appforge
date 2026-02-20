"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateApp: (data: { name: string; description: string; category: string }) => void;
  isLoading: boolean;
}

export function CreateAppModal({ isOpen, onClose, onCreateApp, isLoading }: CreateAppModalProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    // Pass the prompt as description; name will be set by AI during onboarding
    onCreateApp({ name: prompt.trim().slice(0, 40), description: prompt.trim(), category: 'custom' });
  };

  const handleClose = () => {
    setPrompt('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New App"
      description="Describe your app idea and AI will build it for you"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">What do you want to build?</label>
          <textarea
            placeholder="e.g. A fitness tracking app with workout logging and progress charts..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all resize-none min-h-[100px]"
            rows={3}
            autoFocus
          />
          <p className="text-xs text-white/30 mt-2">The AI will name your app and set up everything based on your description.</p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={isLoading} disabled={!prompt.trim()}>
          <Sparkles className="w-4 h-4 mr-2" />
          Build App
        </Button>
      </ModalFooter>
    </Modal>
  );
}
