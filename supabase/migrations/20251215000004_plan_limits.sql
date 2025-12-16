-- Migration: Plan-Based Member Limits
-- Purpose: Enforce member limits based on subscription plans (Free=1, Pro=2, Family=5)

-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g. 'Free', 'Pro', 'Family Plus'
  max_members INTEGER NOT NULL DEFAULT 1,
  price_monthly NUMERIC DEFAULT 0,
  stripe_price_id TEXT -- To link with profiles.subscription_price_id
);

-- 2. Insert Plan Definitions
-- We use ON CONFLICT to ensure idempotency
INSERT INTO plans (name, max_members, price_monthly, stripe_price_id)
VALUES 
  ('Free', 1, 0, NULL),
  ('Pro', 2, 99, 'price_pro_dummy_id'), -- Placeholder IDs
  ('Family Plus', 5, 199, 'price_family_dummy_id')
ON CONFLICT (name) DO UPDATE 
SET max_members = EXCLUDED.max_members;

-- 3. RLS Policies for Plans
-- Users should be able to read plans to see limits
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans" ON plans
  FOR SELECT
  USING (true);

-- 4. Function: Check Member Limit
CREATE OR REPLACE FUNCTION public.check_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  allowed_limit INTEGER;
  target_family_id UUID;
BEGIN
  -- Determine the family_id we are checking
  -- For INSERT, it's NEW.family_id
  -- For UPDATE, it's NEW.family_id (if changing families)
  target_family_id := NEW.family_id;

  -- If no family_id is assigned (e.g. creating a solo profile initially), skip check
  -- Or if family_id is not changing (for updates unrelated to family), we might skip too?
  -- But cleaner to just check if target_family_id IS NULL -> Return
  IF target_family_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- If this is an UPDATE and family_id hasn't changed, strictly speaking we don't *need* to check 
  -- unless we want to prevent "over-limit" states from persisting on other updates. 
  -- But usually we only care on entry.
  -- Let's stick to checking on entry (change of family_id).
  
  -- Validating Plan Limit
  -- 1. Get current member count for this family
  SELECT COUNT(*) INTO current_count
  FROM profiles
  WHERE family_id = target_family_id
  AND id != NEW.id; -- Exclude self if we are already in DB (updating)

  -- 2. Determine Allowed Limit
  -- Logic: Find the "Best" active plan held by ANY member of this family
  -- If no active subscription found, default to 'Free' (Limit 1)
  
  SELECT COALESCE(MAX(p.max_members), 1) INTO allowed_limit
  FROM profiles prof
  JOIN plans p ON prof.subscription_price_id = p.stripe_price_id
  WHERE prof.family_id = target_family_id
  AND prof.subscription_status IN ('active', 'trialing');

  -- 3. Enforce
  -- Note: If I am the first member (count=0), allowed=1 (Free). 0 < 1. OK.
  -- If I am second member (count=1), allowed=1 (Free). 1 < 1 is FALSE. 1 >= 1 is TRUE. -> REJECT.
  -- Correct logic: If (current_count) >= allowed_limit THEN Reject.
  
  IF current_count >= allowed_limit THEN
    RAISE EXCEPTION 'Plan limit reached. This plan allows max % members.', allowed_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger
-- We assume 'profiles' is the table holding members (as per 20241213000004_family_workspace.sql)
DROP TRIGGER IF EXISTS enforce_member_limit ON profiles;

CREATE TRIGGER enforce_member_limit
BEFORE INSERT OR UPDATE OF family_id
ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_member_limit();

-- 6. Comment
COMMENT ON TABLE plans IS 'Defines subscription tiers and their user limits.';
COMMENT ON FUNCTION public.check_member_limit IS 'Enforces plan-based user limits per family workspace.';
