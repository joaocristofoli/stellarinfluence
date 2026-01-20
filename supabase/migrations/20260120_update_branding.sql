-- Update Agency Branding (Singleton Pattern)
-- Using standard PostgreSQL JSONB concatenation operator ||

-- First, try to update the existing row
UPDATE public.agency_settings
SET branding = COALESCE(branding, '{}'::jsonb) || '{
    "agency_name": "Agência Eternizar",
    "logo_url": "/logo-eternizar.png",
    "logo_position": "left",
    "logo_height_desktop": 45,
    "logo_margin_top": 0
  }'::jsonb;

-- If no row exists, insert one
INSERT INTO public.agency_settings (branding)
SELECT '{
    "agency_name": "Agência Eternizar",
    "logo_url": "/logo-eternizar.png",
    "logo_position": "left",
    "logo_height_desktop": 45,
    "logo_margin_top": 0,
    "primary_color": "#FF6B35",
    "secondary_color": "#004E89"
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.agency_settings);
