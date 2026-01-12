-- EMERGENCY FIX V2: COMPLETE ADMIN REPAIR
-- Includes 'is_admin()' which was missing and causing the previous error.

-- 1. Create 'is_admin()' (Missing function causing the error)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Create 'is_user_admin(id)' (Used by frontend)
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

-- Grant permissions for both
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO service_role;

-- 3. Create Tables (If failed previously)
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

CREATE TABLE IF NOT EXISTS public.agency_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    branding jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Apply Policies (Now safe because is_admin exists)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.platform_settings;
CREATE POLICY "Public read access" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update" ON public.platform_settings;
-- This line caused the error before because is_admin didn't exist
CREATE POLICY "Admins can update" ON public.platform_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read access" ON public.agency_settings;
CREATE POLICY "Public read access" ON public.agency_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update" ON public.agency_settings;
CREATE POLICY "Admins can update" ON public.agency_settings FOR ALL USING (public.is_admin());

-- 5. Insert Default Data
INSERT INTO public.platform_settings (platform, bg_color, is_transparent)
VALUES 
  ('instagram', '#E1306C', false),
  ('tiktok', '#000000', false),
  ('youtube', '#FF0000', false),
  ('twitter', '#1DA1F2', false),
  ('kwai', '#FF8F00', false)
ON CONFLICT (platform) DO NOTHING;

-- 6. Force Admin Role for your user (Just to be sure)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
