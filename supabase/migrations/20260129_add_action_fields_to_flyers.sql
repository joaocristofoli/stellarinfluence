-- Migration: Add action fields to flyer_events and flyer_assignments
-- Date: 2026-01-29
-- Purpose: Support different action types (flyers, stories) and flexible payment models

-- 1. Add fields to flyer_events
ALTER TABLE "public"."flyer_events" 
ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'flyer',
ADD COLUMN IF NOT EXISTS "payment_model" text NOT NULL DEFAULT 'hourly', -- 'hourly' or 'fixed'
ADD COLUMN IF NOT EXISTS "fixed_payment_value" numeric(10,2);

-- Add comment for documentation
COMMENT ON COLUMN "public"."flyer_events"."type" IS 'Type of action: flyer, story, etc.';
COMMENT ON COLUMN "public"."flyer_events"."payment_model" IS 'Payment calculation model: hourly (rate * hours) or fixed (flat fee)';

-- 2. Add fields to flyer_assignments
ALTER TABLE "public"."flyer_assignments"
ADD COLUMN IF NOT EXISTS "payment_amount" numeric(10,2);

-- Add comment
COMMENT ON COLUMN "public"."flyer_assignments"."payment_amount" IS 'Override payment amount for this specific person. If null, uses event default calculation.';
