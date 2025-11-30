-- Migration: add youtube_subscribers column to creators table
-- Run this script in Supabase SQL editor or as part of migration pipeline

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS youtube_subscribers BIGINT;
