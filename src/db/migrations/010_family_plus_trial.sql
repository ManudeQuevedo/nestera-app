-- Family OS Configurator: Schema + 30-day Trial
-- This migration adds config flags and updates trial defaults

-- 1. Add Family OS Config Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS family_mode TEXT DEFAULT 'solo', -- 'solo', 'partner', 'family'
ADD COLUMN IF NOT EXISTS income_frequency TEXT DEFAULT 'monthly', -- 'monthly', 'biweekly', 'variable'
ADD COLUMN IF NOT EXISTS cash_usage_level INT DEFAULT 0, -- 0-100 percentage
ADD COLUMN IF NOT EXISTS has_debts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_school_expenses BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ant_expense_vices TEXT[] DEFAULT '{}', -- Array of vice strings
ADD COLUMN IF NOT EXISTS enable_cash_wallet BOOLEAN DEFAULT FALSE;

-- 2. Update default plan tier to family_plus
ALTER TABLE public.profiles 
ALTER COLUMN plan_tier SET DEFAULT 'family_plus';

-- 3. Create function to auto-set trial end date (30 DAYS) for new users
CREATE OR REPLACE FUNCTION set_trial_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set trial_ends_at if creating new user with family_plus plan and no trial date
  IF NEW.trial_ends_at IS NULL AND (NEW.plan_tier = 'family_plus' OR NEW.plan_tier IS NULL) THEN
    NEW.trial_ends_at := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS set_default_trial ON public.profiles;

-- 5. Create trigger for new profile inserts
CREATE TRIGGER set_default_trial
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_end_date();

-- Note: To test, you can update an existing profile:
-- UPDATE public.profiles 
-- SET plan_tier = 'family_plus', trial_ends_at = NOW() + INTERVAL '30 days'
-- WHERE id = 'your-user-id';

