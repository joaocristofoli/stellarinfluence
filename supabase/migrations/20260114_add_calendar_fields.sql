-- Migration: Add date fields and linked creators to marketing_strategies
-- This enables the Campaign Calendar feature with influencer linkage

-- Add start_date and end_date columns
ALTER TABLE marketing_strategies
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add linked_creator_ids for multi-influencer support
ALTER TABLE marketing_strategies
ADD COLUMN IF NOT EXISTS linked_creator_ids UUID[] DEFAULT '{}';

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_dates 
ON marketing_strategies(start_date, end_date);

-- Create index for creator lookups
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_creators 
ON marketing_strategies USING GIN(linked_creator_ids);

-- Comment on columns
COMMENT ON COLUMN marketing_strategies.start_date IS 'Start date for the marketing strategy';
COMMENT ON COLUMN marketing_strategies.end_date IS 'End date for the marketing strategy';
COMMENT ON COLUMN marketing_strategies.linked_creator_ids IS 'Array of creator IDs linked to this strategy for influencer campaigns';
