-- Migration: dynamic_sidebar_schema
-- Description: Adds app_settings JSONB and tracking columns as requested.

-- 1. Add columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1, -- Track wizard progress (1-7)
ADD COLUMN IF NOT EXISTS app_settings JSONB DEFAULT '{
  "sidebar_labels": {},
  "enabled_modules": []
}'::jsonb;

-- 2. Optional: Migrate existing data if you played with previous migrations
-- (This ensures we don't lose the previous 'sidebar_labels' if they existed, though likely fresh)
-- UPDATE profiles SET app_settings = jsonb_set(app_settings, '{sidebar_labels}', sidebar_labels) WHERE sidebar_labels IS NOT NULL;
