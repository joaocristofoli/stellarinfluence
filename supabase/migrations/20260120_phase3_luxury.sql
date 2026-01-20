-- Migration: Phase 3 Luxury Features & Architecture Upgrade
-- Description: Adds Company Types (Agency/Client), Granular Financials, and Merge Capabilities.

-- 1. Companies Table: Add 'type' column
-- We use a DO block to safely create the enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_type') THEN
        CREATE TYPE public.company_type AS ENUM ('agency', 'client', 'partner');
    END IF;
END $$;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS type public.company_type NOT NULL DEFAULT 'client';

-- 2. Strategies Table: Add granular financial fields
-- "budget" column remains as the Total (GROSS) value for backward compatibility and ease of query.
-- New columns allow for detailed breakdown.
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS media_budget DECIMAL(10,2) DEFAULT 0, -- The amount that actually goes to media/creator
ADD COLUMN IF NOT EXISTS agency_fee_percentage DECIMAL(5,2) DEFAULT 0, -- e.g., 20.00 for 20%
ADD COLUMN IF NOT EXISTS agency_fee_value DECIMAL(10,2) DEFAULT 0, -- Calculated fee value
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0, -- Tax percentage
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1; -- Optimistic Concurrency Control

-- 3. Merge Creators Function
-- Allows admins to merge a duplicate creator (Source) into a main creator (Target).
CREATE OR REPLACE FUNCTION public.merge_creators(
    target_creator_id UUID,
    source_creator_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- 3.1 Move Strategies
    -- Replace the source_id with target_id in the 'connections' array of strategies
    -- We use array_replace. Note: This might create duplicates in the array if target is already there.
    -- Ideally application logic handles deduping, or we improve this query later.
    UPDATE public.strategies
    SET connections = array_replace(connections, source_creator_id, target_creator_id)
    WHERE source_creator_id = ANY(connections);

    -- 3.2 Soft Delete Source Creator
    -- Mark as deleted and rename slug to free it up
    UPDATE public.creators
    SET
        deleted_at = now(),
        approval_status = 'rejected', -- Mark as rejected/merged
        admin_metadata = jsonb_set(
            COALESCE(admin_metadata, '{}'::jsonb),
            '{merged_into}',
            to_jsonb(target_creator_id)
        ),
        -- Append random string to slug to allow reuse of original slug if needed, 
        -- or just to prevent unique constraint collisions with the living profile if user tries to recreate.
        slug = slug || '_merged_' || substring(md5(random()::text) from 1 for 6)
    WHERE id = source_creator_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
