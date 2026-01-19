-- Migration to add creator_snapshots to marketing_strategies for price freezing
-- This accepts a JSONB object mapping creator_id -> { price_snapshot: number, date: string, ... }

ALTER TABLE marketing_strategies 
ADD COLUMN IF NOT EXISTS creator_snapshots JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN marketing_strategies.creator_snapshots IS 'Stores frozen pricing/metadata for creators at the time of linking. Format: { "creator_uuid": { "price": 1000, "followers": "10k" } }';
