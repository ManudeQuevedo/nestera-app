-- Migration 006: Functional Bank Uploader Infrastructure
-- Adds event/goal linking to transactions and temp_imports bucket setup

-- ============================================================
-- PART 1: TRANSACTIONS UPDATE (Event & Goal Linking)
-- ============================================================

-- Add event_id foreign key to transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Add goal_id foreign key to transactions  
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON public.transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON public.transactions(goal_id);

-- ============================================================
-- PART 2: STORAGE BUCKET (Run in Supabase Dashboard > Storage)
-- ============================================================

-- NOTE: Bucket creation must be done via Supabase Dashboard or API
-- Go to Storage > Create new bucket:
--   Name: temp_imports
--   Public: OFF (private)
--   File size limit: 5MB
--   Allowed MIME types: application/pdf, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- RLS Policies for temp_imports bucket (run after creating bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('temp_imports', 'temp_imports', false);

-- Storage policies (run in SQL editor after bucket exists)
-- DROP POLICY IF EXISTS "Users can upload to temp_imports" ON storage.objects;
-- CREATE POLICY "Users can upload to temp_imports"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'temp_imports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DROP POLICY IF EXISTS "Users can view own temp_imports" ON storage.objects;
-- CREATE POLICY "Users can view own temp_imports"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'temp_imports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DROP POLICY IF EXISTS "Users can delete own temp_imports" ON storage.objects;
-- CREATE POLICY "Users can delete own temp_imports"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'temp_imports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- PART 3: CONFIRMATION
-- ============================================================

SELECT 'Migration 006 Complete (Transaction Linking)' as status;
