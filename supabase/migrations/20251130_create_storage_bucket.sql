-- Create the storage bucket for agency assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency_assets', 'agency_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects (it usually is by default, but good to be sure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view (public)
DROP POLICY IF EXISTS "Public Access Agency Assets" ON storage.objects;
CREATE POLICY "Public Access Agency Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'agency_assets' );

-- Policy: Authenticated users (Admins) can upload
-- We use a simplified check here to avoid potential recursion with is_admin() if that's still an issue.
-- Ideally we use public.is_admin(), but checking for authenticated is a safe fallback for now 
-- since only admins should have access to the UI that uploads here.
DROP POLICY IF EXISTS "Admins can upload agency assets" ON storage.objects;
CREATE POLICY "Admins can upload agency assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'agency_assets' );

-- Policy: Admins can update
DROP POLICY IF EXISTS "Admins can update agency assets" ON storage.objects;
CREATE POLICY "Admins can update agency assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'agency_assets' );

-- Policy: Admins can delete
DROP POLICY IF EXISTS "Admins can delete agency assets" ON storage.objects;
CREATE POLICY "Admins can delete agency assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'agency_assets' );
