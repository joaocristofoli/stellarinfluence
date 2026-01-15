-- Migration: Add missing columns to creators table
-- This adds all columns that may be missing from the schema

-- Background and gallery
ALTER TABLE creators ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];

-- Primary platform selection
ALTER TABLE creators ADD COLUMN IF NOT EXISTS primary_platform TEXT;

-- Phone number
ALTER TABLE creators ADD COLUMN IF NOT EXISTS phone TEXT;

-- Stories views
ALTER TABLE creators ADD COLUMN IF NOT EXISTS stories_views INTEGER;

-- Layout customization
ALTER TABLE creators ADD COLUMN IF NOT EXISTS layout TEXT DEFAULT 'default';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#FF6B35';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT DEFAULT '#004E89';

-- Kwai support
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_active BOOLEAN DEFAULT false;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS kwai_followers INTEGER;

-- Profile type and extra fields (may have been added in previous migration)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'influencer';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS reach TEXT;

-- Admin metadata (JSONB for flexible storage)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS admin_metadata JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN creators.background_image_url IS 'Background image for creator profile page';
COMMENT ON COLUMN creators.gallery_urls IS 'Array of gallery image URLs (up to 6)';
COMMENT ON COLUMN creators.primary_platform IS 'Main social network platform';
COMMENT ON COLUMN creators.admin_metadata IS 'Private admin data: pricing, demographics, audience info';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_creators_profile_type ON creators(profile_type);
CREATE INDEX IF NOT EXISTS idx_creators_primary_platform ON creators(primary_platform);
CREATE INDEX IF NOT EXISTS idx_creators_admin_metadata ON creators USING gin(admin_metadata);
