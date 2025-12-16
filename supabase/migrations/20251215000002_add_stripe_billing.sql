-- Migration: Add Stripe Billing Columns to Profiles
-- This migration adds the necessary columns for Stripe subscription management

-- Add Stripe customer and subscription columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Active Stripe Subscription ID';
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status: free, trialing, active, past_due, canceled';
COMMENT ON COLUMN profiles.subscription_price_id IS 'Stripe Price ID of current subscription';
COMMENT ON COLUMN profiles.subscription_current_period_end IS 'When the current subscription period ends';
