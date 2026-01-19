-- 20260119_enhance_creators_schema.sql

-- 1. Approval Workflow
ALTER TABLE creators ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE creators ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 2. Agency/Parent Linking
-- agency_id references the companies table (assuming agencies are stored there)
-- This assumes companies table exists (created in 20260119_create_companies_table.sql)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS agency_id UUID; 
-- We add the FK constraint safely in a separate block or verify table existence first, 
-- but strictly speaking standard migration order handles this.
-- ALTER TABLE creators ADD CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES companies(id);

ALTER TABLE creators ADD COLUMN IF NOT EXISTS parent_creator_id UUID REFERENCES creators(id);

-- 3. Unique Constraints
-- We use a partial index to ignore null/empty values and enforce case-insensitive uniqueness
DROP INDEX IF EXISTS idx_creators_instagram_unique;
CREATE UNIQUE INDEX idx_creators_instagram_unique ON creators (LOWER(instagram_url)) WHERE instagram_url IS NOT NULL AND instagram_url != '';

DROP INDEX IF EXISTS idx_creators_slug_unique;
CREATE UNIQUE INDEX idx_creators_slug_unique ON creators (LOWER(slug));

-- 4. Metadata Indexing (Optional but good for JSONB performance if searched)
CREATE INDEX IF NOT EXISTS idx_creators_admin_metadata ON creators USING gin (admin_metadata);

-- 5. Outdoor/BTL Exclusive Fields (Premium Agency Request)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS outdoor_face TEXT; -- 'A', 'B', etc.
ALTER TABLE creators ADD COLUMN IF NOT EXISTS outdoor_lighting BOOLEAN DEFAULT FALSE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS min_period TEXT; -- 'Bi-semana', 'Mensal'
ALTER TABLE creators ADD COLUMN IF NOT EXISTS gps_coordinates TEXT; -- 'lat,long' or failure
