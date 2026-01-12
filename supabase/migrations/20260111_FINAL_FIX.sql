-- =========================================================
-- FINAL FIX SCRIPT - ALL MISSING COMPONENTS
-- Run this AFTER the MEGA_RESTORATION script
-- =========================================================

-- 1. Add is_active column to homepage_config (required by HomepageEditor)
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT 'A Nova Era do Marketing Digital';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS hero_title_line1 TEXT DEFAULT 'CONECTAMOS';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS hero_title_line2 TEXT DEFAULT 'CRIADORES';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS hero_title_line3 TEXT DEFAULT 'AO FUTURO';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Plataforma premium que transforma marcas em fenômenos digitais';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS cta_primary_text TEXT DEFAULT 'Começar Agora';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS cta_secondary_text TEXT DEFAULT 'Ver Criadores';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#FF6B35';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#7C3AED';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#F7B801';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'particles';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS enable_particle_animation BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS particle_count INTEGER DEFAULT 10;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS particle_speed REAL DEFAULT 5;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS particle_opacity REAL DEFAULT 1;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS particle_color TEXT DEFAULT '#F7B801';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS particle_size REAL DEFAULT 3;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS enable_gradient_animation BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS gradient_opacity REAL DEFAULT 0.4;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS gradient_speed INTEGER DEFAULT 10;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS gradient_mouse_sensitivity INTEGER DEFAULT 50;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS enable_grid BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS grid_opacity REAL DEFAULT 0.2;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS grid_color TEXT DEFAULT '#FF6B35';
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS enable_sphere BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS sphere_rotation_speed INTEGER DEFAULT 20;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS sphere_opacity REAL DEFAULT 0.3;
ALTER TABLE public.homepage_config ADD COLUMN IF NOT EXISTS enable_scroll_indicator BOOLEAN DEFAULT true;

-- Insert default homepage config if none exists
INSERT INTO public.homepage_config (id, is_active, hero_badge_text, hero_title_line1, hero_title_line2, hero_title_line3)
SELECT '00000000-0000-0000-0000-000000000001', true, 'A Nova Era do Marketing Digital', 'CONECTAMOS', 'CRIADORES', 'AO FUTURO'
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_config LIMIT 1);

-- 2. Add email_confirmed_at to get_users_with_roles function
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz,
  email_confirmed_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    COALESCE(p.full_name, 'Usuário sem perfil') as full_name,
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = au.id AND ur.role = 'admin'
    ) as is_admin,
    au.created_at,
    au.email_confirmed_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;

-- 3. Toggle admin role function
CREATE OR REPLACE FUNCTION public.toggle_admin_role(target_user_id uuid, enable_admin boolean)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF enable_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role = 'admin';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_admin_role(uuid, boolean) TO authenticated;

-- 4. Confirm user email function
CREATE OR REPLACE FUNCTION public.confirm_user_email(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_user_email(uuid) TO authenticated;

-- 5. Create toledo_posts table
CREATE TABLE IF NOT EXISTS public.toledo_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('evento', 'acao_social', 'noticia', 'cultura')),
    imagem_url TEXT,
    data_publicacao TIMESTAMPTZ DEFAULT NOW(),
    visualizacoes INTEGER DEFAULT 0,
    alcance INTEGER DEFAULT 0,
    engajamento DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
    tipo TEXT DEFAULT 'noticia' CHECK (tipo IN ('noticia', 'campanha')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.toledo_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published toledo posts" ON public.toledo_posts;
CREATE POLICY "Public can view published toledo posts" ON public.toledo_posts FOR SELECT USING (status = 'publicado');

DROP POLICY IF EXISTS "Admins can manage toledo posts" ON public.toledo_posts;
CREATE POLICY "Admins can manage toledo posts" ON public.toledo_posts FOR ALL USING (public.is_admin());

-- 6. Create toledo_influencers table
CREATE TABLE IF NOT EXISTS public.toledo_influencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id)
);

ALTER TABLE public.toledo_influencers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active toledo influencers" ON public.toledo_influencers;
CREATE POLICY "Public can view active toledo influencers" ON public.toledo_influencers FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Admins can manage toledo influencers" ON public.toledo_influencers;
CREATE POLICY "Admins can manage toledo influencers" ON public.toledo_influencers FOR ALL USING (public.is_admin());

SELECT 'FINAL FIX COMPLETE! All admin features should work now.' as status;
