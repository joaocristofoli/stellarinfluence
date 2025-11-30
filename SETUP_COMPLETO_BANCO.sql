-- ========================================
-- SETUP COMPLETO DO BANCO DE DADOS - SUPABASE
-- Execute TODO este script de uma vez no SQL Editor
-- ========================================

-- ========================================
-- PARTE 1: CRIAR TIPOS E FUNÇÕES BASE
-- ========================================

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RPC function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO anon;

-- ========================================
-- PARTE 2: TABELAS DE USUÁRIOS
-- ========================================

-- Profiles table
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
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- PARTE 3: TABELA DE CREATORS
-- ========================================

CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  
  -- Social media links
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  twitter_url TEXT,
  
  -- Social media active status
  instagram_active BOOLEAN DEFAULT false,
  youtube_active BOOLEAN DEFAULT false,
  tiktok_active BOOLEAN DEFAULT false,
  twitter_active BOOLEAN DEFAULT false,
  
  -- Statistics
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_followers INTEGER DEFAULT 0,
  total_followers TEXT DEFAULT '0',
  engagement_rate TEXT DEFAULT '0%',
  
  -- Landing page customization
  landing_theme JSONB DEFAULT '{"primaryColor": "#FF6B35", "secondaryColor": "#004E89", "layout": "default"}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_stats_update TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Public can view creators" ON creators;
DROP POLICY IF EXISTS "Creators can view own profile" ON creators;
DROP POLICY IF EXISTS "Creators can update own profile" ON creators;
DROP POLICY IF EXISTS "Admins can insert creators" ON creators;
DROP POLICY IF EXISTS "Admins can update creators" ON creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON creators;

CREATE POLICY "Public can view creators" 
ON creators FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Creators can update own profile"
ON creators FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert creators"
ON creators FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update creators"
ON creators FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete creators"
ON creators FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- PARTE 4: PRICING TIERS
-- ========================================

CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_min INTEGER,
  price_max INTEGER,
  billing_period TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;

CREATE POLICY "Anyone can view active pricing tiers"
  ON public.pricing_tiers FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (name, slug, description, price_min, price_max, billing_period, features, is_active, display_order)
VALUES 
  (
    'Starter',
    'starter',
    'Perfeito para pequenas marcas começando no marketing de influência',
    150000,
    500000,
    'per_campaign',
    '["1-2 criadores de conteúdo", "Posts em 1 plataforma", "Relatório básico de métricas", "Suporte via email", "Duração: 1 semana"]'::jsonb,
    true,
    1
  ),
  (
    'Professional',
    'professional',
    'Ideal para empresas que buscam resultados consistentes',
    500000,
    2000000,
    'per_campaign',
    '["3-5 criadores de conteúdo", "Posts em 2-3 plataformas", "Relatório detalhado com analytics", "Suporte prioritário", "Gestão completa da campanha", "Duração: 2-4 semanas", "Criação de conteúdo"]'::jsonb,
    true,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'Soluções personalizadas para grandes marcas',
    2000000,
    NULL,
    'custom',
    '["6+ criadores de conteúdo premium", "Campanhas multi-plataforma", "Analytics em tempo real", "Suporte dedicado 24/7", "Gestão estratégica completa", "Duração personalizada", "Produção profissional de conteúdo", "Eventos e ativações", "Contratos de longo prazo"]'::jsonb,
    true,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- PARTE 5: BOOKINGS
-- ========================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  campaign_brief TEXT NOT NULL,
  budget_range TEXT,
  preferred_timeline TEXT,
  preferred_platforms JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT,
  campaign_goals TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.booking_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, creator_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can add creators to bookings on creation" ON public.booking_creators;
DROP POLICY IF EXISTS "Admins can view booking creators" ON public.booking_creators;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can add creators to bookings on creation"
  ON public.booking_creators FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view booking creators"
  ON public.booking_creators FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- PARTE 6: CAMPAIGNS
-- ========================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  start_date DATE,
  end_date DATE,
  budget_min INTEGER,
  budget_max INTEGER,
  status TEXT DEFAULT 'planned',
  total_reach BIGINT DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  featured_image_url TEXT,
  case_study_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  content_deliverables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id)
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Anyone can view campaign creators for public campaigns" ON public.campaign_creators;
DROP POLICY IF EXISTS "Admins can manage campaign creators" ON public.campaign_creators;

CREATE POLICY "Anyone can view public campaigns"
  ON public.campaigns FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

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

-- ========================================
-- PARTE 7: ANALYTICS SNAPSHOTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT NOT NULL,
  followers_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  avg_likes DECIMAL(10,2) DEFAULT 0,
  avg_comments DECIMAL(10,2) DEFAULT 0,
  avg_shares DECIMAL(10,2) DEFAULT 0,
  reach BIGINT DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, snapshot_date, platform)
);

CREATE INDEX IF NOT EXISTS idx_analytics_creator_date ON public.analytics_snapshots(creator_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON public.analytics_snapshots(platform);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage analytics" ON public.analytics_snapshots;

CREATE POLICY "Admins can manage analytics"
  ON public.analytics_snapshots FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- PARTE 8: TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_creators ON public.creators;
CREATE TRIGGER set_updated_at_creators
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_pricing_tiers ON public.pricing_tiers;
CREATE TRIGGER set_updated_at_pricing_tiers
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_bookings ON public.bookings;
CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_campaigns ON public.campaigns;
CREATE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- PARTE 9: CONFIGURAR SUA CONTA COMO ADMIN
-- ========================================

-- ⚠️ TROQUE O EMAIL PARA O SEU!
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ========================================
-- PARTE 10: VERIFICAÇÃO
-- ========================================

SELECT '✅ Banco de dados configurado com sucesso!' as status;

SELECT '📊 Tabelas criadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '👤 Verificar admin:' as info;
SELECT 
  au.email,
  ur.role,
  is_user_admin(au.id) as is_admin_via_rpc
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 3;
