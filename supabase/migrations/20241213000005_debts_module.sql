-- Migration: Refactor Accounts to Debts Module
-- Purpose: Comprehensive debt tracking for Mexican market
-- Includes: IVA rates, UDI/VSM currencies, MSI, prepayment strategies

-- ============================================
-- 1. CREATE ENUM TYPES
-- ============================================

-- Debt type enum
DO $$ BEGIN
  CREATE TYPE debt_type AS ENUM (
    'credit_card',
    'mortgage',
    'auto_loan',
    'personal_loan',
    'friend_loan'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Currency enum (Mexican market focused)
DO $$ BEGIN
  CREATE TYPE debt_currency AS ENUM (
    'MXN',
    'USD',
    'EUR',
    'UDI',
    'VSM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Prepayment strategy enum
DO $$ BEGIN
  CREATE TYPE prepayment_strategy AS ENUM (
    'reduce_term',
    'reduce_payment'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Debt status enum
DO $$ BEGIN
  CREATE TYPE debt_status AS ENUM (
    'current',
    'late',
    'paid_off'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================
-- 2. DROP OLD DEBTS TABLE IF EXISTS & RENAME ACCOUNTS
-- ============================================

-- Since we're in dev stage, we'll drop and recreate
DROP TABLE IF EXISTS debt_payments CASCADE;
DROP TABLE IF EXISTS debts CASCADE;

-- If accounts table exists, we could migrate data, but for dev we'll just drop it
DROP TABLE IF EXISTS accounts CASCADE;


-- ============================================
-- 3. CREATE NEW DEBTS TABLE
-- ============================================

CREATE TABLE debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  user_id UUID REFERENCES auth.users NOT NULL,
  family_id UUID,
  
  -- Core identification
  debt_type debt_type NOT NULL DEFAULT 'credit_card',
  concept TEXT NOT NULL, -- e.g., "BBVA Platinum", "Hipoteca Santander"
  
  -- Amount tracking
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0, -- Current outstanding
  original_amount NUMERIC(14, 2), -- Original loan amount
  currency_code debt_currency NOT NULL DEFAULT 'MXN',
  
  -- Interest & Tax (Mexican market)
  interest_rate NUMERIC(6, 4) DEFAULT 0, -- Annual % (Tasa Ordinaria)
  iva_rate NUMERIC(4, 2) DEFAULT 16.0, -- 16% standard, 8% border, 0% mortgages
  
  -- Term tracking
  term_months_total INTEGER, -- Total loan duration
  term_months_remaining INTEGER, -- Months left
  
  -- Payment preferences
  prepayment_strategy prepayment_strategy DEFAULT 'reduce_term',
  is_msi BOOLEAN DEFAULT FALSE, -- Meses Sin Intereses
  
  -- Dates
  next_payment_due_date DATE,
  last_payment_date DATE,
  start_date DATE DEFAULT CURRENT_DATE,
  
  -- Status
  status debt_status DEFAULT 'current',
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for family-based queries
CREATE INDEX idx_debts_family_id ON debts(family_id);
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_status ON debts(status);


-- ============================================
-- 4. CREATE DEBT PAYMENTS TABLE (History)
-- ============================================

CREATE TABLE debt_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign key to debt
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  amount_paid NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_extra_payment BOOLEAN DEFAULT FALSE,
  
  -- Optional tracking
  payment_method TEXT, -- 'bank_transfer', 'card', 'cash', etc.
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient queries
CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_date ON debt_payments(date);


-- ============================================
-- 5. ENABLE RLS & CREATE POLICIES
-- ============================================

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Debts policies (family-based)
DROP POLICY IF EXISTS "Family members can access" ON debts;
CREATE POLICY "Family members can access" ON debts
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- Debt payments policies (through debt's family_id)
DROP POLICY IF EXISTS "Family members can access payments" ON debt_payments;
CREATE POLICY "Family members can access payments" ON debt_payments
  FOR ALL
  USING (
    debt_id IN (SELECT id FROM debts WHERE family_id = public.get_user_family_id())
  )
  WITH CHECK (
    debt_id IN (SELECT id FROM debts WHERE family_id = public.get_user_family_id())
  );


-- ============================================
-- 6. TRIGGER FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_debts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS debts_updated_at ON debts;
CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_debts_updated_at();


-- ============================================
-- 7. HELPER: Calculate monthly payment (Amortization)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_monthly_payment(
  principal NUMERIC,
  annual_rate NUMERIC,
  iva_rate NUMERIC,
  term_months INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  monthly_rate NUMERIC;
  effective_rate NUMERIC;
BEGIN
  IF term_months <= 0 OR principal <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate effective rate with IVA on interest
  effective_rate := annual_rate * (1 + (iva_rate / 100));
  monthly_rate := effective_rate / 12 / 100;
  
  IF monthly_rate = 0 THEN
    -- No interest (MSI case)
    RETURN principal / term_months;
  END IF;
  
  -- Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  RETURN principal * (monthly_rate * POWER(1 + monthly_rate, term_months)) 
         / (POWER(1 + monthly_rate, term_months) - 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION calculate_monthly_payment TO authenticated;


-- ============================================
-- 8. DOCUMENTATION
-- ============================================

COMMENT ON TABLE debts IS 'Comprehensive debt tracking for Mexican market. Supports credit cards, mortgages, auto loans, personal loans, and friend loans.';
COMMENT ON COLUMN debts.iva_rate IS 'IVA rate on interest: 16% standard, 8% border zone, 0% for mortgages';
COMMENT ON COLUMN debts.currency_code IS 'MXN, USD, EUR, UDI (Unidad de Inversión), VSM (Veces Salario Mínimo)';
COMMENT ON COLUMN debts.is_msi IS 'True if this is a "Meses Sin Intereses" purchase';
COMMENT ON COLUMN debts.prepayment_strategy IS 'User preference: reduce_term keeps payment same, reduce_payment keeps term same';

COMMENT ON TABLE debt_payments IS 'Payment history for debts. Tracks regular and extra payments.';
COMMENT ON FUNCTION calculate_monthly_payment IS 'Calculates amortized monthly payment including IVA on interest.';
