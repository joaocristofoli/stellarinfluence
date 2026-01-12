-- =========================================================
-- MEGA RESTORATION SCRIPT - STELLAR INFLUENCE STUDIO
-- Run this ONCE to restore the entire database structure.
-- =========================================================

-- =====================
-- PART 1: CORE TYPES
-- =====================
DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'creator'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.channel_type AS ENUM ('influencer','paid_traffic','flyers','physical_media','events','partnerships','social_media','email_marketing','radio','sound_car','promoters'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.strategy_status AS ENUM ('planned','in_progress','completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================
-- PART 2: CORE FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'); END; $$;

CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role = 'admin'); END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role); $$;

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.profiles (id, full_name,avatar_url) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url') ON CONFLICT (id) DO NOTHING; RETURN NEW; END; $$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- =====================
-- PART 3: CORE TABLES
-- =====================
-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT, avatar_url TEXT, role TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View profiles" ON public.profiles; CREATE POLICY "View profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Update own profile" ON public.profiles; CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, role));
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles; CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Creators (Influencers)
CREATE TABLE IF NOT EXISTS public.creators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, category TEXT NOT NULL, bio TEXT, image_url TEXT, instagram_url TEXT, youtube_url TEXT, tiktok_url TEXT, twitter_url TEXT, kwai_url TEXT, instagram_active BOOLEAN DEFAULT false, youtube_active BOOLEAN DEFAULT false, tiktok_active BOOLEAN DEFAULT false, twitter_active BOOLEAN DEFAULT false, kwai_active BOOLEAN DEFAULT false, instagram_followers INTEGER DEFAULT 0, youtube_followers INTEGER DEFAULT 0, tiktok_followers INTEGER DEFAULT 0, twitter_followers INTEGER DEFAULT 0, kwai_followers INTEGER DEFAULT 0, youtube_subscribers INTEGER DEFAULT 0, total_followers TEXT DEFAULT '0', engagement_rate TEXT DEFAULT '0%', primary_platform TEXT, landing_theme JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), last_stats_update TIMESTAMPTZ, user_id UUID);
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view creators" ON public.creators; CREATE POLICY "Anyone view creators" ON public.creators FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admins manage creators" ON public.creators; CREATE POLICY "Admins manage creators" ON public.creators FOR ALL TO authenticated USING (public.is_admin());

-- =====================
-- PART 4: BOOKINGS & CAMPAIGNS
-- =====================
CREATE TABLE IF NOT EXISTS public.bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_name TEXT NOT NULL, contact_name TEXT NOT NULL, contact_email TEXT NOT NULL, contact_phone TEXT, campaign_brief TEXT NOT NULL, budget_range TEXT, preferred_timeline TEXT, preferred_platforms JSONB DEFAULT '[]'::jsonb, target_audience TEXT, campaign_goals TEXT, status TEXT DEFAULT 'pending', admin_notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), reviewed_at TIMESTAMPTZ, reviewed_by UUID REFERENCES auth.users(id));
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone create bookings" ON public.bookings; CREATE POLICY "Anyone create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view bookings" ON public.bookings; CREATE POLICY "Admins view bookings" ON public.bookings FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings; CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.booking_creators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL, creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(booking_id, creator_id));
ALTER TABLE public.booking_creators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view booking_creators" ON public.booking_creators; CREATE POLICY "Admins view booking_creators" ON public.booking_creators FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, brand_name TEXT NOT NULL, brand_logo_url TEXT, start_date DATE, end_date DATE, budget_min INTEGER, budget_max INTEGER, status TEXT DEFAULT 'planned', total_reach BIGINT DEFAULT 0, total_impressions BIGINT DEFAULT 0, total_engagement BIGINT DEFAULT 0, total_conversions INTEGER DEFAULT 0, featured_image_url TEXT, case_study_url TEXT, is_public BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View public campaigns" ON public.campaigns; CREATE POLICY "View public campaigns" ON public.campaigns FOR SELECT TO public USING (is_public = true);
DROP POLICY IF EXISTS "Admins manage campaigns" ON public.campaigns; CREATE POLICY "Admins manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.campaign_creators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL, creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL, role TEXT, content_deliverables JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(campaign_id, creator_id));
ALTER TABLE public.campaign_creators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage campaign_creators" ON public.campaign_creators; CREATE POLICY "Admins manage campaign_creators" ON public.campaign_creators FOR ALL TO authenticated USING (public.is_admin());

