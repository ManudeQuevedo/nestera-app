-- Add language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'es'));

-- Comment on column
COMMENT ON COLUMN profiles.language IS 'Preferred application language (en/es)';
