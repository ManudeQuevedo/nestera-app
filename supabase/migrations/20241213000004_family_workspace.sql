-- Migration: Family Workspace Setup
-- Purpose: Migrate from single-user to shared family workspace model
-- Both users share the same data via family_id

-- ============================================
-- 1. GENERATE A SHARED FAMILY UUID
-- ============================================
-- This creates a constant UUID for the Matus Family
-- Using a deterministic approach so re-runs don't create new UUIDs

DO $$
DECLARE
  matus_family_id UUID;
  manuel_id UUID;
  carolina_id UUID;
BEGIN
  -- Generate a single family UUID (or get existing one)
  -- We'll store it in profiles and use it consistently
  
  -- First check if family_id column exists on profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'family_id'
  ) THEN
    -- Add family_id column to profiles
    ALTER TABLE profiles ADD COLUMN family_id UUID;
  END IF;
  
  -- Check if either user already has a family_id assigned
  SELECT family_id INTO matus_family_id 
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email IN ('manuel.matusdequevedo@gmail.com', 'carolina.matus.osorio@gmail.com')
  AND p.family_id IS NOT NULL
  LIMIT 1;
  
  -- If no family_id exists yet, generate one
  IF matus_family_id IS NULL THEN
    matus_family_id := gen_random_uuid();
  END IF;
  
  -- Get user IDs
  SELECT id INTO manuel_id FROM auth.users WHERE email = 'manuel.matusdequevedo@gmail.com';
  SELECT id INTO carolina_id FROM auth.users WHERE email = 'carolina.matus.osorio@gmail.com';
  
  -- Assign family_id to both users
  IF manuel_id IS NOT NULL THEN
    UPDATE profiles SET family_id = matus_family_id WHERE id = manuel_id;
  END IF;
  
  IF carolina_id IS NOT NULL THEN
    UPDATE profiles SET family_id = matus_family_id WHERE id = carolina_id;
  END IF;
  
  -- Store the family_id for use in subsequent statements
  RAISE NOTICE 'Matus Family ID: %', matus_family_id;
END $$;


-- ============================================
-- 2. ADD family_id TO ALL DATA TABLES
-- ============================================

-- TRANSACTIONS
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS family_id UUID;

-- CATEGORIES  
ALTER TABLE categories ADD COLUMN IF NOT EXISTS family_id UUID;

-- DEBTS
ALTER TABLE debts ADD COLUMN IF NOT EXISTS family_id UUID;

-- GOALS
ALTER TABLE goals ADD COLUMN IF NOT EXISTS family_id UUID;

-- DAILY_RECEIPTS
ALTER TABLE daily_receipts ADD COLUMN IF NOT EXISTS family_id UUID;

-- SCHOOL_PAYMENTS
ALTER TABLE school_payments ADD COLUMN IF NOT EXISTS family_id UUID;

-- ACCOUNTS (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'accounts') THEN
    ALTER TABLE accounts ADD COLUMN IF NOT EXISTS family_id UUID;
  END IF;
END $$;


-- ============================================
-- 3. BACKFILL family_id FROM USER'S PROFILE
-- ============================================
-- These backfill queries are conditional - only run if user_id column exists

DO $$
DECLARE
  matus_family_id UUID;
