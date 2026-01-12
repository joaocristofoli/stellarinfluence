-- MASTER REPAIR SCRIPT: REBUILDING AUTH & ROLES
-- This script reconstructs the entire missing Role-Based Access Control system.

-- 1. Create Enum for Roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'creator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Roles Table (The missing piece)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 3. Enable Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Who can view roles?)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Re-Create Admin Functions (Safe to run again)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO service_role;

-- 6. Create Settings Tables (Just in case)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    platform text PRIMARY KEY,
    icon_url text, bg_color text, is_transparent boolean DEFAULT false,
    use_theme_color boolean DEFAULT false, base_url text,
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.platform_settings;
CREATE POLICY "Public read" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON public.platform_settings;
CREATE POLICY "Admin write" ON public.platform_settings FOR ALL USING (public.is_admin());

-- 7. Insert Default Data
INSERT INTO public.platform_settings (platform, bg_color)
VALUES ('instagram', '#E1306C'), ('tiktok', '#000000'), ('youtube', '#FF0000')
ON CONFLICT (platform) DO NOTHING;

-- 8. ULTIMATE FIX: Make YOU an Admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role 
FROM auth.users 
WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
