-- Create pricing_tiers table
CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_min INTEGER, -- in cents
  price_max INTEGER, -- in cents
  billing_period TEXT DEFAULT 'monthly', -- monthly, per_campaign, custom
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on pricing_tiers
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Public can view active tiers
CREATE POLICY "Anyone can view active pricing tiers"
  ON public.pricing_tiers FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage all tiers
CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_pricing_tiers
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (name, slug, description, price_min, price_max, billing_period, features, is_active, display_order)
VALUES 
  (
    'Starter',
    'starter',
    'Perfeito para pequenas marcas começando no marketing de influência',
    150000, -- R$ 1,500
    500000, -- R$ 5,000
    'per_campaign',
    '["1-2 criadores de conteúdo", "Posts em 1 plataforma", "Relatório básico de métricas", "Suporte via email", "Duração: 1 semana"]'::jsonb,
    true,
    1
  ),
  (
    'Professional',
    'professional',
    'Ideal para empresas que buscam resultados consistentes',
    500000, -- R$ 5,000
    2000000, -- R$ 20,000
    'per_campaign',
    '["3-5 criadores de conteúdo", "Posts em 2-3 plataformas", "Relatório detalhado com analytics", "Suporte prioritário", "Gestão completa da campanha", "Duração: 2-4 semanas", "Criação de conteúdo"]'::jsonb,
    true,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'Soluções personalizadas para grandes marcas',
    2000000, -- R$ 20,000+
    NULL, -- sem limite máximo
    'custom',
    '["6+ criadores de conteúdo premium", "Campanhas multi-plataforma", "Analytics em tempo real", "Suporte dedicado 24/7", "Gestão estratégica completa", "Duração personalizada", "Produção profissional de conteúdo", "Eventos e ativações", "Contratos de longo prazo"]'::jsonb,
    true,
    3
  );
