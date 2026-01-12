-- EMERGENCY FIX: Create missing tables and RPC function
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Fix Admin RPC (Critical for Login)
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO service_role;

-- 2. Create Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    platform text PRIMARY KEY,
    icon_url text,
    bg_color text,
    is_transparent boolean DEFAULT false,
    use_theme_color boolean DEFAULT false,
    base_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Create Agency Settings Table
CREATE TABLE IF NOT EXISTS public.agency_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    branding jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read access" ON public.platform_settings;
CREATE POLICY "Public read access" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update" ON public.platform_settings;
CREATE POLICY "Admins can update" ON public.platform_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read access" ON public.agency_settings;
CREATE POLICY "Public read access" ON public.agency_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update" ON public.agency_settings;
CREATE POLICY "Admins can update" ON public.agency_settings FOR ALL USING (public.is_admin());

-- 6. Insert Default Data (To fix 404s on select)
INSERT INTO public.platform_settings (platform, bg_color, is_transparent)
VALUES 
  ('instagram', '#E1306C', false),
  ('tiktok', '#000000', false),
  ('youtube', '#FF0000', false),
  ('twitter', '#1DA1F2', false),
  ('kwai', '#FF8F00', false)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO public.agency_settings (id, branding)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '{"agency_name": "Stellar Influence", "primary_color": "#7c3aed", "secondary_color": "#a78bfa"}'::jsonb
)
ON CONFLICT DO NOTHING;
