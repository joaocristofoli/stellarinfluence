-- Add base_url column to platform_settings
ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS base_url text;

-- Update existing rows with default base URLs
UPDATE public.platform_settings SET base_url = 'https://instagram.com/' WHERE platform = 'instagram';
UPDATE public.platform_settings SET base_url = 'https://youtube.com/@' WHERE platform = 'youtube';
UPDATE public.platform_settings SET base_url = 'https://tiktok.com/@' WHERE platform = 'tiktok';
UPDATE public.platform_settings SET base_url = 'https://twitter.com/' WHERE platform = 'twitter';
UPDATE public.platform_settings SET base_url = 'https://kwai.com/@' WHERE platform = 'kwai';