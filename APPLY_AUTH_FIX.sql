-- ========================================
-- COMPLETE DATABASE SETUP + AUTH FIX
-- Execute this ENTIRE script in Supabase SQL Editor
-- ========================================

-- PART 1: Create tables if they don't exist
-- ========================================

-- Create enum for user roles (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create user_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old user_roles policies if they exist
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- User roles policies
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create creators table (if not exists)
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  
  -- Social media links
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  twitter_url TEXT,
  
  -- Social media active status
  instagram_active BOOLEAN DEFAULT false,
  youtube_active BOOLEAN DEFAULT false,
  tiktok_active BOOLEAN DEFAULT false,
  twitter_active BOOLEAN DEFAULT false,
  
  -- Statistics (will be updated automatically)
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_followers INTEGER DEFAULT 0,
  total_followers TEXT DEFAULT '0',
  engagement_rate TEXT DEFAULT '0%',
  
  -- Landing page customization
  landing_theme JSONB DEFAULT '{"primaryColor": "#FF6B35", "secondaryColor": "#004E89", "layout": "default"}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_stats_update TIMESTAMPTZ
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);

-- Enable RLS on creators
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Drop old creators policies if they exist
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Public can view creators" ON creators;
DROP POLICY IF EXISTS "Creators can view own profile" ON creators;
DROP POLICY IF EXISTS "Creators can update own profile" ON creators;
DROP POLICY IF EXISTS "Admins can insert creators" ON creators;
DROP POLICY IF EXISTS "Admins can update creators" ON creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON creators;

-- Create new unified policies for creators
CREATE POLICY "Public can view creators" 
ON creators FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Creators can update own profile"
ON creators
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert creators"
ON creators FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update creators"
ON creators FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete creators"
ON creators FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- PART 2: Create helper functions
-- ========================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_creators ON public.creators;
CREATE TRIGGER set_updated_at_creators
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Create RPC function for admin check
-- ========================================

-- Create the is_user_admin RPC function (bypasses RLS)
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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO anon;

-- PART 4: Setup your admin account
-- ========================================

-- Make sure your account is admin (CHANGE EMAIL IF NEEDED)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'contatojoaochristofoli@googlemail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- PART 5: Verification
-- ========================================

SELECT '✅ Tables created/verified' as status;
SELECT '✅ RPC function created' as status;
SELECT '✅ Policies updated' as status;
SELECT '✅ Triggers configured' as status;

-- Check if your account is admin
SELECT 
  '🔍 Admin check:' as message,
  EXISTS(
    SELECT 1 FROM user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE au.email = 'contatojoaochristofoli@googlemail.com' 
    AND ur.role = 'admin'
  ) as is_admin;

-- Show current tables
SELECT '📊 Current tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
