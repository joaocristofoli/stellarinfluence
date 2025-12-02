ALTER TABLE creators ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
