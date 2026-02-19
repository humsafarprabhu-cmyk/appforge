-- Migration 004: Payment-related columns for dual gateway (Razorpay + Lemon Squeezy)

-- Add payment columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_updated_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS razorpay_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ls_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ls_subscription_id text;

-- Add screens column to apps (for storing generated HTML screens)
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS screens jsonb DEFAULT '[]'::jsonb;

-- Index for looking up users by payment IDs
CREATE INDEX IF NOT EXISTS idx_profiles_razorpay ON public.profiles(razorpay_customer_id) WHERE razorpay_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_ls ON public.profiles(ls_customer_id) WHERE ls_customer_id IS NOT NULL;
