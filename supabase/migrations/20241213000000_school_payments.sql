-- JFK School Payments Module
-- Migration: Create school_payments table and storage bucket


-- Create payment category enum type
DO $$ BEGIN
  CREATE TYPE school_payment_category AS ENUM (
    'Tuition',
    'Extra Curricular', 
    'Events',
    'Uniforms',
    'Books',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- School Payments table
CREATE TABLE IF NOT EXISTS school_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  amount numeric(12,2) NOT NULL,
  concept text NOT NULL,
  category school_payment_category NOT NULL DEFAULT 'Other',
  receipt_url text, -- Supabase Storage path
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS school_payments_user_id_idx ON school_payments(user_id);
CREATE INDEX IF NOT EXISTS school_payments_date_idx ON school_payments(date DESC);

-- Enable RLS
ALTER TABLE school_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own school payments" 
  ON school_payments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own school payments" 
  ON school_payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own school payments" 
  ON school_payments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own school payments" 
  ON school_payments FOR DELETE 
  USING (auth.uid() = user_id);

-- Storage Bucket for Receipts
-- Note: Run this in Supabase Dashboard SQL editor or via Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('school-receipts', 'school-receipts', true);

-- Storage RLS Policies (run in Supabase Dashboard)
-- Allow authenticated users to upload their own receipts
-- CREATE POLICY "Users can upload receipts" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'school-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own receipts
-- CREATE POLICY "Users can view own receipts" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'school-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own receipts
-- CREATE POLICY "Users can delete own receipts" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'school-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_school_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS school_payments_updated_at ON school_payments;
CREATE TRIGGER school_payments_updated_at
  BEFORE UPDATE ON school_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_school_payments_updated_at();
