-- Add admin-only metadata fields to creators table
-- These fields are only visible and editable by admins for internal filtering and research
-- Creators will have no knowledge of or access to this data

ALTER TABLE creators ADD COLUMN IF NOT EXISTS admin_metadata JSONB DEFAULT '{}'::jsonb;

-- Create GIN index for efficient JSONB queries and filtering
CREATE INDEX IF NOT EXISTS idx_creators_admin_metadata ON creators USING GIN (admin_metadata);

-- Add documentation comment
COMMENT ON COLUMN creators.admin_metadata IS 'Admin-only metadata for internal filtering and research. Contains fields like sexual orientation, betting promotion history, age, audience demographics, and ideology. Not visible to creators.';
