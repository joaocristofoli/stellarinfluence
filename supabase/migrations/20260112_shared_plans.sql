-- Tabela de planejamentos compartilhados
-- Links expiram após 24 horas

CREATE TABLE IF NOT EXISTS public.shared_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_data JSONB NOT NULL,  -- Snapshot da empresa no momento do compartilhamento
  strategies_data JSONB NOT NULL,  -- Snapshot das estratégias
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,  -- 24h após criação
  views INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.shared_plans ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura (qualquer um pode visualizar se tiver o link)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view shared_plans' AND tablename = 'shared_plans') THEN
    CREATE POLICY "Anyone can view shared_plans" ON public.shared_plans FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create shared_plans' AND tablename = 'shared_plans') THEN
    CREATE POLICY "Anyone can create shared_plans" ON public.shared_plans FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update shared_plans views' AND tablename = 'shared_plans') THEN
    CREATE POLICY "Anyone can update shared_plans views" ON public.shared_plans FOR UPDATE USING (true);
  END IF;
END $$;

-- Índice para busca por ID e limpeza de expirados
CREATE INDEX IF NOT EXISTS idx_shared_plans_expires_at ON public.shared_plans(expires_at);

-- Função para limpar links expirados (pode ser chamada por cron ou manualmente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_plans()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shared_plans WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
