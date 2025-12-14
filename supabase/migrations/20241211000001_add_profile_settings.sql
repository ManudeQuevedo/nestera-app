-- Add settings columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency_preference text DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light';

-- Add check constraint for valid currencies
ALTER TABLE profiles ADD CONSTRAINT valid_currency 
  CHECK (currency_preference IN ('USD', 'MXN', 'EUR'));

-- Add check constraint for valid themes  
ALTER TABLE profiles ADD CONSTRAINT valid_theme
  CHECK (theme IN ('light', 'dark', 'system'));
