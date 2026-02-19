-- Migration 002: Multi-tenant architecture for generated apps
-- Every generated app gets real backend: auth, database, storage, notifications

-- ═══════════════════════════════════════════════════════════════════════════════
-- PLATFORM TABLES (AppForge infrastructure)
-- ═══════════════════════════════════════════════════════════════════════════════

-- App versions (version history with code snapshots)
CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  version_number int NOT NULL,
  version_label text,
  screens jsonb NOT NULL DEFAULT '[]'::jsonb,
  blueprint jsonb, -- full app blueprint (data model, auth config, etc.)
  changelog text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, version_number)
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app versions" ON public.app_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_versions.app_id AND apps.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own app versions" ON public.app_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_versions.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_app_versions_app_id ON public.app_versions(app_id);

-- Subscriptions (Lemon Squeezy webhook data)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ls_subscription_id text UNIQUE NOT NULL,
  ls_customer_id text,
  ls_product_id text,
  ls_variant_id text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'maker', 'pro', 'agency')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Deployments (PWA/APK deployment records)
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deploy_type text NOT NULL CHECK (deploy_type IN ('pwa', 'apk', 'aab', 'vercel', 'zip')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'success', 'failed')),
  url text, -- deployed URL (for PWA/Vercel)
  artifact_url text, -- download URL (for APK/ZIP)
  artifact_size_bytes bigint,
  version_number int,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deployments" ON public.deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_deployments_app_id ON public.deployments(app_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- GENERATED APP TABLES (multi-tenant data for apps built by users)
-- ═══════════════════════════════════════════════════════════════════════════════

-- End-users of generated apps (people who USE the apps, not builders)
CREATE TABLE IF NOT EXISTS public.app_end_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  email text,
  password_hash text, -- bcrypt hash, never store plain
  display_name text,
  avatar_url text,
  provider text DEFAULT 'email' CHECK (provider IN ('email', 'google', 'magic_link', 'anonymous')),
  provider_id text, -- external provider user ID
  profile_data jsonb DEFAULT '{}'::jsonb, -- custom fields defined by app blueprint
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, email)
);

ALTER TABLE public.app_end_users ENABLE ROW LEVEL SECURITY;

-- Builder can view their app's end-users
CREATE POLICY "Builders can view end-users of own apps" ON public.app_end_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_end_users.app_id AND apps.user_id = auth.uid())
  );
-- Service role inserts (from API routes, not direct client)
-- End-users authenticate via our custom JWT, not Supabase Auth

CREATE INDEX idx_app_end_users_app_id ON public.app_end_users(app_id);
CREATE INDEX idx_app_end_users_email ON public.app_end_users(app_id, email);

-- Collections (named data stores per app, like Firestore collections)
CREATE TABLE IF NOT EXISTS public.app_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- e.g., "workouts", "recipes", "tasks"
  schema jsonb NOT NULL DEFAULT '[]'::jsonb, -- field definitions [{name, type, required, default}]
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, name)
);

ALTER TABLE public.app_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can manage collections of own apps" ON public.app_collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_collections.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_app_collections_app_id ON public.app_collections(app_id);

-- Collection items (documents within collections)
CREATE TABLE IF NOT EXISTS public.app_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.app_collections(id) ON DELETE CASCADE NOT NULL,
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL, -- denormalized for RLS
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE SET NULL, -- who created it
  data jsonb NOT NULL DEFAULT '{}'::jsonb, -- the actual document data
  sort_order int DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_collection_items ENABLE ROW LEVEL SECURITY;

-- Builders see all items in their apps
CREATE POLICY "Builders can manage items of own apps" ON public.app_collection_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_collection_items.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_collection_items_collection ON public.app_collection_items(collection_id);
CREATE INDEX idx_collection_items_app ON public.app_collection_items(app_id);
CREATE INDEX idx_collection_items_user ON public.app_collection_items(end_user_id);
CREATE INDEX idx_collection_items_data ON public.app_collection_items USING gin(data); -- JSON search

