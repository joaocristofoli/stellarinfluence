-- Migration: Adicionar tabelas de planejamento de marketing
-- Criar enum para tipos de canal (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_type') THEN
    CREATE TYPE public.channel_type AS ENUM (
      'influencer',
      'paid_traffic',
      'flyers',
      'physical_media',
      'events',
      'partnerships',
      'social_media',
      'email_marketing',
      'radio',
      'sound_car',
      'promoters'
    );
  END IF;
END $$;

-- Criar enum para status da estratégia (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'strategy_status') THEN
    CREATE TYPE public.strategy_status AS ENUM (
      'planned',
      'in_progress',
      'completed'
    );
  END IF;
END $$;

-- Tabela de empresas clientes
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT DEFAULT '#7c3aed',
  secondary_color TEXT DEFAULT '#f97316',
  logo_url TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de estratégias de marketing
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_type public.channel_type NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  responsible TEXT NOT NULL,
  description TEXT NOT NULL,
  how_to_do TEXT NOT NULL,
  when_to_do TEXT NOT NULL,
  why_to_do TEXT NOT NULL,
  status public.strategy_status NOT NULL DEFAULT 'planned',
  connections UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sem autenticação por enquanto para facilitar uso)
DO $$
BEGIN
  -- Companies policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view companies' AND tablename = 'companies') THEN
    CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create companies' AND tablename = 'companies') THEN
    CREATE POLICY "Anyone can create companies" ON public.companies FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update companies' AND tablename = 'companies') THEN
    CREATE POLICY "Anyone can update companies" ON public.companies FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete companies' AND tablename = 'companies') THEN
    CREATE POLICY "Anyone can delete companies" ON public.companies FOR DELETE USING (true);
  END IF;
  
  -- Strategies policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view strategies' AND tablename = 'strategies') THEN
    CREATE POLICY "Anyone can view strategies" ON public.strategies FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create strategies' AND tablename = 'strategies') THEN
    CREATE POLICY "Anyone can create strategies" ON public.strategies FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update strategies' AND tablename = 'strategies') THEN
    CREATE POLICY "Anyone can update strategies" ON public.strategies FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete strategies' AND tablename = 'strategies') THEN
    CREATE POLICY "Anyone can delete strategies" ON public.strategies FOR DELETE USING (true);
  END IF;
END $$;

-- Trigger para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_marketing_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar triggers se não existirem
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at_column();

DROP TRIGGER IF EXISTS update_strategies_updated_at ON public.strategies;
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at_column();

-- Inserir a empresa "ai q fome" como primeira empresa (se não existir)
INSERT INTO public.companies (name, description, primary_color, secondary_color, city, state)
SELECT 'ai q fome', 'App de delivery de comida', '#7c3aed', '#f97316', 'Toledo', 'PR'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'ai q fome');
