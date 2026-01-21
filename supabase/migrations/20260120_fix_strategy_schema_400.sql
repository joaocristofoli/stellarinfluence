-- Fix 400 Bad Request by ensuring all new columns exist
ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS media_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS agency_fee_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.strategies.deliverables IS 'List of creators and formats in the cart';
COMMENT ON COLUMN public.strategies.media_budget IS 'Calculated media budget (total - fee - tax)';
