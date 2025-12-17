-- =============================================================================
-- FAMILY OS: COMPLETE RESET & SETUP
-- Run this in Supabase SQL Editor to fully reset and configure the database
-- =============================================================================

-- ============================================================
-- PART 1: NUCLEAR RESET (Fix MFA Zombie Bug)
-- ============================================================

-- Delete MFA data FIRST (prevents zombie sessions)
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_factors;

-- Try to delete MFA AMR claims (may not exist in all Supabase versions)
DO $$
BEGIN
  EXECUTE 'DELETE FROM auth.mfa_amr_claims';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'auth.mfa_amr_claims does not exist, skipping';
END $$;

-- Delete auth relationships
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;

-- Truncate ALL public tables with CASCADE
TRUNCATE TABLE 
  public.bank_statements,
  public.daily_receipts,
  public.debts,
  public.transactions,
  public.goals,
  public.budgets,
  public.categories,
  public.ant_expenses,
  public.events,
  public.meal_plans,
  public.bank_imports,
  public.profiles
RESTART IDENTITY CASCADE;

-- Finally delete users
DELETE FROM auth.users;

-- ============================================================
-- PART 2: PROFILES TABLE (Enhanced)
-- ============================================================

-- Add new columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_school_expenses BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meal_planner_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS data_coverage_months INTEGER DEFAULT 0;

-- ============================================================
-- PART 3: TRANSACTIONS TABLE (Hybrid Entry Support)
-- ============================================================

-- Add source tracking and verification columns
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'bank'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON public.transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON public.transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_date_amount ON public.transactions(date, amount);

-- ============================================================
-- PART 4: ANT EXPENSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ant_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'once',
  is_recurring BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ant_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ant_expenses_select" ON public.ant_expenses;
DROP POLICY IF EXISTS "ant_expenses_insert" ON public.ant_expenses;
DROP POLICY IF EXISTS "ant_expenses_update" ON public.ant_expenses;
DROP POLICY IF EXISTS "ant_expenses_delete" ON public.ant_expenses;
CREATE POLICY "ant_expenses_select" ON public.ant_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ant_expenses_insert" ON public.ant_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ant_expenses_update" ON public.ant_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ant_expenses_delete" ON public.ant_expenses FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 5: EVENTS TABLE (Financial Calendar)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  estimated_cost DECIMAL(12, 2) DEFAULT 0,
  actual_cost DECIMAL(12, 2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;
CREATE POLICY "events_select" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 6: MEAL PLANS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  groceries JSONB DEFAULT '[]',
  dishes JSONB DEFAULT '[]',
  total_budget DECIMAL(12, 2),
  actual_spent DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meal_plans_select" ON public.meal_plans;
DROP POLICY IF EXISTS "meal_plans_insert" ON public.meal_plans;
DROP POLICY IF EXISTS "meal_plans_update" ON public.meal_plans;
DROP POLICY IF EXISTS "meal_plans_delete" ON public.meal_plans;
CREATE POLICY "meal_plans_select" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meal_plans_insert" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meal_plans_update" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meal_plans_delete" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 7: BANK IMPORTS TABLE (Staging with 24h Expiry)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bank_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_data JSONB NOT NULL,
  file_path TEXT,
  file_count INTEGER DEFAULT 1,
  date_range_start DATE,
  date_range_end DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.bank_imports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bank_imports_select" ON public.bank_imports;
DROP POLICY IF EXISTS "bank_imports_insert" ON public.bank_imports;
DROP POLICY IF EXISTS "bank_imports_update" ON public.bank_imports;
DROP POLICY IF EXISTS "bank_imports_delete" ON public.bank_imports;
CREATE POLICY "bank_imports_select" ON public.bank_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bank_imports_insert" ON public.bank_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bank_imports_update" ON public.bank_imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bank_imports_delete" ON public.bank_imports FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ant_expenses_user_id ON public.ant_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_imports_user_id ON public.bank_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_imports_status ON public.bank_imports(status);
CREATE INDEX IF NOT EXISTS idx_bank_imports_expires ON public.bank_imports(expires_at);

-- ============================================================
-- PART 9: CLEANUP FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_expired_bank_imports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bank_imports 
  WHERE expires_at < NOW() AND status IN ('pending', 'reviewing');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CONFIRMATION
-- ============================================================

SELECT 'FAMILY OS RESET COMPLETE' as status,
       (SELECT COUNT(*) FROM auth.users) as users_count,
       (SELECT COUNT(*) FROM public.transactions) as transactions_count;
