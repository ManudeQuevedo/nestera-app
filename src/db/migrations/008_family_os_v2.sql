-- =============================================================================
-- FAMILY OS V2: TRANSACTION SPLITTING & CASH WALLET
-- Migration: 008_family_os_v2.sql
-- =============================================================================

-- ============================================================
-- PART 1: ADD PARENT-CHILD LINKING FOR SPLIT TRANSACTIONS
-- ============================================================

-- Add parent_transaction_id for split transaction linking
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE;

-- Add is_cash_withdrawal flag for ATM detection
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS is_cash_withdrawal BOOLEAN DEFAULT FALSE;

-- Add is_hidden flag for parent transactions that have been split
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- ============================================================
-- PART 2: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_parent_id 
ON public.transactions(parent_transaction_id) 
WHERE parent_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_cash_withdrawal 
ON public.transactions(user_id) 
WHERE is_cash_withdrawal = TRUE;

CREATE INDEX IF NOT EXISTS idx_transactions_visible 
ON public.transactions(user_id, is_hidden) 
WHERE is_hidden = FALSE;

-- ============================================================
-- PART 3: PROFILE ONBOARDING FLAG
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS uses_cash_frequently BOOLEAN DEFAULT FALSE;

-- ============================================================
-- PART 4: VERIFICATION VIEW (For Easy Querying)
-- ============================================================

-- Create a view to easily get visible transactions with split info
CREATE OR REPLACE VIEW public.visible_transactions AS
SELECT 
  t.*,
  CASE 
    WHEN t.parent_transaction_id IS NOT NULL THEN 'split_child'
    WHEN EXISTS(SELECT 1 FROM public.transactions c WHERE c.parent_transaction_id = t.id) THEN 'split_parent'
    ELSE 'standalone'
  END as split_type
FROM public.transactions t
WHERE t.is_hidden = FALSE;

-- ============================================================
-- CONFIRMATION
-- ============================================================

SELECT 'FAMILY OS V2 MIGRATION COMPLETE' as status,
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name IN ('parent_transaction_id', 'is_cash_withdrawal', 'is_hidden')) as new_columns_count;
