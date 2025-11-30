-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    platform text PRIMARY KEY,
    icon_url text,
    bg_color text,
    is_transparent boolean DEFAULT false,
    use_theme_color boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read (needed for landing pages)
CREATE POLICY "Everyone can read platform settings" ON public.platform_settings
    FOR SELECT
    USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL
    USING (public.is_admin());

-- Insert default rows for supported platforms
INSERT INTO public.platform_settings (platform, use_theme_color)
VALUES 
    ('instagram', true),
    ('youtube', true),
    ('tiktok', true),
    ('twitter', true),
    ('kwai', true)
ON CONFLICT (platform) DO NOTHING;
