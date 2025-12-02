-- ADICIONAR COLUNAS FALTANTES À TABELA homepage_config
-- Este script adiciona as colunas de animação caso não existam

-- Adicionar colunas de partículas
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS particle_count INTEGER DEFAULT 50;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS particle_size INTEGER DEFAULT 4;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS particle_speed NUMERIC DEFAULT 1.0;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS particle_opacity NUMERIC DEFAULT 0.6;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS particle_color TEXT DEFAULT '#FF6B35';

-- Adicionar colunas de gradiente
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS gradient_speed NUMERIC DEFAULT 3.0;

-- Adicionar tipo de background
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'particles';

-- Atualizar registros existentes com valores padrão (se necessário)
UPDATE homepage_config 
SET 
    particle_count = COALESCE(particle_count, 50),
    particle_size = COALESCE(particle_size, 4),
    particle_speed = COALESCE(particle_speed, 1.0),
    particle_opacity = COALESCE(particle_opacity, 0.6),
    particle_color = COALESCE(particle_color, '#FF6B35'),
    gradient_speed = COALESCE(gradient_speed, 3.0),
    background_type = COALESCE(background_type, 'particles')
WHERE particle_count IS NULL 
   OR particle_size IS NULL 
   OR particle_speed IS NULL 
   OR particle_opacity IS NULL 
   OR particle_color IS NULL
   OR gradient_speed IS NULL
   OR background_type IS NULL;
