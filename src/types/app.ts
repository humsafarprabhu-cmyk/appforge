export type Plan = 'free' | 'maker' | 'pro' | 'agency';

export type AppStatus = 'draft' | 'ready' | 'building' | 'published';
export type PlayStoreStatus = 'none' | 'preparing' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'suspended';
export type BuildStatus = 'none' | 'queued' | 'building' | 'success' | 'failed';
export type BuildType = 'apk' | 'aab' | 'pwa';
export type AppTheme = 'dark' | 'light';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  plan_expires_at: string | null;
  ls_customer_id: string | null;
  ls_subscription_id: string | null;
  apps_count: number;
  created_at: string;
  updated_at: string;
}

export interface App {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  icon_url: string | null;
  splash_url: string | null;
  current_version: number;
  status: AppStatus;
  package_name: string | null;
  color_primary: string;
  color_secondary: string;
  theme: AppTheme;
  firebase_enabled: boolean;
  firebase_project_id: string | null;
  firebase_config: Record<string, unknown> | null;
  admob_enabled: boolean;
  admob_app_id: string | null;
  admob_banner_id: string | null;
  admob_interstitial_id: string | null;
  admob_rewarded_id: string | null;
  play_store_status: PlayStoreStatus;
  play_store_url: string | null;
  play_store_rejection_reason: string | null;
  pwa_enabled: boolean;
  pwa_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppVersion {
  id: string;
  app_id: string;
  version_number: number;
  version_label: string | null;
  code_snapshot_url: string | null;
  code_hash: string | null;
  apk_url: string | null;
  aab_url: string | null;
  apk_size_bytes: number | null;
  build_status: BuildStatus;
  eas_build_id: string | null;
  build_error: string | null;
  build_started_at: string | null;
  build_completed_at: string | null;
  changelog: string | null;
  screens_count: number | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  app_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  version_number: number | null;
  tokens_used: number | null;
  model: string | null;
  created_at: string;
}

export interface StoreListing {
  id: string;
  app_id: string;
  title: string | null;
  short_description: string | null;
  full_description: string | null;
  keywords: string[] | null;
  category: string | null;
  content_rating: string | null;
  icon_512_url: string | null;
  feature_graphic_url: string | null;
  screenshots_phone: string[] | null;
  screenshots_tablet: string[] | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  developer_name: string;
  developer_email: string | null;
  developer_website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Build {
  id: string;
  app_id: string;
  version_id: string | null;
  user_id: string;
  build_type: BuildType;
  status: 'queued' | 'processing' | 'building' | 'success' | 'failed' | 'cancelled';
  priority: number;
  eas_build_id: string | null;
  eas_build_url: string | null;
  artifact_url: string | null;
  artifact_size_bytes: number | null;
  error_message: string | null;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  type: 'checkbox' | 'radio' | 'text';
  options?: string[];
  placeholder?: string;
}

export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  template_count: number;
}
