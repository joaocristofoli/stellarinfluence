-- Function to confirm a user's email (Admin only)
CREATE OR REPLACE FUNCTION public.confirm_user_email(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update auth.users
  UPDATE auth.users
  SET email_confirmed_at = now(),
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update get_users_with_roles to include email_confirmed_at
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz,
  email_confirmed_at timestamptz
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
    p.id,
    au.email::text,
    p.full_name,
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    ) as is_admin,
    p.created_at,
    au.email_confirmed_at
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
