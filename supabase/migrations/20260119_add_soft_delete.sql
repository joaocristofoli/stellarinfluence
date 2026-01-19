-- ============================================
-- Migration: Add soft delete support to creators table
-- Date: 2026-01-19
-- Description: Adds deleted_at column for soft delete pattern
-- ============================================

-- Add deleted_at column for soft delete
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for efficient querying of non-deleted records
CREATE INDEX IF NOT EXISTS idx_creators_deleted_at 
ON creators(deleted_at);

-- Add comment for documentation
COMMENT ON COLUMN creators.deleted_at IS 
'Soft delete timestamp. NULL = active, TIMESTAMP = deleted (can be restored within undo window)';

-- ============================================
-- Verification query (run after migration)
-- ============================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'creators' AND column_name = 'deleted_at';
