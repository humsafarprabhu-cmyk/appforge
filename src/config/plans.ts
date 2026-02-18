import type { Plan } from '@/types/app';

export interface PlanConfig {
  id: Plan;
  name: string;
  price: number; // monthly USD
  priceYearly: number; // yearly USD (per month)
  description: string;
  features: string[];
  limits: {
    apps: number;
    promptsPerDay: number;
    pwaHosting: number;
    playStoreSubmitsPerMonth: number;
    versionHistory: number;
    apkDownload: boolean;
    firebase: boolean;
    admob: boolean;
    whiteLabel: boolean;
    priorityBuilds: boolean;
  };
  badge?: string;
  popular?: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    description: 'Perfect for trying out AppForge',
    features: [
      'Up to 3 apps',
      'Live phone preview',
      '20 prompts/day',
      '5 version history',
      'Community support',
    ],
    limits: {
      apps: 3,
      promptsPerDay: 20,
      pwaHosting: 0,
      playStoreSubmitsPerMonth: 0,
      versionHistory: 5,
      apkDownload: false,
      firebase: false,
      admob: false,
      whiteLabel: false,
      priorityBuilds: false,
    },
  },
  maker: {
    id: 'maker',
    name: 'Maker',
    price: 12,
    priceYearly: 9,
    description: 'For indie makers shipping apps',
    features: [
      'Up to 10 apps',
      'APK download',
      '100 prompts/day',
      'PWA hosting (3 apps)',
      'Firebase integration',
      '20 version history',
      'Email support',
    ],
    limits: {
      apps: 10,
      promptsPerDay: 100,
      pwaHosting: 3,
      playStoreSubmitsPerMonth: 0,
      versionHistory: 20,
      apkDownload: true,
      firebase: true,
      admob: false,
      whiteLabel: false,
      priorityBuilds: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceYearly: 23,
    description: 'For serious app builders',
    features: [
      'Unlimited apps',
      'Everything in Maker',
      'AdMob integration',
      'Play Store submission (3/mo)',
      'Auto screenshots & listing',
      'PWA hosting (10 apps)',
      'Unlimited version history',
      'Priority builds',
      'Priority support',
    ],
    limits: {
      apps: Infinity,
      promptsPerDay: Infinity,
      pwaHosting: 10,
      playStoreSubmitsPerMonth: 3,
      versionHistory: Infinity,
      apkDownload: true,
      firebase: true,
      admob: true,
      whiteLabel: false,
      priorityBuilds: true,
    },
    popular: true,
    badge: 'Most Popular',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 79,
    priceYearly: 63,
    description: 'For agencies building for clients',
    features: [
      'Everything in Pro',
      'Unlimited Play Store submissions',
      'Unlimited PWA hosting',
      'White-label branding',
      'Client management',
      'Bulk export',
      'Dedicated support',
      'Custom domain for PWAs',
    ],
    limits: {
      apps: Infinity,
      promptsPerDay: Infinity,
      pwaHosting: Infinity,
      playStoreSubmitsPerMonth: Infinity,
      versionHistory: Infinity,
      apkDownload: true,
      firebase: true,
      admob: true,
      whiteLabel: true,
      priorityBuilds: true,
    },
    badge: 'Best Value',
  },
};

export const APP_CATEGORIES = [
  { id: 'fitness', name: 'Fitness & Health', icon: '💪', description: 'Workout trackers, health monitors, diet planners' },
  { id: 'food', name: 'Food & Recipe', icon: '🍳', description: 'Recipe books, meal planners, food delivery' },
  { id: 'education', name: 'Education & Quiz', icon: '📚', description: 'Flashcards, quizzes, learning apps' },
  { id: 'productivity', name: 'Productivity', icon: '✅', description: 'Notes, todos, habit trackers, timers' },
  { id: 'social', name: 'Social & Chat', icon: '💬', description: 'Messaging, community, social networks' },
  { id: 'ecommerce', name: 'E-Commerce', icon: '🛒', description: 'Online stores, catalogs, marketplaces' },
  { id: 'wellness', name: 'Wellness & Meditation', icon: '🧘', description: 'Meditation, breathing, sleep, mindfulness' },
  { id: 'finance', name: 'Finance & Budget', icon: '💰', description: 'Expense trackers, budgets, calculators' },
  { id: 'travel', name: 'Travel & Local', icon: '✈️', description: 'Trip planners, local guides, booking' },
  { id: 'utility', name: 'Utility & Tools', icon: '🔧', description: 'Calculators, converters, scanners' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', description: 'Games, trivia, media players' },
  { id: 'custom', name: 'Custom / Other', icon: '✨', description: 'Describe anything you want to build' },
];
