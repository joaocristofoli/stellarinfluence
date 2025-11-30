-- Create a secure function to check admin status
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/superuser), bypassing RLS on user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Secure search path
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

-- Drop the old policy that caused recursion
DROP POLICY IF EXISTS "Admins can do everything on creators" ON "public"."creators";

-- Create new policy using the secure function
CREATE POLICY "Admins can do everything on creators"
ON "public"."creators"
FOR ALL
USING (public.is_admin());
