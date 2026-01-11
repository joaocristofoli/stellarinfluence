-- Migration: Advanced Project Management Features
-- Sub-tarefas, logs de atividade, notificações e conexão com creators

-- =====================================================
-- 1. Sub-tarefas dentro de cada estratégia
-- =====================================================
CREATE TABLE IF NOT EXISTS public.strategy_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  assigned_to TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. Log de atividades (histórico de mudanças)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'strategy', 'company', 'task'
  entity_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed', 'task_completed'
  field_changed TEXT, -- campo que foi alterado
  old_value TEXT,
  new_value TEXT,
  user_name TEXT DEFAULT 'Sistema',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. Sistema de Notificações
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  entity_type TEXT, -- 'strategy', 'company', 'task'
  entity_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. Adicionar campo de creators atribuídos nas strategies
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'strategies' AND column_name = 'assigned_creators') THEN
    ALTER TABLE public.strategies ADD COLUMN assigned_creators UUID[] DEFAULT '{}';
  END IF;
END $$;

-- =====================================================
-- 5. Habilitar RLS
-- =====================================================
ALTER TABLE public.strategy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Políticas de acesso público
-- =====================================================
-- strategy_tasks
CREATE POLICY "Anyone can view strategy_tasks" ON public.strategy_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create strategy_tasks" ON public.strategy_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update strategy_tasks" ON public.strategy_tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete strategy_tasks" ON public.strategy_tasks FOR DELETE USING (true);

-- activity_logs
CREATE POLICY "Anyone can view activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- notifications
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifications" ON public.notifications FOR DELETE USING (true);

-- =====================================================
-- 7. Triggers para updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_strategy_tasks_updated_at ON public.strategy_tasks;
CREATE TRIGGER update_strategy_tasks_updated_at
  BEFORE UPDATE ON public.strategy_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at_column();

-- =====================================================
-- 8. Índices para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_strategy_id ON public.strategy_tasks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_company ON public.activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON public.notifications(company_id);
