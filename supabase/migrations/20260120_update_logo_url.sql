-- Migration to update agency logo URL
-- Description: Updates the main agency branding to use the new local logo file
-- Author: Antigravity
-- Date: 2026-01-20

UPDATE agency_settings
SET branding = jsonb_set(
  COALESCE(branding, '{}'::jsonb),
  '{logo_url}',
  '"/logo-eternizar.png"'
)
WHERE id IS NOT NULL; -- Updates all rows, usually there's only one main agency setting or logic might separate by ID.
-- If multi-tenant, this might overwrite others, but usually 'agency_settings' is a singleton or global config in this context. 
-- Based on Navbar.tsx it does .limit(1), so this assumes a single main agency configuration.
