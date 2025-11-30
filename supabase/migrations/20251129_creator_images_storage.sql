-- Create storage bucket for creator images
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-images', 'creator-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to creator images
CREATE POLICY "Public can view creator images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creator-images');

-- Allow authenticated users (admins) to upload creator images
CREATE POLICY "Authenticated users can upload creator images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creator-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update creator images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'creator-images');

-- Allow authenticated users to delete creator images
CREATE POLICY "Authenticated users can delete creator images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'creator-images');
