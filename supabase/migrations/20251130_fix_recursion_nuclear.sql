-- NUCLEAR OPTION V4: The "No-Loop" Strategy
-- We break the recursion by NOT allowing admins to query user_roles table directly via SELECT policy.
-- Admins must use the get_users_with_roles() RPC function to see users/roles.
-- is_admin() will rely on "Users can view own roles" (or superuser bypass) to work without triggering the loop.

-- 1. Drop EVERYTHING related to user_roles policies to be safe
DROP POLICY IF EXISTS "Admins can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own creator profile" ON public.creators;
DROP POLICY IF EXISTS "Users can insert their own creator profile" ON public.creators;
DROP POLICY IF EXISTS "Users can update their own creator profile" ON public.creators;
DROP POLICY IF EXISTS "Everyone can read platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Everyone can read agency settings" ON public.agency_settings;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Drop function with CASCADE
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. Re-create is_admin
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

-- 4. Policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- CRITICAL CHANGE: NO "Admins can view user_roles" policy.
-- This prevents the loop: is_admin() -> SELECT user_roles -> Policy -> is_admin() -> ...

-- Users can view their own roles (This allows is_admin() to work for the current user)
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

-- 5. Re-create policies for creators
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on creators" 
ON public.creators FOR ALL 
USING (public.is_admin());

CREATE POLICY "Users can view their own creator profile" 
ON public.creators FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creator profile" 
ON public.creators FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile" 
ON public.creators FOR UPDATE USING (auth.uid() = user_id);

-- 6. Re-create policies for platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform settings" 
ON public.platform_settings FOR ALL 
USING (public.is_admin());

CREATE POLICY "Everyone can read platform settings" 
ON public.platform_settings FOR SELECT USING (true);

-- 7. Re-create policies for agency_settings
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agency settings" 
ON public.agency_settings FOR ALL 
USING (public.is_admin());

CREATE POLICY "Everyone can read agency settings" 
ON public.agency_settings FOR SELECT USING (true);

-- 8. Re-create policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated 
USING (public.is_admin());

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);
