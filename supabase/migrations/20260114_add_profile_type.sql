-- Migration: Add profile type and extra fields to creators
-- This enables the multi-profile system (influencer, press, tv, etc)

-- Add profile_type column
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'influencer';

-- Add extra fields for different profile types
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS program_name TEXT,
ADD COLUMN IF NOT EXISTS reach TEXT;

-- Add comment for documentation
COMMENT ON COLUMN creators.profile_type IS 'Type of profile: influencer, press, tv, celebrity, gossip, podcast, other';
COMMENT ON COLUMN creators.company IS 'Company/Media outlet name for press/tv profiles';
COMMENT ON COLUMN creators.program_name IS 'Program/Column/Podcast name';
COMMENT ON COLUMN creators.reach IS 'Audience reach/downloads';

-- Create index for profile type filtering
CREATE INDEX IF NOT EXISTS idx_creators_profile_type ON creators(profile_type);
