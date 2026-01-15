-- Migration: Add admin_metadata JSONB column to creators table
-- This column stores private admin-only data including pricing, demographics, etc.

-- Add admin_metadata column
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS admin_metadata JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN creators.admin_metadata IS 'Private admin-only metadata: pricing, demographics, audience data. Not visible to creators.';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_creators_admin_metadata ON creators USING gin(admin_metadata);
