"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, LogOut, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { APP_CATEGORIES } from "@/config/plans";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AppCard } from "@/components/dashboard/AppCard";
import { CreateAppModal } from "@/components/dashboard/CreateAppModal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
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
  const { user, profile, signOut } = useAuth();
  const supabase = createClient();

  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const stats = {
    totalApps: apps.length,
    totalBuilds: apps.reduce((sum, app) => sum + (app.current_version || 1), 0),
    activePWAs: apps.filter(app => app.status === 'published').length,
  };

  const fetchApps = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setApps((data || []) as unknown as App[]);
    } catch (err) {
      console.error('Failed to fetch apps:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (user) fetchApps();
    else setIsLoading(false);
  }, [user, fetchApps]);

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
      setIsLoading(true);
      const slug = appData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('apps')
        .insert({
          user_id: user!.id,
          name: appData.name,
          slug,
          description: appData.description || '',
          category: appData.category || 'custom',
          package_name: `com.appforge.${slug}`,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('App created successfully!');
      setIsCreateModalOpen(false);
      router.push(`/builder/${data.id}`);
    } catch (error) {
      toast.error('Failed to create app');
      console.error('Create app error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from('apps').delete().eq('id', selectedApp.id);
      if (error) throw error;

      setApps(prev => prev.filter(a => a.id !== selectedApp.id));
      toast.success('App deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedApp(null);
    } catch (error) {
      toast.error('Failed to delete app');
      console.error('Delete app error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (app: App) => {
    setSelectedApp(app);
    setIsDeleteModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onCreateApp={() => setIsCreateModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User greeting */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold">
              Hey, {profile?.full_name?.split(' ')[0] || 'Builder'} 👋
            </h1>
            <p className="text-muted mt-1">
              {apps.length === 0 ? "Ready to build your first app?" : `You have ${apps.length} app${apps.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted bg-surface px-3 py-1 rounded-full capitalize">
              {profile?.plan || 'free'} plan
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

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
            {APP_CATEGORIES.slice(0, 6).map((category) => (
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

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl h-[300px] animate-pulse" />
            ))}
          </div>
        ) : filteredApps.length > 0 || searchQuery === '' ? (
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
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Create New App</h3>
                  <p className="text-muted text-sm">Describe it, and AI builds it in minutes</p>
                </CardContent>
              </Card>
            </motion.div>

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

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateApp={handleCreateApp}
        isLoading={isLoading}
      />

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
                <li>• App code and all screens</li>
                <li>• Chat history</li>
                <li>• All versions</li>
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
