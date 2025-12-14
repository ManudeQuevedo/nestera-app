-- Add currency column to daily_receipts
-- Migration: Support multi-currency for ant expenses

-- Create currency enum type
DO $$ BEGIN
  CREATE TYPE expense_currency AS ENUM ('USD', 'MXN', 'EUR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add currency column with default MXN
ALTER TABLE daily_receipts 
ADD COLUMN IF NOT EXISTS currency expense_currency NOT NULL DEFAULT 'MXN';
