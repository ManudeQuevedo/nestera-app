-- Migration: Create User Preferences Table
-- This migration creates the user_preferences table for onboarding and module customization

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Module visibility settings
  enabled_modules TEXT[] DEFAULT ARRAY['dashboard', 'transactions', 'budget', 'goals'],
  
  -- Onboarding questionnaire answers
  has_school_expenses BOOLEAN DEFAULT false,
  has_debt BOOLEAN DEFAULT false,
  pain_point TEXT DEFAULT 'chaos' CHECK (pain_point IN ('ants', 'debts', 'chaos')),
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Family/Profile info
  family_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_preferences IS 'User preferences and onboarding settings for Nestera';
COMMENT ON COLUMN user_preferences.enabled_modules IS 'List of modules visible in sidebar';
COMMENT ON COLUMN user_preferences.pain_point IS 'Primary financial pain point: ants, debts, or chaos';
COMMENT ON COLUMN user_preferences.family_name IS 'Family name for greeting display';
