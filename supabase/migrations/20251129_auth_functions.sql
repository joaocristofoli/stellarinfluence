-- Create RPC function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
$$;

-- Fix RLS policies for creators table
-- Drop conflicting policies first
DROP POLICY IF EXISTS "Creators can view own profile" ON creators;
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;

-- Create new policy that allows public read access
-- This is needed for landing pages and for authenticated users to query
CREATE POLICY "Public can view creators" 
ON creators FOR SELECT 
TO public 
USING (true);

-- The update policy "Creators can update own profile" already exists
-- and allows creators to modify their own profiles

-- Grant execute permission on the RPC function to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO anon;
