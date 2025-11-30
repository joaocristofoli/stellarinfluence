-- Enhanced Creator Profile Fields Migration
-- Add demographic, psychographic, and homepage management fields

-- Add demographic fields
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'not-disclosed')),
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT,
ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'Brazil';

-- Add psychographic fields  
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS political_leaning TEXT CHECK (political_leaning IN ('left', 'center-left', 'center', 'center-right', 'right', 'neutral', 'not-disclosed')),
ADD COLUMN IF NOT EXISTS music_preferences TEXT[], -- array of genres: ['pop', 'rock', 'hip-hop', etc]
ADD COLUMN IF NOT EXISTS content_genres TEXT[]; -- array: ['lifestyle', 'travel', 'fitness', 'fashion', etc]

-- Add profile metadata
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS profile_type TEXT CHECK (profile_type IN ('nano', 'micro', 'macro', 'mega', 'celebrity')),
ADD COLUMN IF NOT EXISTS target_audience_description TEXT,
ADD COLUMN IF NOT EXISTS target_age_min INTEGER,
ADD COLUMN IF NOT EXISTS target_age_max INTEGER,
ADD COLUMN IF NOT EXISTS target_gender TEXT CHECK (target_gender IN ('male', 'female', 'all', 'diverse'));

-- Add other platforms (beyond existing Instagram, YouTube, TikTok, Twitter)
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitch_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS pinterest_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS twitch_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS facebook_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinterest_active BOOLEAN DEFAULT false;

-- Homepage visibility control
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS featured_on_homepage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS homepage_display_order INTEGER DEFAULT 999,
ADD COLUMN IF NOT EXISTS homepage_max_display INTEGER; -- NULL means use system default

-- Create index for homepage queries (only for featured creators)
CREATE INDEX IF NOT EXISTS idx_creators_homepage 
ON creators(featured_on_homepage, homepage_display_order) 
WHERE featured_on_homepage = true;

-- Create index for filtering by profile type
CREATE INDEX IF NOT EXISTS idx_creators_profile_type ON creators(profile_type);

-- Create index for filtering by location
CREATE INDEX IF NOT EXISTS idx_creators_location ON creators(location_country, location_state, location_city);

-- Comment explaining the new fields
COMMENT ON COLUMN creators.profile_type IS 'Influencer tier: nano (<10k), micro (10k-100k), macro (100k-1M), mega (1M+), celebrity';
COMMENT ON COLUMN creators.music_preferences IS 'Array of music genres the creator likes/creates content about';
COMMENT ON COLUMN creators.content_genres IS 'Array of content types: lifestyle, travel, fitness, fashion, beauty, tech, gaming, food, etc';
COMMENT ON COLUMN creators.political_leaning IS 'Political positioning if publicly known/relevant';
COMMENT ON COLUMN creators.featured_on_homepage IS 'Whether this creator appears on the public homepage';
COMMENT ON COLUMN creators.homepage_display_order IS 'Order in which featured creators appear (lower = first)';
