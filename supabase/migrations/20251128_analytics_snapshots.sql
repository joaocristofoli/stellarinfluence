-- Create analytics_snapshots table for historical tracking
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  
  -- Follower counts per platform
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_followers INTEGER DEFAULT 0,
  total_followers_calculated BIGINT DEFAULT 0,
  
  -- Engagement metrics
  instagram_engagement_rate DECIMAL(5,2), -- e.g., 8.50 for 8.5%
  youtube_engagement_rate DECIMAL(5,2),
  tiktok_engagement_rate DECIMAL(5,2),
  twitter_engagement_rate DECIMAL(5,2),
  avg_engagement_rate DECIMAL(5,2),
  
  -- Additional metrics
  total_reach BIGINT DEFAULT 0,
  avg_views BIGINT DEFAULT 0,
  
  -- Snapshot metadata
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one snapshot per creator per day
  UNIQUE(creator_id, snapshot_date)
);

-- Create index for faster queries
CREATE INDEX idx_analytics_creator_date ON public.analytics_snapshots(creator_id, snapshot_date DESC);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Admins can view all snapshots
CREATE POLICY "Admins can view analytics snapshots"
  ON public.analytics_snapshots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert snapshots
CREATE POLICY "Admins can insert analytics snapshots"
  ON public.analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to create snapshot from current creator data
CREATE OR REPLACE FUNCTION public.create_analytics_snapshot(p_creator_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_id UUID;
BEGIN
  INSERT INTO public.analytics_snapshots (
    creator_id,
    instagram_followers,
    youtube_followers,
    tiktok_followers,
    twitter_followers,
    total_followers_calculated,
    snapshot_date
  )
  SELECT
    id,
    instagram_followers,
    youtube_followers,
    tiktok_followers,
    twitter_followers,
    instagram_followers + youtube_followers + tiktok_followers + twitter_followers,
    CURRENT_DATE
  FROM public.creators
  WHERE id = p_creator_id
  ON CONFLICT (creator_id, snapshot_date) DO UPDATE
  SET
    instagram_followers = EXCLUDED.instagram_followers,
    youtube_followers = EXCLUDED.youtube_followers,
    tiktok_followers = EXCLUDED.tiktok_followers,
    twitter_followers = EXCLUDED.twitter_followers,
    total_followers_calculated = EXCLUDED.total_followers_calculated
  RETURNING id INTO v_snapshot_id;
  
  RETURN v_snapshot_id;
END;
$$;
