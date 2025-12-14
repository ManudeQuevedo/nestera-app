-- Migration: Mexican Finance Tracker Schema
-- Purpose: Complete schema for Mexican market compliance
-- Includes: Enhanced debts, assets, income_streams, profile compliance fields

-- ============================================
-- 1. ADDITIONAL ENUM TYPES
-- ============================================

-- Debt type (updated)
DO $$ BEGIN
  CREATE TYPE debt_type_v2 AS ENUM (
    'credit_card',
    'mortgage',
    'personal_loan',
    'auto_loan',
    'msi_balance'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Asset type
DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM (
    'real_estate',
    'vehicle',
    'investment',
    'savings',
    'crypto',
    'business',
    'collectible',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Income frequency
DO $$ BEGIN
  CREATE TYPE income_frequency AS ENUM (
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'annually',
    'irregular'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Mexican tax regime (SAT classifications)
DO $$ BEGIN
  CREATE TYPE tax_regime AS ENUM (
    'sueldos',           -- Sueldos y Salarios (empleado)
    'resico',            -- Régimen Simplificado de Confianza
    'pfae',              -- Persona Física con Actividad Empresarial
    'arrendamiento',     -- Arrendamiento (renta de inmuebles)
    'dividendos',        -- Dividendos
    'intereses',         -- Intereses
    'plataformas'        -- Plataformas Digitales
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Fiscal zone (determines IVA)
DO $$ BEGIN
  CREATE TYPE fiscal_zone AS ENUM (
    'standard',          -- 16% IVA
    'border_north',      -- 8% IVA (Zona Norte)
    'border_south'       -- 8% IVA (Zona Sur)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Amortization strategy
DO $$ BEGIN
  CREATE TYPE amortization_strategy AS ENUM (
    'reduce_term',
    'reduce_payment'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================
-- 2. UPDATE DEBTS TABLE (Add Mexican-specific fields)
-- ============================================

-- Add new columns if they don't exist
ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_rate_ordinaria NUMERIC(6, 4);
ALTER TABLE debts ADD COLUMN IF NOT EXISTS cat_val NUMERIC(6, 4); -- CAT %
ALTER TABLE debts ADD COLUMN IF NOT EXISTS amortization_strategy TEXT DEFAULT 'reduce_term';

-- Migrate interest_rate to interest_rate_ordinaria if needed
UPDATE debts 
SET interest_rate_ordinaria = interest_rate 
WHERE interest_rate_ordinaria IS NULL AND interest_rate IS NOT NULL;

-- Comments
COMMENT ON COLUMN debts.interest_rate_ordinaria IS 'Tasa de interés ordinaria anual (base rate before IVA)';
COMMENT ON COLUMN debts.cat_val IS 'Costo Anual Total (CAT) - for display/warning purposes only';
COMMENT ON COLUMN debts.amortization_strategy IS 'Strategy for extra payments: reduce_term or reduce_payment';


-- ============================================
-- 3. CREATE ASSETS TABLE (Activos)
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  user_id UUID REFERENCES auth.users NOT NULL,
  family_id UUID,
  
  -- Core fields
  name TEXT NOT NULL,
  asset_type asset_type NOT NULL DEFAULT 'other',
  
  -- Valuation
  valuation_mxn NUMERIC(14, 2) NOT NULL DEFAULT 0,
  acquisition_cost NUMERIC(14, 2),
  acquisition_date DATE,
  currency_code TEXT DEFAULT 'MXN',
  
  -- Depreciation (for vehicles, equipment, etc.)
  is_depreciating BOOLEAN DEFAULT FALSE,
  depreciation_rate NUMERIC(5, 2), -- Annual % depreciation
  useful_life_years INTEGER, -- For straight-line depreciation
  
  -- Classification
  is_liquid BOOLEAN DEFAULT FALSE, -- Can be easily converted to cash
  is_income_generating BOOLEAN DEFAULT FALSE, -- Generates income (rental, dividends)
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_family_id ON assets(family_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);


-- ============================================
-- 4. CREATE INCOME_STREAMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS income_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  user_id UUID REFERENCES auth.users NOT NULL,
  family_id UUID,
  
  -- Core fields
  name TEXT NOT NULL, -- e.g., "Salary - Company X", "Rental - Property Y"
  amount NUMERIC(14, 2) NOT NULL,
  currency_code TEXT DEFAULT 'MXN',
  frequency income_frequency NOT NULL DEFAULT 'monthly',
  
  -- Tax classification (SAT)
  tax_regime tax_regime NOT NULL DEFAULT 'sueldos',
  withholding_rate NUMERIC(5, 2), -- ISR retention %
  is_tax_exempt BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL = ongoing
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_income_streams_family_id ON income_streams(family_id);
CREATE INDEX IF NOT EXISTS idx_income_streams_user_id ON income_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_income_streams_regime ON income_streams(tax_regime);


-- ============================================
-- 5. UPDATE PROFILES TABLE (Compliance Fields)
-- ============================================

-- Add fiscal zone
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fiscal_zone TEXT DEFAULT 'standard';

-- Add privacy consent timestamp (LFPDPPP compliance)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Add tax identification (RFC)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rfc TEXT;

-- Comments
COMMENT ON COLUMN profiles.fiscal_zone IS 'Mexican fiscal zone: standard (16% IVA), border_north (8% IVA), border_south (8% IVA)';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp of privacy policy acceptance (LFPDPPP compliance)';
COMMENT ON COLUMN profiles.rfc IS 'Registro Federal de Contribuyentes (optional)';


-- ============================================
-- 6. RLS POLICIES FOR NEW TABLES
-- ============================================

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_streams ENABLE ROW LEVEL SECURITY;

-- Assets policies
DROP POLICY IF EXISTS "Family members can access" ON assets;
CREATE POLICY "Family members can access" ON assets
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());

-- Income streams policies
DROP POLICY IF EXISTS "Family members can access" ON income_streams;
CREATE POLICY "Family members can access" ON income_streams
  FOR ALL
  USING (family_id = public.get_user_family_id())
  WITH CHECK (family_id = public.get_user_family_id());


-- ============================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================

-- Assets trigger
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assets_updated_at ON assets;
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- Income streams trigger
CREATE OR REPLACE FUNCTION update_income_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS income_streams_updated_at ON income_streams;
CREATE TRIGGER income_streams_updated_at
  BEFORE UPDATE ON income_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_income_streams_updated_at();


-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Get user's default IVA based on fiscal zone
CREATE OR REPLACE FUNCTION public.get_user_iva_rate()
RETURNS NUMERIC AS $$
DECLARE
  zone TEXT;
BEGIN
  SELECT fiscal_zone INTO zone 
  FROM profiles 
  WHERE id = auth.uid();
  
  IF zone IN ('border_north', 'border_south') THEN
    RETURN 8.0;
  ELSE
    RETURN 16.0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_iva_rate() TO authenticated;

-- Calculate net worth (assets - debts)
CREATE OR REPLACE FUNCTION public.calculate_net_worth(p_family_id UUID)
RETURNS TABLE(
  total_assets NUMERIC,
  total_debts NUMERIC,
  net_worth NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT SUM(valuation_mxn) FROM assets WHERE family_id = p_family_id), 0) as total_assets,
    COALESCE((SELECT SUM(balance) FROM debts WHERE family_id = p_family_id AND status != 'paid_off'), 0) as total_debts,
    COALESCE((SELECT SUM(valuation_mxn) FROM assets WHERE family_id = p_family_id), 0) -
    COALESCE((SELECT SUM(balance) FROM debts WHERE family_id = p_family_id AND status != 'paid_off'), 0) as net_worth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.calculate_net_worth(UUID) TO authenticated;

-- Calculate monthly income
CREATE OR REPLACE FUNCTION public.calculate_monthly_income(p_family_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC := 0;
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT amount, frequency 
    FROM income_streams 
    WHERE family_id = p_family_id AND is_active = TRUE
  LOOP
    CASE rec.frequency
      WHEN 'weekly' THEN total := total + (rec.amount * 4.33);
      WHEN 'biweekly' THEN total := total + (rec.amount * 2.17);
      WHEN 'monthly' THEN total := total + rec.amount;
      WHEN 'quarterly' THEN total := total + (rec.amount / 3);
      WHEN 'annually' THEN total := total + (rec.amount / 12);
      ELSE total := total + rec.amount; -- irregular defaults to monthly
    END CASE;
  END LOOP;
  
  RETURN ROUND(total, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.calculate_monthly_income(UUID) TO authenticated;


-- ============================================
-- 9. DOCUMENTATION
-- ============================================

COMMENT ON TABLE assets IS 'User assets (activos) with valuation and depreciation tracking for Mexican tax compliance';
COMMENT ON TABLE income_streams IS 'Income sources with SAT tax regime classification for Mexican tax planning';
COMMENT ON FUNCTION public.get_user_iva_rate() IS 'Returns IVA rate based on user fiscal zone (16% standard, 8% border)';
COMMENT ON FUNCTION public.calculate_net_worth(UUID) IS 'Calculates total assets minus total debts for a family';
COMMENT ON FUNCTION public.calculate_monthly_income(UUID) IS 'Calculates normalized monthly income from all active income streams';
