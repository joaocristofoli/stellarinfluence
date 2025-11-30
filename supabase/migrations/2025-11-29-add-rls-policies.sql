-- Migration: add RLS policies for creators table (with drops)
-- Enable RLS
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Creators can insert their own profile" ON public.creators;
DROP POLICY IF EXISTS "Creators can update their own profile" ON public.creators;
DROP POLICY IF EXISTS "Creators can view their own profile" ON public.creators;
DROP POLICY IF EXISTS "Public can view creators" ON public.creators;

-- Allow creators to insert their own profile
CREATE POLICY "Creators can insert their own profile"
ON public.creators
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow creators to update their own profile
CREATE POLICY "Creators can update their own profile"
ON public.creators
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow creators to select their own profile
CREATE POLICY "Creators can view their own profile"
ON public.creators
FOR SELECT
USING (auth.uid() = user_id);

-- Allow public read access
CREATE POLICY "Public can view creators"
ON public.creators
FOR SELECT
USING (true);
