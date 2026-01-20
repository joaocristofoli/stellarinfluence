-- Migration: Add deliverables JSONB column to strategies table for Cart Architecture
-- This allows storing granular line items (Creator + Format + Price) for each strategy.

ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.strategies.deliverables IS 'Array of objects: [{ creator_id: UUID, format: string, price: number, date?: string }]';
