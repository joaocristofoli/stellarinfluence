import { ThemePreset, AnimationConfig } from "@/types/themePreset";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface AnimationControlsProps {
    theme: ThemePreset;
    onChange: (theme: ThemePreset) => void;
}

export function AnimationControls({ theme, onChange }: AnimationControlsProps) {
    const config = theme.animation_config;
    const { toast } = useToast();

    const updateConfig = (updates: Partial<AnimationConfig>) => {
        onChange({
            ...theme,
            animation_config: {
                ...config,
                ...updates,
            },
        });
    };

    const updateNestedConfig = (key: keyof AnimationConfig, updates: any) => {
        updateConfig({
            [key]: {
                ...(config[key] as any),
                ...updates,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Global Enable/Disable */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div>
                    <Label className="text-base font-semibold">Animações Ativas</Label>
                    <p className="text-sm text-muted-foreground">
                        Ativar/Desativar todas as animações deste tema
                    </p>
                </div>
                <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                />
            </div>

            {config.enabled && (
                <Tabs defaultValue="particles" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="particles">Partículas</TabsTrigger>
                        <TabsTrigger value="colors">Cores</TabsTrigger>
                    </TabsList>

                    <TabsContent value="particles" className="space-y-6 mt-6">
                        {/* Bold/Lines */}
                        {config.lines && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Linhas (Bold)</h3>

                                <div>
                                    <Label>Quantidade: {config.lines.count}</Label>
                                    <Slider
                                        value={[config.lines.count]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('lines', { count: value })
                                        }
                                        min={5}
                                        max={30}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Velocidade (s): {config.lines.speed}</Label>
                                    <Slider
                                        value={[config.lines.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('lines', { speed: value })
                                        }
                                        min={1}
                                        max={5}
                                        step={0.5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.lines.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.lines.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('lines', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Glow (px): {config.lines.glow}</Label>
                                    <Slider
                                        value={[config.lines.glow]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('lines', { glow: value })
                                        }
                                        min={0}
                                        max={20}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Circles/Elegant */}
                        {config.circles && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Círculos (Elegant)</h3>

                                <div>
                                    <Label>Quantidade: {config.circles.count}</Label>
                                    <Slider
                                        value={[config.circles.count]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('circles', { count: value })
                                        }
                                        min={3}
                                        max={15}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Velocidade de Rotação (s): {config.circles.speed}</Label>
                                    <Slider
                                        value={[config.circles.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('circles', { speed: value })
                                        }
                                        min={10}
                                        max={40}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.circles.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.circles.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('circles', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bubbles/Minimal */}
                        {config.bubbles && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Bolhas (Minimal)</h3>

                                <div>
                                    <Label>Quantidade: {config.bubbles.count}</Label>
                                    <Slider
                                        value={[config.bubbles.count]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('bubbles', { count: value })
                                        }
                                        min={5}
                                        max={20}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Velocidade (s): {config.bubbles.speed}</Label>
                                    <Slider
                                        value={[config.bubbles.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('bubbles', { speed: value })
                                        }
                                        min={1}
                                        max={5}
                                        step={0.5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.bubbles.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.bubbles.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('bubbles', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Particles/Rock */}
                        {config.particles && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Faíscas (Rock)</h3>

                                <div>
                                    <Label>Quantidade: {config.particles.count}</Label>
                                    <Slider
                                        value={[config.particles.count]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('particles', { count: value })
                                        }
                                        min={10}
                                        max={50}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Velocidade (s): {config.particles.speed}</Label>
                                    <Slider
                                        value={[config.particles.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('particles', { speed: value })
                                        }
                                        min={1}
                                        max={8}
                                        step={0.5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.particles.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.particles.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('particles', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Grid/Gaming */}
                        {config.grid && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Grid (Tech/Gaming)</h3>

                                <div>
                                    <Label>Densidade</Label>
                                    <select
                                        value={config.grid.density}
                                        onChange={(e) =>
                                            updateNestedConfig('grid', { density: e.target.value })
                                        }
                                        className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2"
                                    >
                                        <option value="low">Baixa</option>
                                        <option value="medium">Média</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>

                                <div>
                                    <Label>Velocidade (s): {config.grid.speed}</Label>
                                    <Slider
                                        value={[config.grid.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('grid', { speed: value })
                                        }
                                        min={1}
                                        max={5}
                                        step={0.5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.grid.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.grid.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('grid', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Shapes/Lifestyle */}
                        {config.shapes && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Formas (Lifestyle)</h3>

                                <div>
                                    <Label>Quantidade: {config.shapes.count}</Label>
                                    <Slider
                                        value={[config.shapes.count]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('shapes', { count: value })
                                        }
                                        min={5}
                                        max={20}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Velocidade (s): {config.shapes.speed}</Label>
                                    <Slider
                                        value={[config.shapes.speed]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('shapes', { speed: value })
                                        }
                                        min={1}
                                        max={8}
                                        step={0.5}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Opacidade: {Math.round(config.shapes.opacity * 100)}%</Label>
                                    <Slider
                                        value={[config.shapes.opacity * 100]}
                                        onValueChange={([value]) =>
                                            updateNestedConfig('shapes', { opacity: value / 100 })
                                        }
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="colors" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Cores das Animações</h3>
                            <button
                                onClick={() => {
                                    // Sync animation colors with theme colors (if they exist)
                                    const newColors = { ...config.colors };
                                    // This is a placeholder - actual theme colors would come from parent
                                    toast({
                                        title: "💡 Dica",
                                        description: "As cores das animações são independentes das cores do tema para máxima flexibilidade.",
                                    });
                                }}
                                className="text-xs px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            >
                                ℹ️ Cores Independentes
                            </button>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground mb-4">
                            <p className="font-medium mb-1">📝 Nota:</p>
                            <p>As cores das animações são configuradas separadamente das cores do tema para permitir controle total sobre o design.</p>
                        </div>

                        {config.colors.primary !== undefined && (
                            <div>
                                <Label>Cor Primária da Animação</Label>
                                <Input
                                    type="color"
                                    value={config.colors.primary}
                                    onChange={(e) =>
                                        updateConfig({
                                            colors: { ...config.colors, primary: e.target.value },
                                        })
                                    }
                                    className="h-12 mt-2"
                                />
                            </div>
                        )}

                        {config.colors.secondary !== undefined && (
                            <div>
                                <Label>Cor Secundária da Animação</Label>
                                <Input
                                    type="color"
                                    value={config.colors.secondary}
                                    onChange={(e) =>
                                        updateConfig({
                                            colors: { ...config.colors, secondary: e.target.value },
                                        })
                                    }
                                    className="h-12 mt-2"
                                />
                            </div>
                        )}

                        {config.colors.fire !== undefined && (
                            <div>
                                <Label>Cor do Fogo</Label>
                                <Input
                                    type="color"
                                    value={config.colors.fire}
                                    onChange={(e) =>
                                        updateConfig({
                                            colors: { ...config.colors, fire: e.target.value },
                                        })
                                    }
                                    className="h-12 mt-2"
                                />
                            </div>
                        )}

                        {config.colors.accent !== undefined && (
                            <div>
                                <Label>Cor de Destaque</Label>
                                <Input
                                    type="color"
                                    value={config.colors.accent}
                                    onChange={(e) =>
                                        updateConfig({
                                            colors: { ...config.colors, accent: e.target.value },
                                        })
                                    }
                                    className="h-12 mt-2"
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
