-- Add stories_views and gallery_urls to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS stories_views TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
