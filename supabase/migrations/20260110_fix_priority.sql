-- Fix: Adicionar coluna priority que está faltando
ALTER TABLE public.strategy_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
