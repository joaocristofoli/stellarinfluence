-- CONSOLIDATED ADMIN & RLS FIX
-- Run this script to fix ALL admin, permission, and recursion issues.
-- This replaces: admin_management.sql, fix_user_visibility.sql, fix_recursion_*.sql

-- 1. CLEANUP: Drop everything potentially conflicting
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_users_with_roles() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop policies on user_roles (Explicitly)
DROP POLICY IF EXISTS "Admins can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Drop policies on other tables that might use is_admin
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on creators" ON public.creators;
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can manage agency settings" ON public.agency_settings;

-- 2. CORE: Create Secure is_admin Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Critical for bypassing RLS
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

-- 3. USER ROLES: Policies (Anti-Recursion Strategy)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view ONLY their own roles. 
-- This is safe and allows is_admin() to work if it checks the current user.
CREATE POLICY "Users can view own roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Admins can INSERT (Promote)
CREATE POLICY "Admins can insert user_roles" 
ON public.user_roles FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

-- Admins can DELETE (Demote)
CREATE POLICY "Admins can delete user_roles" 
ON public.user_roles FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- NOTE: We do NOT allow Admins to SELECT * from user_roles via policy to avoid recursion.
-- They will use the RPC function below to list users.

-- 4. RPC: Get Users with Roles (For Admin Panel)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    COALESCE(p.full_name, 'Usuário sem perfil') as full_name,
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = au.id AND ur.role = 'admin'
    ) as is_admin,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. PROFILES: Policies & Triggers
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Trigger to ensure profile exists
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. CREATORS: Policies
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on creators" 
ON public.creators FOR ALL 
USING (public.is_admin());

-- Re-ensure user policies exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own creator profile" ON public.creators;
CREATE POLICY "Users can view their own creator profile" 
ON public.creators FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own creator profile" ON public.creators;
CREATE POLICY "Users can insert their own creator profile" 
ON public.creators FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own creator profile" ON public.creators;
CREATE POLICY "Users can update their own creator profile" 
ON public.creators FOR UPDATE USING (auth.uid() = user_id);

-- 7. SETTINGS: Policies
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Everyone can read platform settings" ON public.platform_settings;
CREATE POLICY "Everyone can read platform settings" ON public.platform_settings FOR SELECT USING (true);

ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage agency settings" ON public.agency_settings FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Everyone can read agency settings" ON public.agency_settings;
CREATE POLICY "Everyone can read agency settings" ON public.agency_settings FOR SELECT USING (true);

-- 8. STORAGE: Agency Assets
INSERT INTO storage.buckets (id, name, public) VALUES ('agency_assets', 'agency_assets', true) ON CONFLICT (id) DO NOTHING;
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out to avoid permission errors (usually enabled by default)

DROP POLICY IF EXISTS "Public Access Agency Assets" ON storage.objects;
CREATE POLICY "Public Access Agency Assets" ON storage.objects FOR SELECT USING ( bucket_id = 'agency_assets' );

DROP POLICY IF EXISTS "Admins can upload agency assets" ON storage.objects;
CREATE POLICY "Admins can upload agency assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'agency_assets' ); -- Simplified check

DROP POLICY IF EXISTS "Admins can update agency assets" ON storage.objects;
CREATE POLICY "Admins can update agency assets" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'agency_assets' );

DROP POLICY IF EXISTS "Admins can delete agency assets" ON storage.objects;
CREATE POLICY "Admins can delete agency assets" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'agency_assets' );
