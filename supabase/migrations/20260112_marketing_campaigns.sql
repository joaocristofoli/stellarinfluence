-- Migration: Marketing Campaigns + Campaign ID on Strategies
-- Adds ability to group strategies into campaigns per company

-- Tabela de campanhas de marketing
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status public.strategy_status NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna campaign_id na tabela strategies (nullable para retrocompatibilidade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'strategies' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE public.strategies 
    ADD COLUMN campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (compatíveis com padrão existente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view marketing_campaigns' AND tablename = 'marketing_campaigns') THEN
    CREATE POLICY "Anyone can view marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create marketing_campaigns' AND tablename = 'marketing_campaigns') THEN
    CREATE POLICY "Anyone can create marketing_campaigns" ON public.marketing_campaigns FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update marketing_campaigns' AND tablename = 'marketing_campaigns') THEN
    CREATE POLICY "Anyone can update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete marketing_campaigns' AND tablename = 'marketing_campaigns') THEN
    CREATE POLICY "Anyone can delete marketing_campaigns" ON public.marketing_campaigns FOR DELETE USING (true);
  END IF;
END $$;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON public.marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at_column();

-- Índice para busca por empresa
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_company_id ON public.marketing_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_strategies_campaign_id ON public.strategies(campaign_id);
