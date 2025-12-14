-- Repair Migration: Fix goals and investments table structure
-- Tables may exist from a prior migration but may have different columns

-- ============================================
-- 1. GOALS TABLE
-- ============================================
DROP TABLE IF EXISTS goals CASCADE;

CREATE TABLE goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) DEFAULT 0,
  deadline date,
  icon text,
  color text,
  priority integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- ============================================
-- 2. INVESTMENTS TABLE (drop and recreate)
-- ============================================
DROP TABLE IF EXISTS investment_history CASCADE;
DROP TABLE IF EXISTS investments CASCADE;

CREATE TABLE investments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('college_fund', 'retirement', 'stocks', 'crypto', 'real_estate', 'other')) NOT NULL DEFAULT 'other',
  current_value numeric(12,2) NOT NULL DEFAULT 0,
  monthly_contribution numeric(12,2) DEFAULT 0,
  year_started integer,
  icon text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON investments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- ============================================
-- 3. INVESTMENT HISTORY TABLE
-- ============================================
CREATE TABLE investment_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id uuid REFERENCES investments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  value numeric(12,2) NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE investment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investment history" ON investment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investment history" ON investment_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own investment history" ON investment_history FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_investment_history_investment_id ON investment_history(investment_id);
