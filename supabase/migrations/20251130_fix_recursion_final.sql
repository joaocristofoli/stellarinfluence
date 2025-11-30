-- 1. Drop existing policies on user_roles to break the cycle immediately
DROP POLICY IF EXISTS "Admins can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- 2. Re-create the is_admin function to ENSURE it is SECURITY DEFINER
-- This function runs with the privileges of the creator (postgres), bypassing RLS
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

-- 3. Re-enable RLS (just in case)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Re-create policies using the secure function
-- Because is_admin is SECURITY DEFINER, the SELECT inside it will NOT trigger these policies again

CREATE POLICY "Admins can view user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

CREATE POLICY "Admins can insert user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can delete user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- 5. Add a policy for users to view their own roles (good practice)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);
