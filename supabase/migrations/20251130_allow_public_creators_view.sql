-- Allow public read access to creators table
-- This is required for the public landing pages to work for unauthenticated users

CREATE POLICY "Public can view creators"
ON "public"."creators"
FOR SELECT
USING (true);
