"use client";

import { motion } from "framer-motion";
import { Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchQuery: string;
  selectedCategory: string | null;
  onCreateApp: () => void;
}

export function EmptyState({ searchQuery, selectedCategory, onCreateApp }: EmptyStateProps) {
  const hasFilters = searchQuery || selectedCategory;

  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Smartphone className="w-12 h-12 text-muted" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">
        {hasFilters ? 'No apps found' : 'No apps yet'}
      </h3>
      <p className="text-muted mb-8 max-w-md mx-auto">
        {hasFilters 
          ? 'Try adjusting your search or filter criteria'
          : 'Create your first app to get started with AppForge'
        }
      </p>
      <Button onClick={onCreateApp} size="lg">
        <Plus className="w-5 h-5 mr-2" />
        {hasFilters ? 'Create New App' : 'Create Your First App'}
      </Button>
    </motion.div>
  );
}