-- App files (metadata for uploaded files, actual files in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.app_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL, -- path in Supabase Storage bucket
  mime_type text,
  size_bytes bigint,
  purpose text DEFAULT 'general', -- 'avatar', 'attachment', 'export', etc.
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can view files of own apps" ON public.app_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_files.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_app_files_app ON public.app_files(app_id);

-- App notifications (notification queue + history)
CREATE TABLE IF NOT EXISTS public.app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE CASCADE, -- NULL = broadcast
  title text NOT NULL,
  body text NOT NULL,
  icon_url text,
  action_url text, -- deep link within app
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  scheduled_for timestamptz, -- NULL = send immediately
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can manage notifications of own apps" ON public.app_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_notifications.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_notifications_app ON public.app_notifications(app_id);
CREATE INDEX idx_notifications_user ON public.app_notifications(end_user_id);
CREATE INDEX idx_notifications_status ON public.app_notifications(status) WHERE status = 'pending';

-- App settings (runtime configuration per app)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auth_config jsonb DEFAULT '{
    "enabled": true,
    "providers": ["email"],
    "require_auth": false,
    "allow_signup": true,
    "profile_fields": ["display_name"]
  }'::jsonb,
  notification_config jsonb DEFAULT '{
    "enabled": false,
    "triggers": []
  }'::jsonb,
  storage_config jsonb DEFAULT '{
    "max_file_size_mb": 5,
    "allowed_types": ["image/*", "application/pdf"]
  }'::jsonb,
  theme_config jsonb DEFAULT '{
    "primary_color": "#6366f1",
    "secondary_color": "#8b5cf6",
    "mode": "dark",
    "font": "Inter"
  }'::jsonb,
  custom_config jsonb DEFAULT '{}'::jsonb, -- app-specific settings
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can manage settings of own apps" ON public.app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_settings.app_id AND apps.user_id = auth.uid())
  );

-- Push subscriptions (Web Push API endpoint storage)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL, -- public key
  auth_key text NOT NULL, -- auth secret
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, end_user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can view push subs of own apps" ON public.push_subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = push_subscriptions.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_push_subs_app ON public.push_subscriptions(app_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- UPDATES TO EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add blueprint to apps table (full app architecture, not just screens)
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS blueprint jsonb DEFAULT '{}'::jsonb;

-- Add end_user_count tracking
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS end_user_count int DEFAULT 0;

-- Add storage_used_bytes tracking
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS storage_used_bytes bigint DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Increment usage (upsert-safe)
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_date date,
  p_prompts int DEFAULT 1,
  p_tokens int DEFAULT 0
) RETURNS void AS $$
BEGIN
  INSERT INTO public.usage (user_id, date, prompts_used, tokens_used)
  VALUES (p_user_id, p_date, p_prompts, p_tokens)
  ON CONFLICT (user_id, date) DO UPDATE SET
    prompts_used = usage.prompts_used + p_prompts,
    tokens_used = usage.tokens_used + p_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update end_user_count
CREATE OR REPLACE FUNCTION update_end_user_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps SET end_user_count = end_user_count + 1 WHERE id = NEW.app_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET end_user_count = end_user_count - 1 WHERE id = OLD.app_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_end_user_change
  AFTER INSERT OR DELETE ON public.app_end_users
  FOR EACH ROW EXECUTE FUNCTION update_end_user_count();

-- Auto-update updated_at for new tables
CREATE TRIGGER update_app_end_users_updated_at BEFORE UPDATE ON public.app_end_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON public.app_collection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Note: Storage bucket creation requires admin API, not SQL
-- Buckets needed:
--   1. "app-assets" — generated app icons, splash screens
--   2. "app-uploads" — end-user file uploads (avatars, attachments)
--   3. "app-exports" — ZIP/PWA/APK export artifacts
