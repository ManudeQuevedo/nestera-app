-- DANGER ZONE: SUPER NUCLEAR RESET
-- This will wipe ALL user data, users, and MFA factors.
-- Run this in the Supabase SQL Editor when you need a complete fresh start.

-- ============================================================
-- PART 1: Delete MFA Data FIRST (to prevent cascade issues)
-- ============================================================

-- Delete MFA challenges (must be deleted before mfa_factors)
DELETE FROM auth.mfa_challenges;

-- Delete MFA factors (enrollment records)
DELETE FROM auth.mfa_factors;

-- Delete MFA AMRA (Authenticator Management Record Association) if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'mfa_amr_claims') THEN
    DELETE FROM auth.mfa_amr_claims;
  END IF;
END $$;

-- ============================================================
-- PART 2: Truncate ALL public data tables
-- ============================================================

TRUNCATE TABLE 
  public.daily_receipts,
  public.debts,
  public.transactions,
  public.goals,
  public.budgets,
  public.categories,
  public.bank_statements,
  public.profiles
  -- Add any other tables here if needed:
  -- public.investments,
  -- public.subscriptions
  RESTART IDENTITY 
  CASCADE;

-- ============================================================
-- PART 3: Delete users (now safe because all FKs are cleared)
-- ============================================================

-- Delete user identities first (social logins)
DELETE FROM auth.identities;

-- Delete user sessions
DELETE FROM auth.sessions;

-- Delete refresh tokens
DELETE FROM auth.refresh_tokens;

-- Finally, delete users
DELETE FROM auth.users;

-- ============================================================
-- CONFIRMATION
-- ============================================================

SELECT 
  'WIPE COMPLETE' as status,
  (SELECT COUNT(*) FROM auth.users) as remaining_users,
  (SELECT COUNT(*) FROM auth.mfa_factors) as remaining_mfa_factors,
  (SELECT COUNT(*) FROM public.profiles) as remaining_profiles;
