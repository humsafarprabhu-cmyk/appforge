import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { App, AppStatus } from '@/types/app';

interface AppStoreState {
  apps: App[];
  currentApp: App | null;
  isLoading: boolean;
  
  // Stats
  stats: {
    totalApps: number;
    totalBuilds: number;
    activePWAs: number;
  };
  
  // Actions
  createApp: (appData: Partial<App>) => Promise<App>;
  updateApp: (id: string, updates: Partial<App>) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  getApp: (id: string) => App | null;
  setCurrentApp: (app: App | null) => void;
  
  // Initialize with demo data
  initializeDemoData: () => void;
  
  // Refresh stats
  refreshStats: () => void;
}

// Demo apps data
const DEMO_APPS: App[] = [
  {
    id: 'demo-fitness',
    user_id: 'demo-user',
    name: 'FitTracker Pro',
    slug: 'fittracker-pro',
    description: 'Complete fitness tracking app with workout logging, progress charts, and social features',
    category: 'fitness',
    icon_url: null,
    splash_url: null,
    current_version: 3,
    status: 'published' as AppStatus,
    package_name: 'com.appforge.fittracker',
    color_primary: '#6366f1',
    color_secondary: '#8b5cf6',
    theme: 'dark',
    firebase_enabled: true,
    firebase_project_id: 'fittracker-demo',
    firebase_config: null,
    admob_enabled: true,
    admob_app_id: 'ca-app-pub-demo~123456789',
    admob_banner_id: null,
    admob_interstitial_id: null,
    admob_rewarded_id: null,
    play_store_status: 'approved',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.appforge.fittracker',
    play_store_rejection_reason: null,
    pwa_enabled: true,
    pwa_url: 'https://fittracker.appforge.app',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'demo-recipe',
    user_id: 'demo-user',
    name: 'RecipeBook',
    slug: 'recipebook',
    description: 'Discover, save, and share delicious recipes with meal planning features',
    category: 'food',
    icon_url: null,
    splash_url: null,
    current_version: 1,
    status: 'ready' as AppStatus,
    package_name: 'com.appforge.recipebook',
    color_primary: '#f59e0b',
    color_secondary: '#f97316',
    theme: 'light',
    firebase_enabled: true,
    firebase_project_id: 'recipebook-demo',
    firebase_config: null,
    admob_enabled: false,
    admob_app_id: null,
    admob_banner_id: null,
    admob_interstitial_id: null,
    admob_rewarded_id: null,
    play_store_status: 'none',
    play_store_url: null,
    play_store_rejection_reason: null,
    pwa_enabled: true,
    pwa_url: 'https://recipebook.appforge.app',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: 'demo-todo',
    user_id: 'demo-user',
    name: 'TaskMaster',
    slug: 'taskmaster',
    description: 'Simple yet powerful todo list with project organization and team collaboration',
    category: 'productivity',
    icon_url: null,
    splash_url: null,
    current_version: 2,
    status: 'building' as AppStatus,
    package_name: 'com.appforge.taskmaster',
    color_primary: '#10b981',
    color_secondary: '#059669',
    theme: 'dark',
    firebase_enabled: true,
    firebase_project_id: 'taskmaster-demo',
    firebase_config: null,
    admob_enabled: false,
    admob_app_id: null,
    admob_banner_id: null,
    admob_interstitial_id: null,
    admob_rewarded_id: null,
    play_store_status: 'none',
    play_store_url: null,
    play_store_rejection_reason: null,
    pwa_enabled: false,
    pwa_url: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  }
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const useAppStore = create<AppStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        apps: [],
        currentApp: null,
        isLoading: false,
        stats: {
          totalApps: 0,
          totalBuilds: 0,
          activePWAs: 0,
        },

        createApp: async (appData) => {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newApp: App = {
            id: generateId(),
            user_id: 'demo-user',
            name: appData.name || 'New App',
            slug: generateSlug(appData.name || 'new-app'),
            description: appData.description || '',
            category: appData.category || null,
            icon_url: null,
            splash_url: null,
            current_version: 1,
            status: 'draft',
            package_name: `com.appforge.${generateSlug(appData.name || 'new-app')}`,
            color_primary: appData.color_primary || '#6366f1',
            color_secondary: appData.color_secondary || '#8b5cf6',
            theme: appData.theme || 'dark',
            firebase_enabled: false,
            firebase_project_id: null,
            firebase_config: null,
            admob_enabled: false,
            admob_app_id: null,
            admob_banner_id: null,
            admob_interstitial_id: null,
            admob_rewarded_id: null,
            play_store_status: 'none',
            play_store_url: null,
            play_store_rejection_reason: null,
            pwa_enabled: false,
            pwa_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...appData,
          };
          
          set(state => ({ 
            apps: [newApp, ...state.apps],
            isLoading: false 
          }));
          
          get().refreshStats();
          
          return newApp;
        },

        updateApp: async (id, updates) => {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            apps: state.apps.map(app => 
              app.id === id 
                ? { ...app, ...updates, updated_at: new Date().toISOString() }
                : app
            ),
            currentApp: state.currentApp?.id === id 
              ? { ...state.currentApp, ...updates, updated_at: new Date().toISOString() }
              : state.currentApp,
            isLoading: false
          }));
          
          get().refreshStats();
        },

        deleteApp: async (id) => {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            apps: state.apps.filter(app => app.id !== id),
            currentApp: state.currentApp?.id === id ? null : state.currentApp,
            isLoading: false
          }));
          
          get().refreshStats();
        },

        getApp: (id) => {
          return get().apps.find(app => app.id === id) || null;
        },

        setCurrentApp: (app) => {
          set({ currentApp: app });
        },

        initializeDemoData: () => {
          set({ 
            apps: DEMO_APPS,
            stats: {
              totalApps: DEMO_APPS.length,
              totalBuilds: DEMO_APPS.reduce((sum, app) => sum + app.current_version, 0),
              activePWAs: DEMO_APPS.filter(app => app.pwa_enabled).length,
            }
          });
        },

        refreshStats: () => {
          const { apps } = get();
          
          set({
            stats: {
              totalApps: apps.length,
              totalBuilds: apps.reduce((sum, app) => sum + app.current_version, 0),
              activePWAs: apps.filter(app => app.pwa_enabled).length,
            }
          });
        },
      }),
      {
        name: 'app-store',
        // Only persist apps and stats, not loading states
        partialize: (state) => ({
          apps: state.apps,
          stats: state.stats,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);