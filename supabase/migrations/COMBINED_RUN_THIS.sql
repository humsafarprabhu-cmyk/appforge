-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 001: Initial Schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'maker', 'pro', 'agency')),
  plan_expires_at timestamptz,
  ls_customer_id text,
  ls_subscription_id text,
  apps_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Apps table
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text,
  description text,
  category text,
  icon_url text,
  current_version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'ready', 'building', 'published')),
  package_name text,
  color_primary text not null default '#6366f1',
  color_secondary text not null default '#8b5cf6',
  theme text not null default 'dark',
  screens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apps enable row level security;

create policy "Users can view own apps" on public.apps
  for select using (auth.uid() = user_id);
create policy "Users can insert own apps" on public.apps
  for insert with check (auth.uid() = user_id);
create policy "Users can update own apps" on public.apps
  for update using (auth.uid() = user_id);
create policy "Users can delete own apps" on public.apps
  for delete using (auth.uid() = user_id);

create index if not exists idx_apps_user_id on public.apps(user_id);

-- Chat messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  version_number int,
  tokens_used int,
  model text,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view own messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create index if not exists idx_messages_app_id on public.chat_messages(app_id);

-- Usage tracking table
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  prompts_used int not null default 0,
  tokens_used int not null default 0,
  unique(user_id, date)
);

alter table public.usage enable row level security;

create policy "Users can view own usage" on public.usage
  for select using (auth.uid() = user_id);
create policy "Users can upsert own usage" on public.usage
  for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on public.usage
  for update using (auth.uid() = user_id);

-- Function to update apps_count on profile
create or replace function update_apps_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set apps_count = apps_count + 1, updated_at = now() where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set apps_count = apps_count - 1, updated_at = now() where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_app_change
  after insert or delete on public.apps
  for each row execute function update_apps_count();

-- Function to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger update_apps_updated_at before update on public.apps
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 002: Multi-tenant architecture for generated apps
-- ═══════════════════════════════════════════════════════════════════════════════

-- App versions (version history with code snapshots)
CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  version_number int NOT NULL,
  version_label text,
  screens jsonb NOT NULL DEFAULT '[]'::jsonb,
  blueprint jsonb,
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

-- Deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deploy_type text NOT NULL CHECK (deploy_type IN ('pwa', 'apk', 'aab', 'vercel', 'zip')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'success', 'failed')),
  url text,
  artifact_url text,
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

-- End-users of generated apps
CREATE TABLE IF NOT EXISTS public.app_end_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  email text,
  password_hash text,
  display_name text,
  avatar_url text,
  provider text DEFAULT 'email' CHECK (provider IN ('email', 'google', 'magic_link', 'anonymous')),
  provider_id text,
  profile_data jsonb DEFAULT '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, email)
);

ALTER TABLE public.app_end_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can view end-users of own apps" ON public.app_end_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_end_users.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_app_end_users_app_id ON public.app_end_users(app_id);
CREATE INDEX idx_app_end_users_email ON public.app_end_users(app_id, email);

-- Collections (named data stores per app)
CREATE TABLE IF NOT EXISTS public.app_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
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
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE SET NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can manage items of own apps" ON public.app_collection_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_collection_items.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_collection_items_collection ON public.app_collection_items(collection_id);
CREATE INDEX idx_collection_items_app ON public.app_collection_items(app_id);
CREATE INDEX idx_collection_items_user ON public.app_collection_items(end_user_id);
CREATE INDEX idx_collection_items_data ON public.app_collection_items USING gin(data);

-- App files
CREATE TABLE IF NOT EXISTS public.app_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  purpose text DEFAULT 'general',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can view files of own apps" ON public.app_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_files.app_id AND apps.user_id = auth.uid())
  );

CREATE INDEX idx_app_files_app ON public.app_files(app_id);

-- App notifications
CREATE TABLE IF NOT EXISTS public.app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  icon_url text,
  action_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  scheduled_for timestamptz,
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

-- App settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auth_config jsonb DEFAULT '{"enabled":true,"providers":["email"],"require_auth":false,"allow_signup":true,"profile_fields":["display_name"]}'::jsonb,
  notification_config jsonb DEFAULT '{"enabled":false,"triggers":[]}'::jsonb,
  storage_config jsonb DEFAULT '{"max_file_size_mb":5,"allowed_types":["image/*","application/pdf"]}'::jsonb,
  theme_config jsonb DEFAULT '{"primary_color":"#6366f1","secondary_color":"#8b5cf6","mode":"dark","font":"Inter"}'::jsonb,
  custom_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can manage settings of own apps" ON public.app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_settings.app_id AND apps.user_id = auth.uid())
  );

-- Push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid REFERENCES public.app_end_users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
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

-- Add new columns to apps table
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS blueprint jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS end_user_count int DEFAULT 0;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS storage_used_bytes bigint DEFAULT 0;

-- Increment usage function
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid, p_date date, p_prompts int DEFAULT 1, p_tokens int DEFAULT 0
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

CREATE TRIGGER update_app_end_users_updated_at BEFORE UPDATE ON public.app_end_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON public.app_collection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile when user signs up via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
