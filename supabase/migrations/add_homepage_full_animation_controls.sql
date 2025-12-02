-- Adicionar campos de controle para TODAS as animações da homepage

-- Gradiente (mouse-following)
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS gradient_opacity NUMERIC DEFAULT 0.4;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS gradient_mouse_sensitivity NUMERIC DEFAULT 50;

-- Grid de fundo
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS enable_grid BOOLEAN DEFAULT true;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS grid_opacity NUMERIC DEFAULT 0.2;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS grid_color TEXT DEFAULT '#FF6B35';

-- Esfera 3D
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS enable_sphere BOOLEAN DEFAULT true;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS sphere_opacity NUMERIC DEFAULT 0.3;
ALTER TABLE homepage_config ADD COLUMN IF NOT EXISTS sphere_rotation_speed NUMERIC DEFAULT 20;

-- Atualizar registros existentes
UPDATE homepage_config 
SET 
    gradient_opacity = COALESCE(gradient_opacity, 0.4),
    gradient_mouse_sensitivity = COALESCE(gradient_mouse_sensitivity, 50),
    enable_grid = COALESCE(enable_grid, true),
    grid_opacity = COALESCE(grid_opacity, 0.2),
    grid_color = COALESCE(grid_color, '#FF6B35'),
    enable_sphere = COALESCE(enable_sphere, true),
    sphere_opacity = COALESCE(sphere_opacity, 0.3),
    sphere_rotation_speed = COALESCE(sphere_rotation_speed, 20)
WHERE gradient_opacity IS NULL;
