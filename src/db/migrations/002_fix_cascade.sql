-- Fix User Deletion Constraint
-- Use this if you are getting errors deleting users for testing.

-- 1. Drop the strict constraint on daily_receipts
ALTER TABLE public.daily_receipts
DROP CONSTRAINT IF EXISTS daily_receipts_user_id_fkey;

-- 2. Re-add it with ON DELETE CASCADE
ALTER TABLE public.daily_receipts
ADD CONSTRAINT daily_receipts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Repeat for other tables if necessary (e.g. transactions, debts)
-- Example for transactions (if needed later)
-- ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
-- ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
