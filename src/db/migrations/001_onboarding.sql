-- 1. Add Onboarding & Plan Flags
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'family_trial'
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Add the "Menu Configuration" JSON (The Magic Column)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS menu_preferences JSONB DEFAULT '{
  "school_label": "School Payments",
  "investments_label": "Inversiones",
  "show_investments": false
}'::jsonb;

-- 3. Security (Allow user to update their own preferences)
-- (Assuming RLS is already set up for profiles based on auth.uid())
