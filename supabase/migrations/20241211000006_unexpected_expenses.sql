-- Add unexpected expense tracking columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_unexpected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS covered_by_emergency_fund boolean DEFAULT false;

-- Add Medical & Health category if not exists (check by name first)
-- Add Medical & Health category if not exists (check by name first)
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Medical & Health') THEN
--     INSERT INTO categories (id, name, icon, type, budget_limit)
--     VALUES (
--       gen_random_uuid(),
--       'Medical & Health',
--       'Activity',
--       'expense',
--       500
--     );
--   END IF;
-- END $$;

-- Create index for unexpected expenses queries
CREATE INDEX IF NOT EXISTS idx_transactions_unexpected ON transactions(is_unexpected) WHERE is_unexpected = true;
