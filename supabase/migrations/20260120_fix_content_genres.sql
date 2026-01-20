-- =====================================================
-- FIX: Ensure content_genres column exists
-- This migration ensures all enhanced fields exist
-- =====================================================

-- Add content_genres if missing (the main bug)
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS content_genres TEXT[];

-- Also ensure other commonly-used fields exist
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS music_preferences TEXT[],
ADD COLUMN IF NOT EXISTS profile_type TEXT,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN creators.content_genres IS 'Array of content types: lifestyle, travel, fitness, fashion, beauty, tech, gaming, food, etc';
