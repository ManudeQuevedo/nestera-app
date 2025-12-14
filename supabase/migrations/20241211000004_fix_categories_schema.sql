-- Migration to fix categories table schema
-- The remote database has different columns than expected

-- Add missing columns if they don't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS budget_limit numeric(12,2) DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;

-- If icon_name exists but icon doesn't, copy data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon_name') THEN
        EXECUTE 'UPDATE categories SET icon = icon_name WHERE icon IS NULL AND icon_name IS NOT NULL';
    END IF;
END $$;

-- Set default type for categories based on name
UPDATE categories SET type = 'expense' WHERE type IS NULL AND name NOT IN ('Salary', 'Income', 'Freelance');
UPDATE categories SET type = 'income' WHERE type IS NULL AND name IN ('Salary', 'Income', 'Freelance');

-- Set default budget limits for expense categories
UPDATE categories SET budget_limit = 500 WHERE budget_limit IS NULL OR budget_limit = 0;

-- Add check constraint for type if not exists
DO $$
BEGIN
    ALTER TABLE categories ADD CONSTRAINT categories_type_check CHECK (type IN ('income', 'expense'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
