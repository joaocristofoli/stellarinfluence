-- COMPREHENSIVE RESTORATION SCRIPT
-- This script checks and restores the core tables 'profiles' and 'creators'
-- It is designed to be safe to run (will not destroy existing data if table exists)

-- 1. Restore PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Restore CREATORS Table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  
  -- Social media links
  instagram_url TEXT, youtube_url TEXT, tiktok_url TEXT, twitter_url TEXT, kwai_url TEXT,
  
  -- Social media active status
  instagram_active BOOLEAN DEFAULT false,
  youtube_active BOOLEAN DEFAULT false,
  tiktok_active BOOLEAN DEFAULT false,
  twitter_active BOOLEAN DEFAULT false,
  kwai_active BOOLEAN DEFAULT false,
  
  -- Statistics
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_followers INTEGER DEFAULT 0,
  kwai_followers INTEGER DEFAULT 0,
  total_followers TEXT DEFAULT '0',
  engagement_rate TEXT DEFAULT '0%',
  youtube_subscribers INTEGER DEFAULT 0,
  
  -- Landing page customization
  landing_theme JSONB DEFAULT '{"primaryColor": "#FF6B35", "secondaryColor": "#004E89", "layout": "default"}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_stats_update TIMESTAMPTZ,
  user_id UUID -- Link to auth user if they are also a user
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view creators" ON public.creators;
CREATE POLICY "Anyone can view creators" ON public.creators FOR SELECT TO public USING (true);

-- Ensure is_admin() exists before using it in policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS 'BEGIN RETURN FALSE; END;';
    END IF;
END $$;

DROP POLICY IF EXISTS "Admins can insert creators" ON public.creators;
CREATE POLICY "Admins can insert creators" ON public.creators FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update creators" ON public.creators;
CREATE POLICY "Admins can update creators" ON public.creators FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete creators" ON public.creators;
CREATE POLICY "Admins can delete creators" ON public.creators FOR DELETE TO authenticated USING (public.is_admin());


-- 3. Triggers for Update Timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_creators ON public.creators;
CREATE TRIGGER set_updated_at_creators BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. User Creation Trigger (Sync Auth -> Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
