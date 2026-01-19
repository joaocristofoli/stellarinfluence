-- Migration: Add hide_financials column to shared_plans
-- Purpose: Server-side control for hiding financial data in client portal

-- Add the hide_financials column
ALTER TABLE shared_plans
ADD COLUMN IF NOT EXISTS hide_financials BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN shared_plans.hide_financials IS 
'When TRUE, financial data (budget, pricing) is filtered server-side before sending to client portal';
