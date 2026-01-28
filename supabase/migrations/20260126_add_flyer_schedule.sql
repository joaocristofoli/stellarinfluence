-- Migration: Add flyer_schedule JSONB column to strategies table
-- This column stores time slots for panfletagem (flyering) strategies

ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS flyer_schedule JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN strategies.flyer_schedule IS 'Time slots for panfletagem with assignees: [{id, startTime, endTime, location, assignees[], notes}]';
