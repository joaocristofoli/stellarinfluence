-- Create agency_settings table for agency-wide branding
CREATE TABLE IF NOT EXISTS public.agency_settings (
    key text PRIMARY KEY,
    value jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read (needed for public sites)
CREATE POLICY "Everyone can read agency settings" ON public.agency_settings
    FOR SELECT
    USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage agency settings" ON public.agency_settings
    FOR ALL
    USING (public.is_admin());

-- Insert default branding settings
INSERT INTO public.agency_settings (key, value)
VALUES 
    ('branding', jsonb_build_object(
        'logo_url', null,
        'agency_name', 'AGENCY',
        'primary_color', '#FF6B35',
        'secondary_color', '#004E89'
    ))
ON CONFLICT (key) DO NOTHING;
