-- Migration: add unique constraint to user_id in creators table
-- This is required for .upsert({ onConflict: 'user_id' }) to work

ALTER TABLE public.creators
ADD CONSTRAINT creators_user_id_key UNIQUE (user_id);
