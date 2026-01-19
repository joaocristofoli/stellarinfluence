-- Migration: Calendário Unificado - Tabela de Tarefas de Estratégia
-- Permite dividir uma estratégia em tarefas específicas por dia
-- com atribuição individual para influenciadores

-- Tabela para tarefas granulares de estratégia
CREATE TABLE IF NOT EXISTS public.strategy_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
    task_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_time TIME,
    end_time TIME,
    cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_strategy ON public.strategy_tasks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_date ON public.strategy_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_creator ON public.strategy_tasks(assigned_creator_id);

-- Habilitar RLS
ALTER TABLE public.strategy_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (mesma abordagem das outras tabelas)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can view strategy_tasks" ON public.strategy_tasks FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can create strategy_tasks" ON public.strategy_tasks FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can update strategy_tasks" ON public.strategy_tasks FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete strategy_tasks' AND tablename = 'strategy_tasks') THEN
    CREATE POLICY "Anyone can delete strategy_tasks" ON public.strategy_tasks FOR DELETE USING (true);
  END IF;
END $$;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_strategy_tasks_updated_at ON public.strategy_tasks;
CREATE TRIGGER update_strategy_tasks_updated_at
  BEFORE UPDATE ON public.strategy_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at_column();

COMMENT ON TABLE public.strategy_tasks IS 'Tarefas granulares de uma estratégia de marketing, com suporte a atribuição por influenciador e datas específicas';
