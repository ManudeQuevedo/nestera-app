-- =============================================================================
-- FAMILY OS V3: CASH WALLET & TRANSFER LOGIC
-- Migration: 009_cash_wallet_transfers.sql
-- =============================================================================

-- ============================================================
-- PART 0: NUCLEAR RESET (Optional - Comment out if not needed)
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
DO $$
BEGIN
  -- Try to truncate with all tables, fallback if some don't exist
  EXECUTE 'TRUNCATE TABLE 
    public.transactions,
    public.goals,
    public.budgets,
    public.categories,
    public.ant_expenses,
    public.events,
    public.meal_plans,
    public.bank_imports,
    public.profiles
  RESTART IDENTITY CASCADE';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Some tables do not exist, continuing';
END $$;

-- Finally delete users
DELETE FROM auth.users;

-- ============================================================
-- PART 1: ACCOUNTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'cash', 'investment', 'credit')),
  institution VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MXN',
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE, -- True for auto-created Cash Wallet
  color VARCHAR(7) DEFAULT '#10b981', -- Hex color for UI
  icon VARCHAR(50) DEFAULT 'wallet',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accounts_select" ON public.accounts;
DROP POLICY IF EXISTS "accounts_insert" ON public.accounts;
DROP POLICY IF EXISTS "accounts_update" ON public.accounts;
DROP POLICY IF EXISTS "accounts_delete" ON public.accounts;
CREATE POLICY "accounts_select" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(user_id, type);

-- ============================================================
-- PART 2: AUTO-CREATE CASH WALLET FOR NEW USERS
-- ============================================================

-- Trigger function needs SECURITY DEFINER to insert into accounts
-- when triggered by auth.users insert (different schema context)
CREATE OR REPLACE FUNCTION public.create_default_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default Cash Wallet
  INSERT INTO public.accounts (user_id, name, type, is_system, color, icon)
  VALUES (NEW.id, 'Efectivo', 'cash', TRUE, '#f59e0b', 'banknote');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_accounts ON auth.users;
CREATE TRIGGER on_auth_user_created_accounts
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_accounts();

-- ============================================================
-- PART 3: TRANSACTIONS TABLE UPDATES
-- ============================================================

-- Add account_id (source account for the transaction)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Add transfer_to_account_id (destination for transfers)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS transfer_to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Add is_transfer flag (computed in app, stored for queries)
-- A transaction is a transfer if transfer_to_account_id IS NOT NULL

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_to ON public.transactions(transfer_to_account_id) 
  WHERE transfer_to_account_id IS NOT NULL;

-- ============================================================
-- PART 4: HELPER FUNCTION - GET CASH WALLET BALANCE
-- ============================================================

-- Helper function uses SECURITY INVOKER to respect RLS
-- User can only query their own balance via auth.uid()
CREATE OR REPLACE FUNCTION public.get_cash_wallet_balance(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_cash_account_id UUID;
  v_deposits DECIMAL;
  v_withdrawals DECIMAL;
BEGIN
  -- Security check: only allow querying own balance
  IF p_user_id != auth.uid() THEN
    RETURN 0;
  END IF;

  -- Get the user's system cash wallet
  SELECT id INTO v_cash_account_id
  FROM public.accounts
  WHERE user_id = p_user_id AND type = 'cash' AND is_system = TRUE
  LIMIT 1;
  
  IF v_cash_account_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Sum all transfers TO this account (deposits/ATM withdrawals kept)
  SELECT COALESCE(SUM(amount), 0) INTO v_deposits
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND transfer_to_account_id = v_cash_account_id
    AND is_hidden = FALSE;
  
  -- Sum all expenses FROM this account (cash spent)
  SELECT COALESCE(SUM(amount), 0) INTO v_withdrawals
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND account_id = v_cash_account_id
    AND transfer_to_account_id IS NULL -- Not a transfer, an actual expense
    AND type = 'expense'
    AND is_hidden = FALSE;
  
  RETURN v_deposits - v_withdrawals;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ============================================================
-- PART 5: PROFILE UPDATES
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cash_wallet_initial_balance DECIMAL(12, 2) DEFAULT 0;

-- ============================================================
-- PART 6: VIEW FOR EASY BALANCE QUERIES
-- ============================================================

-- View with SECURITY INVOKER respects RLS on underlying tables
-- Users can only see their own accounts due to RLS on public.accounts
CREATE OR REPLACE VIEW public.account_balances 
WITH (security_invoker = true) AS
SELECT 
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.color,
  a.icon,
  a.is_system,
  COALESCE(
    CASE 
      WHEN a.type = 'cash' AND a.is_system = TRUE THEN public.get_cash_wallet_balance(a.user_id)
      ELSE a.balance
    END,
    0
  ) as calculated_balance
FROM public.accounts a;

-- ============================================================
-- CONFIRMATION
-- ============================================================

SELECT 'CASH WALLET MIGRATION COMPLETE' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'accounts') as accounts_table_exists,
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name IN ('account_id', 'transfer_to_account_id')) as new_tx_columns;
