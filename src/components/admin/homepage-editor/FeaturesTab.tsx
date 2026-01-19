import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { HomepageConfig } from '@/types/homepageConfig';

interface FeaturesTabProps {
    config: HomepageConfig;
    onConfigChange: (config: Partial<HomepageConfig>) => void;
}

/**
 * FeatureSection - Reusable toggle section with child controls
 */
interface FeatureSectionProps {
    title: string;
    emoji: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children?: React.ReactNode;
}

function FeatureSection({ title, emoji, description, enabled, onToggle, children }: FeatureSectionProps) {
    return (
        <div className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-base font-semibold">{emoji} {title}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>

            {enabled && children && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    {children}
                </div>
            )}
        </div>
    );
}

/**
 * FeaturesTab - Editor for homepage visual features/animations
 * 
 * @description
 * Manages all toggle-able visual features:
 * - Floating particles
 * - Holographic gradient
 * - Background grid
 * - 3D Sphere
 * - Scroll indicator
 */
export function FeaturesTab({ config, onConfigChange }: FeaturesTabProps) {
    const handleChange = (updates: Partial<HomepageConfig>) => {
        onConfigChange(updates);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-1">🎨 Controle Todas as Animações</p>
                <p className="text-xs text-muted-foreground">
                    Configure cada detalhe das animações da página inicial
                </p>
            </div>

            {/* Floating Particles */}
            <FeatureSection
                title="Partículas Flutuantes"
                emoji="✨"
                description="Pequenos pontos animados (as que você gosta)"
                enabled={config.enable_particle_animation}
                onToggle={(checked) => handleChange({ enable_particle_animation: checked })}
            >
                <div>
                    <Label className="text-sm">Quantidade: {config.particle_count}</Label>
                    <Slider
                        value={[config.particle_count]}
                        onValueChange={([value]) => handleChange({ particle_count: value })}
                        min={5}
                        max={20}
                        step={1}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-sm">Velocidade: {config.particle_speed.toFixed(1)}s</Label>
                    <Slider
                        value={[config.particle_speed]}
                        onValueChange={([value]) => handleChange({ particle_speed: value })}
                        min={3}
                        max={10}
                        step={0.5}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-sm">Opacidade: {Math.round((config.particle_opacity || 1) * 100)}%</Label>
                    <Slider
                        value={[(config.particle_opacity || 1) * 100]}
                        onValueChange={([value]) => handleChange({ particle_opacity: value / 100 })}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-sm">Cor</Label>
                    <Input
                        type="color"
                        value={config.particle_color || '#F7B801'}
                        onChange={(e) => handleChange({ particle_color: e.target.value })}
                        className="h-12 mt-2"
                    />
                </div>
            </FeatureSection>

            {/* Holographic Gradient */}
            <FeatureSection
                title="Gradiente Holográfico"
                emoji="🌈"
                description="O que segue o mouse (ajuste a sensibilidade)"
                enabled={config.enable_gradient_animation}
                onToggle={(checked) => handleChange({ enable_gradient_animation: checked })}
            >
                <div>
                    <Label className="text-sm">Sensibilidade ao Mouse: {config.gradient_mouse_sensitivity || 50}%</Label>
                    <Slider
                        value={[config.gradient_mouse_sensitivity || 50]}
                        onValueChange={([value]) => handleChange({ gradient_mouse_sensitivity: value })}
                        min={10}
                        max={100}
                        step={5}
                        className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Menor = mais suave, Maior = mais responsivo
                    </p>
                </div>

                <div>
                    <Label className="text-sm">Opacidade: {Math.round((config.gradient_opacity || 0.4) * 100)}%</Label>
                    <Slider
                        value={[(config.gradient_opacity || 0.4) * 100]}
                        onValueChange={([value]) => handleChange({ gradient_opacity: value / 100 })}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                    />
                </div>
            </FeatureSection>

            {/* Background Grid */}
            <FeatureSection
                title="Grid de Fundo"
                emoji="📐"
                description="Linhas de grade decorativas"
                enabled={config.enable_grid !== false}
                onToggle={(checked) => handleChange({ enable_grid: checked })}
            >
                <div>
                    <Label className="text-sm">Opacidade: {Math.round((config.grid_opacity || 0.2) * 100)}%</Label>
                    <Slider
                        value={[(config.grid_opacity || 0.2) * 100]}
                        onValueChange={([value]) => handleChange({ grid_opacity: value / 100 })}
                        min={0}
                        max={50}
                        step={5}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-sm">Cor</Label>
                    <Input
                        type="color"
                        value={config.grid_color || '#FF6B35'}
                        onChange={(e) => handleChange({ grid_color: e.target.value })}
                        className="h-12 mt-2"
                    />
                </div>
            </FeatureSection>

            {/* 3D Sphere */}
            <FeatureSection
                title="Esfera 3D"
                emoji="🔮"
                description="Elemento decorativo central"
                enabled={config.enable_sphere !== false}
                onToggle={(checked) => handleChange({ enable_sphere: checked })}
            >
                <div>
                    <Label className="text-sm">Velocidade de Rotação: {config.sphere_rotation_speed || 20}s</Label>
                    <Slider
                        value={[config.sphere_rotation_speed || 20]}
                        onValueChange={([value]) => handleChange({ sphere_rotation_speed: value })}
                        min={5}
                        max={40}
                        step={5}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-sm">Opacidade: {Math.round((config.sphere_opacity || 0.3) * 100)}%</Label>
                    <Slider
                        value={[(config.sphere_opacity || 0.3) * 100]}
                        onValueChange={([value]) => handleChange({ sphere_opacity: value / 100 })}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                    />
                </div>
            </FeatureSection>

            {/* Scroll Indicator - simple toggle, no children */}
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-base font-semibold">⬇️ Indicador de Scroll</Label>
                    <p className="text-xs text-muted-foreground">Mouse scroll animado</p>
                </div>
                <Switch
                    checked={config.enable_scroll_indicator}
                    onCheckedChange={(checked) => handleChange({ enable_scroll_indicator: checked })}
                />
            </div>
        </div>
    );
}

export default FeaturesTab;
