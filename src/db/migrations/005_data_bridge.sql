-- Migration 005: The Data Bridge
-- Supports extended onboarding, goals, ant expenses, events, and meal planning

-- ============================================================
-- PART 1: PROFILES UPDATE
-- ============================================================

-- Add school expenses flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_school_expenses BOOLEAN DEFAULT FALSE;

-- Add meal planner configuration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS meal_planner_config JSONB DEFAULT NULL;

-- Add income/expense tracking from onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MXN';

-- ============================================================
-- PART 2: ANT EXPENSES TABLE (Impulse/Unplanned spending)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ant_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'once', -- 'once', 'daily', 'weekly', 'monthly'
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for ant_expenses
ALTER TABLE public.ant_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ant expenses" ON public.ant_expenses;
CREATE POLICY "Users can view their own ant expenses"
  ON public.ant_expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ant expenses" ON public.ant_expenses;
CREATE POLICY "Users can insert their own ant expenses"
  ON public.ant_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ant expenses" ON public.ant_expenses;
CREATE POLICY "Users can update their own ant expenses"
  ON public.ant_expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ant expenses" ON public.ant_expenses;
CREATE POLICY "Users can delete their own ant expenses"
  ON public.ant_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PART 3: GOALS TABLE (Enhanced)
-- ============================================================

-- Drop and recreate if exists to ensure proper schema
-- First check if table exists and has different schema
DO $$
BEGIN
  -- Add type column if not exists on goals table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'short';
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS deadline DATE;
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS color VARCHAR(20);
  END IF;
END $$;

-- ============================================================
-- PART 4: EVENTS TABLE (Financial Events/Calendar)
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
  recurrence_rule VARCHAR(50), -- 'monthly', 'yearly', 'weekly'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;
CREATE POLICY "Users can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PART 5: MEAL PLANS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  groceries JSONB DEFAULT '[]', -- [{name, quantity, estimated_cost, purchased}]
  dishes JSONB DEFAULT '[]', -- [{day, meal_type, dish_name, recipe_url}]
  total_budget DECIMAL(12, 2),
  actual_spent DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for one plan per week per user
  UNIQUE(user_id, week_start_date)
);

-- RLS for meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can view their own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can insert their own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can update their own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can delete their own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PART 6: BANK IMPORTS TABLE (Ephemeral Staging)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bank_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_data JSONB NOT NULL, -- Parsed transaction data
  file_path TEXT, -- Path in storage bucket (for cleanup)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'committed', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') -- Auto-expire after 24h
);

-- RLS for bank_imports
ALTER TABLE public.bank_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bank imports" ON public.bank_imports;
CREATE POLICY "Users can view their own bank imports"
  ON public.bank_imports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bank imports" ON public.bank_imports;
CREATE POLICY "Users can insert their own bank imports"
  ON public.bank_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bank imports" ON public.bank_imports;
CREATE POLICY "Users can update their own bank imports"
  ON public.bank_imports FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank imports" ON public.bank_imports;
CREATE POLICY "Users can delete their own bank imports"
  ON public.bank_imports FOR DELETE
  USING (auth.uid() = user_id);

-- Add is_recurring to ant_expenses if not exists
ALTER TABLE public.ant_expenses 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- ============================================================
-- PART 7: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ant_expenses_user_id ON public.ant_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON public.meal_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_bank_imports_user_id ON public.bank_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_imports_status ON public.bank_imports(status);
CREATE INDEX IF NOT EXISTS idx_bank_imports_expires ON public.bank_imports(expires_at);

-- ============================================================
-- PART 8: CLEANUP FUNCTION (Delete expired imports)
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_expired_bank_imports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bank_imports 
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CONFIRMATION
-- ============================================================

SELECT 'Migration 005 Complete (with bank_imports)' as status;
