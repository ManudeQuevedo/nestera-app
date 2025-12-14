-- Family Wealth OS Feature Overhaul Migration
-- Adds accounts, goals, investments tables and updates transactions

-- ============================================
-- 1. ACCOUNTS TABLE (Manual Balance Tracking)
-- ============================================
CREATE TABLE accounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('bank', 'cash', 'credit', 'other')) NOT NULL DEFAULT 'bank',
  current_balance numeric(12,2) NOT NULL DEFAULT 0,
  is_debt boolean DEFAULT false, -- True for credit cards, loans
  icon text, -- Lucide icon name
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. UPDATE TRANSACTIONS TABLE
-- ============================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method text 
  CHECK (payment_method IN ('cash', 'debit', 'credit')) DEFAULT 'debit';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS establishment text;

-- ============================================
-- 3. CATEGORY GROUPS TABLE
-- ============================================
CREATE TABLE category_groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_system boolean DEFAULT false, -- System groups can't be deleted
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Category Groups
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own category groups" ON category_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own category groups" ON category_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category groups" ON category_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own category groups" ON category_groups FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Link categories to groups
ALTER TABLE categories ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES category_groups;

-- ============================================
-- 4. GOALS TABLE
-- ============================================
CREATE TABLE goals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) DEFAULT 0,
  deadline date,
  icon text, -- Lucide icon name
  color text, -- Gradient or color class
  priority integer DEFAULT 0, -- For sorting
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. INVESTMENTS TABLE
-- ============================================
CREATE TABLE investments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- RLS for Investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON investments FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. INVESTMENT HISTORY (For Charts)
-- ============================================
CREATE TABLE investment_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  investment_id uuid REFERENCES investments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  value numeric(12,2) NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Investment History
ALTER TABLE investment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investment history" ON investment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investment history" ON investment_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own investment history" ON investment_history FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_history_investment_id ON investment_history(investment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
