-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 003: Hard Engineering — Roles, validation, admin, production-ready
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add role + ban + reset fields to end users
ALTER TABLE public.app_end_users 
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' 
    CHECK (role IN ('admin', 'editor', 'user', 'guest')),
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS reset_token text,
  ADD COLUMN IF NOT EXISTS reset_token_expires timestamptz;

CREATE INDEX IF NOT EXISTS idx_end_users_role ON public.app_end_users(app_id, role);
CREATE INDEX IF NOT EXISTS idx_end_users_email ON public.app_end_users(app_id, email);
CREATE INDEX IF NOT EXISTS idx_end_users_reset ON public.app_end_users(app_id, reset_token) WHERE reset_token IS NOT NULL;

-- Add settings to collections (access control, validation config)
ALTER TABLE public.app_collections
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Add end_user_count to apps (for plan limit checks)
ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS end_user_count int NOT NULL DEFAULT 0;

-- Function to increment end_user_count
CREATE OR REPLACE FUNCTION increment_end_user_count(app_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.apps SET end_user_count = end_user_count + 1 WHERE id = app_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-increment/decrement end_user_count on insert/delete
CREATE OR REPLACE FUNCTION update_end_user_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps SET end_user_count = end_user_count + 1 WHERE id = NEW.app_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET end_user_count = GREATEST(end_user_count - 1, 0) WHERE id = OLD.app_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_end_user_change ON public.app_end_users;
CREATE TRIGGER on_end_user_change
  AFTER INSERT OR DELETE ON public.app_end_users
  FOR EACH ROW EXECUTE FUNCTION update_end_user_count();

-- Add blueprint column to apps if not exists
ALTER TABLE public.apps 
  ADD COLUMN IF NOT EXISTS blueprint jsonb;

-- Add is_archived to collection items if not exists
ALTER TABLE public.app_collection_items
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_items_not_archived 
  ON public.app_collection_items(collection_id, is_archived) WHERE is_archived = false;

-- Add public_url to app_files
ALTER TABLE public.app_files
  ADD COLUMN IF NOT EXISTS public_url text;

-- Add data column to notifications
ALTER TABLE public.app_notifications
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;

-- Add audit log table
CREATE TABLE IF NOT EXISTS public.app_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  end_user_id uuid,
  action text NOT NULL, -- signup, login, create, update, delete, ban, role_change
  resource_type text,   -- user, item, collection, file, notification
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_app ON public.app_audit_log(app_id, created_at DESC);

-- RLS for audit log (admin only via service role — no direct access)
ALTER TABLE public.app_audit_log ENABLE ROW LEVEL SECURITY;
