-- Migration: Advanced Project Management Features - PARTE 2
-- Execute esta parte DEPOIS da parte 1

-- =====================================================
-- Habilitar RLS
-- =====================================================
ALTER TABLE public.strategy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas de acesso público - strategy_tasks
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view strategy_tasks" ON public.strategy_tasks;
DROP POLICY IF EXISTS "Anyone can create strategy_tasks" ON public.strategy_tasks;
DROP POLICY IF EXISTS "Anyone can update strategy_tasks" ON public.strategy_tasks;
DROP POLICY IF EXISTS "Anyone can delete strategy_tasks" ON public.strategy_tasks;

CREATE POLICY "Anyone can view strategy_tasks" ON public.strategy_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create strategy_tasks" ON public.strategy_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update strategy_tasks" ON public.strategy_tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete strategy_tasks" ON public.strategy_tasks FOR DELETE USING (true);

-- =====================================================
-- Políticas de acesso público - activity_logs
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Anyone can create activity_logs" ON public.activity_logs;

CREATE POLICY "Anyone can view activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- =====================================================
-- Políticas de acesso público - notifications
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON public.notifications;

CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifications" ON public.notifications FOR DELETE USING (true);

-- =====================================================
-- Índices para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_strategy_tasks_strategy_id ON public.strategy_tasks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
