-- Change default language column to Spanish
ALTER TABLE profiles 
ALTER COLUMN language SET DEFAULT 'es';

-- Update existing profiles that have the old default
UPDATE profiles SET language = 'es' WHERE language = 'en' OR language IS NULL;
