-- Migration to ensure Master Admin is always configured correctly
-- Targeted Email: contatojoaochristofoli@gmail

-- 1. Create a function to handle specific admin assignments
CREATE OR REPLACE FUNCTION public.handle_admin_promotion() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches the Master Admin email
  IF NEW.email = 'contatojoaochristofoli@gmail' THEN
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Ensure profile exists with correct data (optional update if needed)
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger on auth.users (if not exists logic handled by DROP first)
DROP TRIGGER IF EXISTS on_auth_user_admin_check ON auth.users;
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_promotion();

-- 3. Run effectively immediately for existing user (Backfill)
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID if it exists
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'contatojoaochristofoli@gmail';
  
  IF target_user_id IS NOT NULL THEN
    -- Insert role if user exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned to existing user: %', target_user_id;
  ELSE
    RAISE NOTICE 'User not found. Trigger will handle future signup.';
  END IF;
END $$;
