-- Migration: Auth Security - Strict Allowlist & RLS
-- Security Level: High
-- Restrictions: Only specific emails can access data.
-- NOTE: The trigger on auth.users must be created via Supabase Dashboard SQL Editor

-- ============================================
-- 1. HELPER FUNCTION: Check if user is authorized (For RLS)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  allowed_emails TEXT[] := ARRAY[
    'carolina.matus.osorio@gmail.com',
    'manuel.matusdequevedo@gmail.com'
  ];
BEGIN
  user_email := auth.jwt() ->> 'email';
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN user_email = ANY(allowed_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_authorized_user() TO authenticated;

-- ============================================
-- 2. RLS POLICIES (Defensive - only for tables that exist)
-- ============================================

-- Helper to create policy if table exists
DO $$ 
DECLARE 
  table_record RECORD;
BEGIN 
  -- Tables with user_id column
  FOR table_record IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('transactions', 'categories', 'accounts', 'debts', 'goals', 'daily_receipts', 'school_payments')
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "Authorized users only" ON %I', table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON %I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON %I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON %I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON %I', table_record.tablename, table_record.tablename);
    
    -- Check if user_id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = table_record.tablename AND column_name = 'user_id'
    ) THEN
      EXECUTE format('CREATE POLICY "Authorized users only" ON %I FOR ALL USING (auth.uid() = user_id AND public.is_authorized_user()) WITH CHECK (auth.uid() = user_id AND public.is_authorized_user())', table_record.tablename);
    END IF;
  END LOOP;
  
  -- Profiles table (uses id instead of user_id)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authorized users only" ON profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Authorized users only" ON profiles 
      FOR ALL 
      USING (auth.uid() = id AND public.is_authorized_user()) 
      WITH CHECK (auth.uid() = id AND public.is_authorized_user());
  END IF;
END $$;

-- ============================================
-- 3. IMPORTANT: Run this in Supabase Dashboard SQL Editor
-- ============================================
-- The trigger on auth.users cannot be created via migrations.
-- Go to Supabase Dashboard > SQL Editor and run:
/*
CREATE OR REPLACE FUNCTION public.check_user_allowlist_trigger()
RETURNS TRIGGER AS $$
DECLARE
  allowed_emails TEXT[] := ARRAY[
    'carolina.matus.osorio@gmail.com',
    'manuel.matusdequevedo@gmail.com'
  ];
BEGIN
  IF NEW.email IS NULL OR NOT (NEW.email = ANY(allowed_emails)) THEN
    RAISE EXCEPTION 'Access Restricted: This application is for authorized family members only.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_allowlist_on_signup ON auth.users;
CREATE TRIGGER check_allowlist_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_allowlist_trigger();
*/