BEGIN
  -- Get the Matus family_id from profiles
  SELECT family_id INTO matus_family_id 
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email = 'manuel.matusdequevedo@gmail.com'
  LIMIT 1;

  -- If we found a family_id, backfill all tables with empty family_id
  IF matus_family_id IS NOT NULL THEN
    
    -- Transactions (check if user_id exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
      UPDATE transactions t
      SET family_id = p.family_id
      FROM profiles p
      WHERE t.user_id = p.id
      AND t.family_id IS NULL;
    ELSE
      -- No user_id, just set all NULL family_ids to the matus family
      UPDATE transactions SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- Categories
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'user_id') THEN
      UPDATE categories c
      SET family_id = p.family_id
      FROM profiles p
      WHERE c.user_id = p.id
      AND c.family_id IS NULL;
    ELSE
      UPDATE categories SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- Debts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debts' AND column_name = 'user_id') THEN
      UPDATE debts d
      SET family_id = p.family_id
      FROM profiles p
      WHERE d.user_id = p.id
      AND d.family_id IS NULL;
    ELSE
      UPDATE debts SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- Goals
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'user_id') THEN
      UPDATE goals g
      SET family_id = p.family_id
      FROM profiles p
      WHERE g.user_id = p.id
      AND g.family_id IS NULL;
    ELSE
      UPDATE goals SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- Daily Receipts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_receipts' AND column_name = 'user_id') THEN
      UPDATE daily_receipts dr
      SET family_id = p.family_id
      FROM profiles p
      WHERE dr.user_id = p.id
      AND dr.family_id IS NULL;
    ELSE
      UPDATE daily_receipts SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- School Payments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_payments' AND column_name = 'user_id') THEN
      UPDATE school_payments sp
      SET family_id = p.family_id
      FROM profiles p
      WHERE sp.user_id = p.id
      AND sp.family_id IS NULL;
    ELSE
      UPDATE school_payments SET family_id = matus_family_id WHERE family_id IS NULL;
    END IF;
    
    -- Accounts (if exists)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'accounts') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'user_id') THEN
        UPDATE accounts a
        SET family_id = p.family_id
        FROM profiles p
        WHERE a.user_id = p.id
        AND a.family_id IS NULL;
      ELSE
        UPDATE accounts SET family_id = matus_family_id WHERE family_id IS NULL;
      END IF;
    END IF;
    
    RAISE NOTICE 'Backfill complete with family_id: %', matus_family_id;
  ELSE
    RAISE NOTICE 'No family_id found - skipping backfill';
  END IF;
END $$;


-- ============================================
-- 4. HELPER FUNCTION: Get current user's family_id
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_family_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT family_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_family_id() TO authenticated;


-- ============================================
-- 5. UPDATE RLS POLICIES: Family-based access
-- ============================================

-- Drop all existing policies and create new family-based ones

-- TRANSACTIONS
DROP POLICY IF EXISTS "Authorized users only" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Family members can access" ON transactions;

CREATE POLICY "Family members can access" ON transactions
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- CATEGORIES
DROP POLICY IF EXISTS "Authorized users only" ON categories;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Family members can access" ON categories;

CREATE POLICY "Family members can access" ON categories
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- DEBTS
DROP POLICY IF EXISTS "Authorized users only" ON debts;
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Users can manage own debts" ON debts;
DROP POLICY IF EXISTS "Family members can access" ON debts;

CREATE POLICY "Family members can access" ON debts
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- GOALS
DROP POLICY IF EXISTS "Authorized users only" ON goals;
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Family members can access" ON goals;

CREATE POLICY "Family members can access" ON goals
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- DAILY_RECEIPTS
DROP POLICY IF EXISTS "Authorized users only" ON daily_receipts;
DROP POLICY IF EXISTS "Users can view own receipts" ON daily_receipts;
DROP POLICY IF EXISTS "Family members can access" ON daily_receipts;

CREATE POLICY "Family members can access" ON daily_receipts
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- SCHOOL_PAYMENTS
DROP POLICY IF EXISTS "Authorized users only" ON school_payments;
DROP POLICY IF EXISTS "Users can view own school payments" ON school_payments;
DROP POLICY IF EXISTS "Family members can access" ON school_payments;

CREATE POLICY "Family members can access" ON school_payments
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- PROFILES - Special case: can view own profile and family members
DROP POLICY IF EXISTS "Authorized users only" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Family members can view" ON profiles;
DROP POLICY IF EXISTS "Users can update self" ON profiles;

CREATE POLICY "Family members can view" ON profiles
  FOR SELECT
  USING (family_id = public.get_user_family_id() OR id = auth.uid());

CREATE POLICY "Users can update self" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ACCOUNTS (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'accounts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authorized users only" ON accounts';
    EXECUTE 'DROP POLICY IF EXISTS "Family members can access" ON accounts';
    EXECUTE 'CREATE POLICY "Family members can access" ON accounts
      FOR ALL
      USING (family_id = public.get_user_family_id())
      WITH CHECK (family_id = public.get_user_family_id())';
  END IF;
END $$;


-- ============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN profiles.family_id IS 'Links users to a shared family workspace. Users with the same family_id see the same data.';
COMMENT ON FUNCTION public.get_user_family_id() IS 'Returns the family_id for the current authenticated user. Used in RLS policies.';