-- =====================
-- PART 5: MARKETING PLANNER (EMPRESAS)
-- =====================
CREATE TABLE IF NOT EXISTS public.companies (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, description TEXT, primary_color TEXT DEFAULT '#7c3aed', secondary_color TEXT DEFAULT '#f97316', logo_url TEXT, city TEXT, state TEXT, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view companies" ON public.companies; CREATE POLICY "Anyone view companies" ON public.companies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone create companies" ON public.companies; CREATE POLICY "Anyone create companies" ON public.companies FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone update companies" ON public.companies; CREATE POLICY "Anyone update companies" ON public.companies FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone delete companies" ON public.companies; CREATE POLICY "Anyone delete companies" ON public.companies FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.strategies (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, name TEXT NOT NULL, channel_type public.channel_type NOT NULL, budget DECIMAL(10,2) NOT NULL DEFAULT 0, responsible TEXT NOT NULL, description TEXT NOT NULL, how_to_do TEXT NOT NULL, when_to_do TEXT NOT NULL, why_to_do TEXT NOT NULL, status public.strategy_status NOT NULL DEFAULT 'planned', connections UUID[] DEFAULT '{}', created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view strategies" ON public.strategies; CREATE POLICY "Anyone view strategies" ON public.strategies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone create strategies" ON public.strategies; CREATE POLICY "Anyone create strategies" ON public.strategies FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone update strategies" ON public.strategies; CREATE POLICY "Anyone update strategies" ON public.strategies FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone delete strategies" ON public.strategies; CREATE POLICY "Anyone delete strategies" ON public.strategies FOR DELETE USING (true);

-- =====================
-- PART 6: SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS public.platform_settings (platform TEXT PRIMARY KEY, icon_url TEXT, bg_color TEXT, is_transparent BOOLEAN DEFAULT false, use_theme_color BOOLEAN DEFAULT false, base_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings; CREATE POLICY "Public read platform_settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write platform_settings" ON public.platform_settings; CREATE POLICY "Admin write platform_settings" ON public.platform_settings FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.agency_settings (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, branding JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read agency_settings" ON public.agency_settings; CREATE POLICY "Public read agency_settings" ON public.agency_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write agency_settings" ON public.agency_settings; CREATE POLICY "Admin write agency_settings" ON public.agency_settings FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.pricing_tiers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, price INTEGER NOT NULL, features JSONB DEFAULT '[]'::jsonb, is_popular BOOLEAN DEFAULT false, display_order INTEGER DEFAULT 0, order_position INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());">
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pricing" ON public.pricing_tiers; CREATE POLICY "Public read pricing" ON public.pricing_tiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write pricing" ON public.pricing_tiers; CREATE POLICY "Admin write pricing" ON public.pricing_tiers FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.homepage_config (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), config JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read homepage" ON public.homepage_config; CREATE POLICY "Public read homepage" ON public.homepage_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write homepage" ON public.homepage_config; CREATE POLICY "Admin write homepage" ON public.homepage_config FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.theme_presets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL UNIQUE, theme JSONB NOT NULL, is_default BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read themes" ON public.theme_presets; CREATE POLICY "Public read themes" ON public.theme_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write themes" ON public.theme_presets; CREATE POLICY "Admin write themes" ON public.theme_presets FOR ALL USING (public.is_admin());

-- =====================
-- PART 7: TRIGGERS
-- =====================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles; CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_creators ON public.creators; CREATE TRIGGER set_updated_at_creators BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_bookings ON public.bookings; CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_campaigns ON public.campaigns; CREATE TRIGGER set_updated_at_campaigns BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================
-- PART 8: YOUR ADMIN USER
-- =====================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.profiles (id, full_name)
SELECT id, 'Admin Master' FROM auth.users WHERE email = 'contatojoaochristofoli@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 9: SEED DATA
-- =====================
INSERT INTO public.platform_settings (platform, bg_color) VALUES ('instagram', '#E1306C'), ('tiktok', '#000000'), ('youtube', '#FF0000'), ('twitter', '#1DA1F2'), ('kwai', '#FF8F00') ON CONFLICT DO NOTHING;
INSERT INTO public.agency_settings (id, branding) VALUES ('00000000-0000-0000-0000-000000000001', '{"agency_name": "Stellar Influence", "primary_color": "#7c3aed"}'::jsonb) ON CONFLICT DO NOTHING;
INSERT INTO public.homepage_config (id, config) VALUES ('00000000-0000-0000-0000-000000000001', '{"title": "Stellar Influence Studio"}'::jsonb) ON CONFLICT DO NOTHING;
INSERT INTO public.companies (name, description, city, state) SELECT 'Empresa de Teste', 'Primeira empresa para testes', 'Toledo', 'PR' WHERE NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1);

SELECT 'RESTORATION COMPLETE! Refresh the page.' as status;
