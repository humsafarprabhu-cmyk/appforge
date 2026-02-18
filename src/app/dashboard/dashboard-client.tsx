"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { useAppStore } from "@/stores/app-store";
import { APP_CATEGORIES } from "@/config/plans";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AppCard } from "@/components/dashboard/AppCard";
import { CreateAppModal } from "@/components/dashboard/CreateAppModal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { toast } from "sonner";
import type { App } from "@/types/app";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export function DashboardClient() {
  const router = useRouter();
  const { 
    apps, 
    stats, 
    isLoading, 
    hasInitialized,
    createApp, 
    deleteApp, 
    initializeDemoData,
    refreshStats 
  } = useAppStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize demo data on mount if not already initialized
  useEffect(() => {
    if (!hasInitialized) {
      initializeDemoData();
    } else {
      refreshStats();
    }
  }, [hasInitialized, initializeDemoData, refreshStats]);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateApp = async (appData: { name: string; description: string; category: string }) => {
    if (!appData.name.trim()) {
      toast.error('Please enter an app name');
      return;
    }

    try {
      const app = await createApp(appData);
      toast.success('App created successfully!');
      setIsCreateModalOpen(false);
      
      // Redirect to builder using Next.js router
      router.push(`/builder/${app.id}`);
    } catch (error) {
      toast.error('Failed to create app');
      console.error('Create app error:', error);
    }
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;

    try {
      await deleteApp(selectedApp.id);
      toast.success('App deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedApp(null);
    } catch (error) {
      toast.error('Failed to delete app');
      console.error('Delete app error:', error);
    }
  };

  const handleDeleteClick = (app: App) => {
    setSelectedApp(app);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader onCreateApp={() => setIsCreateModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Search and Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex-1">
            <Input
              placeholder="Search your apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={!selectedCategory ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {APP_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Create New App Card */}
            <motion.div variants={fadeInUp}>
              <Card 
                className="h-full border-dashed border-2 border-border/50 hover:border-primary/50 cursor-pointer glass-hover"
                onClick={() => setIsCreateModalOpen(true)}
                hover
              >
                <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Create New App</h3>
                  <p className="text-muted text-sm">Start building your next mobile app</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* App Cards */}
            {filteredApps.map((app) => (
              <AppCard 
                key={app.id} 
                app={app} 
                onDelete={handleDeleteClick} 
                fadeInUp={fadeInUp} 
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onCreateApp={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Create App Modal */}
      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateApp={handleCreateApp}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete App"
        description={`Are you sure you want to delete "${selectedApp?.name}"? This action cannot be undone.`}
        size="md"
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-medium text-white">This will permanently delete:</p>
              <ul className="text-sm text-muted mt-1 space-y-1">
                <li>• App code and assets</li>
                <li>• All app versions</li>
                <li>• Chat history</li>
                <li>• Analytics data</li>
              </ul>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteApp} loading={isLoading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete App
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}