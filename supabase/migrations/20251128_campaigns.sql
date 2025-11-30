-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  
  -- Campaign details
  start_date DATE,
  end_date DATE,
  budget_min INTEGER, -- in cents
  budget_max INTEGER, -- in cents
  status TEXT DEFAULT 'planned', -- planned, active, completed, cancelled
  
  -- Performance metrics
  total_reach BIGINT DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  
  -- Media
  featured_image_url TEXT,
  case_study_url TEXT,
  
  -- Settings
  is_public BOOLEAN DEFAULT false, -- show in public showcase
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign_creators junction table (many-to-many)
CREATE TABLE public.campaign_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  role TEXT, -- lead, collaborator, etc
  content_deliverables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creators ENABLE ROW LEVEL SECURITY;

-- Public can view public campaigns
CREATE POLICY "Anyone can view public campaigns"
  ON public.campaigns FOR SELECT
  TO public
  USING (is_public = true);

-- Admins can manage all campaigns
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Campaign creators policies
CREATE POLICY "Anyone can view campaign creators for public campaigns"
  ON public.campaign_creators FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_creators.campaign_id
      AND campaigns.is_public = true
    )
  );

CREATE POLICY "Admins can manage campaign creators"
  ON public.campaign_creators FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create triggers
CREATE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
