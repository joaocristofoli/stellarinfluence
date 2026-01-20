-- Migration: Add missing columns for Calendar & Ghost Mode
-- Created as part of Phase 23/24 "Carrasco War Plan"

DO $$
BEGIN
    -- 1. Calendar Dates (Essentials)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'start_date') THEN
        ALTER TABLE public.strategies ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'end_date') THEN
        ALTER TABLE public.strategies ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- 2. Ghost Mode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'is_draft') THEN
        ALTER TABLE public.strategies ADD COLUMN is_draft BOOLEAN DEFAULT false;
    END IF;

    -- 3. Content Format (Story, Reels, etc for Auto-Pricing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'content_format') THEN
        ALTER TABLE public.strategies ADD COLUMN content_format TEXT;
    END IF;

    -- 4. Multi-Creator Linking (Formal Array)
    -- 'connections' was the legacy field, now we specifically want to track creators for pricing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'linked_creator_ids') THEN
        ALTER TABLE public.strategies ADD COLUMN linked_creator_ids UUID[] DEFAULT '{}';
    END IF;

    -- 5. Helper Indexes
    CREATE INDEX IF NOT EXISTS idx_strategies_dates ON public.strategies(start_date, end_date);
END $$;
