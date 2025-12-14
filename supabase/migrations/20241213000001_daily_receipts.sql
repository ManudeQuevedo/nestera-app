-- Daily Receipts / Ant Expenses Module
-- Migration: Create daily_receipts table

-- Create category enum type
DO $$ BEGIN
  CREATE TYPE ant_expense_category AS ENUM (
    'Coffee',
    'Snack',
    'Social',
    'Impulse',
    'Subscription',
    'Delivery',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Daily Receipts table
CREATE TABLE IF NOT EXISTS daily_receipts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric(12,2) NOT NULL,
  category ant_expense_category NOT NULL DEFAULT 'Other',
  is_necessary boolean NOT NULL DEFAULT false,
  context_tag text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS daily_receipts_user_id_idx ON daily_receipts(user_id);
CREATE INDEX IF NOT EXISTS daily_receipts_date_idx ON daily_receipts(date DESC);
CREATE INDEX IF NOT EXISTS daily_receipts_is_necessary_idx ON daily_receipts(is_necessary);

-- Enable RLS
ALTER TABLE daily_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily receipts" 
  ON daily_receipts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily receipts" 
  ON daily_receipts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily receipts" 
  ON daily_receipts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily receipts" 
  ON daily_receipts FOR DELETE 
  USING (auth.uid() = user_id);
