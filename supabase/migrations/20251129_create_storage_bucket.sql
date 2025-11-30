-- Create the storage bucket for creator images
insert into storage.buckets (id, name, public)
values ('creator-images', 'creator-images', true)
on conflict (id) do nothing;

-- Set up security policies for the creator-images bucket

-- Allow public read access to all files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'creator-images' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'creator-images' and auth.role() = 'authenticated' );

-- Allow users to update their own files (optional, but good for replacing images)
create policy "Users can update own files"
  on storage.objects for update
  using ( bucket_id = 'creator-images' and auth.role() = 'authenticated' );

-- Allow users to delete their own files
create policy "Users can delete own files"
  on storage.objects for delete
  using ( bucket_id = 'creator-images' and auth.role() = 'authenticated' );
