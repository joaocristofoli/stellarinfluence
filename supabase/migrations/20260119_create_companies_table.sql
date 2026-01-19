-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'agency', -- 'agency', 'client', 'partner'
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policies (Adjust as needed, simplifying for Admin usage)
CREATE POLICY "Allow read for authenticated users" ON companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON companies FOR ALL USING (auth.role() = 'authenticated');

-- Now we can safely add the foreign key reference if it wasn't added yet
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creators' AND column_name = 'agency_id') THEN
    ALTER TABLE creators ADD COLUMN agency_id UUID REFERENCES companies(id);
  END IF;
END $$;
