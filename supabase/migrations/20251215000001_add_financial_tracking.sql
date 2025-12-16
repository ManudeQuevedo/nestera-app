-- Migration: Add Financial Tracking Columns to Profiles
-- This adds columns needed for the Mexican financial features

-- Add first_name column for greeting fallback
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Add family-related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_name TEXT;

-- Add financial DNA / customization columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'dd/MM/yyyy';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pay_day_1 INTEGER DEFAULT 15;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pay_day_2 INTEGER DEFAULT 30;

-- Add comments
COMMENT ON COLUMN profiles.first_name IS 'User first name for greeting';
COMMENT ON COLUMN profiles.family_name IS 'Family/surname for family greeting display';
COMMENT ON COLUMN profiles.currency IS 'Default currency (MXN, USD)';
COMMENT ON COLUMN profiles.date_format IS 'Date format preference';
COMMENT ON COLUMN profiles.pay_day_1 IS 'First payday of month (default 15)';
COMMENT ON COLUMN profiles.pay_day_2 IS 'Second payday of month (default 30)';
