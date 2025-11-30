-- Migration: add Kwai related columns to creators table
-- Run this script in Supabase SQL editor or as part of migration pipeline

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS kwai_followers BIGINT,
ADD COLUMN IF NOT EXISTS kwai_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kwai_url TEXT;
