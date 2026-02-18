"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { APP_CATEGORIES } from "@/config/plans";

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateApp: (data: { name: string; description: string; category: string }) => void;
  isLoading: boolean;
}

export function CreateAppModal({ isOpen, onClose, onCreateApp, isLoading }: CreateAppModalProps) {
  const [appData, setAppData] = useState({
    name: '',
    description: '',
    category: 'custom'
  });

  const handleSubmit = () => {
    if (!appData.name.trim()) return;
    onCreateApp(appData);
  };

  const handleClose = () => {
    setAppData({ name: '', description: '', category: 'custom' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New App"
      description="Tell us about your app idea and we'll help you build it"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">App Name</label>
          <Input
            placeholder="My Awesome App"
            value={appData.name}
            onChange={(e) => setAppData({ ...appData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Input
            placeholder="Describe your app idea..."
            value={appData.description}
            onChange={(e) => setAppData({ ...appData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {APP_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setAppData({ ...appData, category: category.id })}
                className={`p-3 rounded-xl border transition-all text-left ${
                  appData.category === category.id
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border hover:border-border/80 text-muted hover:text-white'
                }`}
              >
                <div className="text-lg mb-1">{category.icon}</div>
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs opacity-70 line-clamp-2">{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={isLoading} disabled={!appData.name.trim()}>
          <Zap className="w-4 h-4 mr-2" />
          Create App
        </Button>
      </ModalFooter>
    </Modal>
  );
}