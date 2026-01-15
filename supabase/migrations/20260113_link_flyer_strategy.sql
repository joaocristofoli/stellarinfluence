-- Migration: Link Flyer Campaigns to Marketing Strategies
-- This adds a foreign key to connect flyer campaigns with strategies

-- Add column to link flyer campaigns with marketing strategies
ALTER TABLE flyer_campaigns 
ADD COLUMN IF NOT EXISTS linked_strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flyer_campaigns_strategy 
ON flyer_campaigns(linked_strategy_id);

-- Comment explaining the relationship
COMMENT ON COLUMN flyer_campaigns.linked_strategy_id IS 
'Links this flyer campaign to a marketing strategy of type "flyers" in the strategies table';
