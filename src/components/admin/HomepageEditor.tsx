import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageConfig } from "@/types/homepageConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ParticleBackground } from "./ParticleBackground";

export const HomepageEditor = forwardRef((props, ref) => {
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobilePreview, setIsMobilePreview] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadConfig();
    }, []);

    useImperativeHandle(ref, () => ({
        save: handleSave
    }));

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('homepage_config')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error) throw error;
            setConfig(data);
        } catch (error) {
            console.error('Error loading homepage config:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as configurações.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        try {
            const { error } = await supabase
                .from('homepage_config')
                .update({
                    ...config,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', config.id);

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Configurações da homepage salvas.",
            });
        } catch (error) {
            console.error('Error saving homepage config:', error);
            toast({
                title: "Erro",
                description: "Erro ao salvar configurações.",
                variant: "destructive",
            });
        }
    };

    const handleReset = () => {
        loadConfig();
        toast({
            title: "Resetado",
            description: "Configurações restauradas.",
        });
    };

    if (loading) {
        return <div className="p-8">Carregando configurações...</div>;
    }

    if (!config) {
        return <div className="p-8">Nenhuma configuração encontrada.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Editor da Homepage</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Personalize a página inicial da agência
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Resetar
                    </Button>
                </div>
            </div>

            {/* 2 Column Layout: Controls | Preview */}
            <div className="grid grid-cols-12 gap-4">
                {/* Column 1: Configuration Controls */}
                <div className="col-span-6">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Configurações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="text" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="text">Textos</TabsTrigger>
                                    <TabsTrigger value="colors">Cores</TabsTrigger>
                                    <TabsTrigger value="features">Features</TabsTrigger>
                                </TabsList>

                                <TabsContent value="text" className="space-y-4 mt-4 max-h-[500px] overflow-y-auto">
                                    <div>
                                        <Label className="text-sm">Badge (topo)</Label>
                                        <Input
                                            value={config.hero_badge_text}
                                            onChange={(e) =>
                                                setConfig({ ...config, hero_badge_text: e.target.value })
                                            }
                                            placeholder="A Nova Era do Marketing Digital"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">Título - Linha 1</Label>
                                        <Input
                                            value={config.hero_title_line1}
                                            onChange={(e) =>
                                                setConfig({ ...config, hero_title_line1: e.target.value })
                                            }
                                            placeholder="CONECTAMOS"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">Título - Linha 2 (Destaque)</Label>
                                        <Input
                                            value={config.hero_title_line2}
                                            onChange={(e) =>
                                                setConfig({ ...config, hero_title_line2: e.target.value })
                                            }
                                            placeholder="CRIADORES"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">Título - Linha 3</Label>
                                        <Input
                                            value={config.hero_title_line3}
                                            onChange={(e) =>
                                                setConfig({ ...config, hero_title_line3: e.target.value })
                                            }
                                            placeholder="AO FUTURO"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">Subtítulo</Label>
                                        <Textarea
                                            value={config.hero_subtitle}
                                            onChange={(e) =>
                                                setConfig({ ...config, hero_subtitle: e.target.value })
                                            }
                                            placeholder="Plataforma premium que transforma marcas em fenômenos digitais"
                                            rows={2}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm">Botão Primário</Label>
                                            <Input
                                                value={config.cta_primary_text}
                                                onChange={(e) =>
                                                    setConfig({ ...config, cta_primary_text: e.target.value })
                                                }
                                                placeholder="Começar Agora"
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-sm">Botão Secundário</Label>
                                            <Input
                                                value={config.cta_secondary_text}
                                                onChange={(e) =>
                                                    setConfig({ ...config, cta_secondary_text: e.target.value })
                                                }
                                                placeholder="Ver Criadores"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="colors" className="space-y-4 mt-4">
                                    <div>
                                        <Label className="text-sm">Cor Primária (Laranja)</Label>
                                        <Input
                                            type="color"
                                            value={config.primary_color}
                                            onChange={(e) =>
                                                setConfig({ ...config, primary_color: e.target.value })
                                            }
                                            className="h-12 mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Usada no gradiente principal e destaques
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm">Cor Secundária (Roxo)</Label>
                                        <Input
                                            type="color"
                                            value={config.secondary_color}
                                            onChange={(e) =>
                                                setConfig({ ...config, secondary_color: e.target.value })
                                            }
                                            className="h-12 mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Usada no gradiente e efeitos secundários
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm">Cor de Acento (Amarelo)</Label>
                                        <Input
                                            type="color"
                                            value={config.accent_color}
                                            onChange={(e) =>
                                                setConfig({ ...config, accent_color: e.target.value })
                                            }
                                            className="h-12 mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Usada no gradiente do título "CRIADORES"
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="features" className="space-y-6 mt-4 max-h-[500px] overflow-y-auto">
                                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                        <p className="text-sm font-medium mb-1">🎨 Controle Todas as Animações</p>
                                        <p className="text-xs text-muted-foreground">
                                            Configure cada detalhe das animações da página inicial
                                        </p>
                                    </div>

                                    {/* Partículas Flutuantes */}
                                    <div className="space-y-4 border-b pb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-semibold">✨ Partículas Flutuantes</Label>
                                                <p className="text-xs text-muted-foreground">Pequenos pontos animados (as que você gosta)</p>
                                            </div>
                                            <Switch
                                                checked={config.enable_particle_animation}
                                                onCheckedChange={(checked) =>
                                                    setConfig({ ...config, enable_particle_animation: checked })
                                                }
                                            />
                                        </div>

                                        {config.enable_particle_animation && (
                                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                <div>
                                                    <Label className="text-sm">Quantidade: {config.particle_count}</Label>
                                                    <Slider
                                                        value={[config.particle_count]}
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, particle_count: value })
                                                        }
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
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, particle_speed: value })
                                                        }
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
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, particle_opacity: value / 100 })
                                                        }
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
                                                        onChange={(e) =>
                                                            setConfig({ ...config, particle_color: e.target.value })
                                                        }
                                                        className="h-12 mt-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gradiente Holográfico */}
                                    <div className="space-y-4 border-b pb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-semibold">🌈 Gradiente Holográfico</Label>
                                                <p className="text-xs text-muted-foreground">O que segue o mouse (ajuste a sensibilidade)</p>
                                            </div>
                                            <Switch
                                                checked={config.enable_gradient_animation}
                                                onCheckedChange={(checked) =>
                                                    setConfig({ ...config, enable_gradient_animation: checked })
                                                }
                                            />
                                        </div>

                                        {config.enable_gradient_animation && (
                                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                <div>
                                                    <Label className="text-sm">Sensibilidade ao Mouse: {config.gradient_mouse_sensitivity || 50}%</Label>
                                                    <Slider
                                                        value={[config.gradient_mouse_sensitivity || 50]}
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, gradient_mouse_sensitivity: value })
                                                        }
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
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, gradient_opacity: value / 100 })
                                                        }
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Grid de Fundo */}
                                    <div className="space-y-4 border-b pb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-semibold">📐 Grid de Fundo</Label>
                                                <p className="text-xs text-muted-foreground">Linhas de grade decorativas</p>
                                            </div>
                                            <Switch
                                                checked={config.enable_grid || true}
                                                onCheckedChange={(checked) =>
                                                    setConfig({ ...config, enable_grid: checked })
                                                }
                                            />
                                        </div>

                                        {config.enable_grid !== false && (
                                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                <div>
                                                    <Label className="text-sm">Opacidade: {Math.round((config.grid_opacity || 0.2) * 100)}%</Label>
                                                    <Slider
                                                        value={[(config.grid_opacity || 0.2) * 100]}
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, grid_opacity: value / 100 })
                                                        }
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
                                                        onChange={(e) =>
                                                            setConfig({ ...config, grid_color: e.target.value })
                                                        }
                                                        className="h-12 mt-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Esfera 3D */}
                                    <div className="space-y-4 border-b pb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-semibold">🔮 Esfera 3D</Label>
                                                <p className="text-xs text-muted-foreground">Elemento decorativo central</p>
                                            </div>
                                            <Switch
                                                checked={config.enable_sphere || true}
                                                onCheckedChange={(checked) =>
                                                    setConfig({ ...config, enable_sphere: checked })
                                                }
                                            />
                                        </div>

                                        {config.enable_sphere !== false && (
                                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                <div>
                                                    <Label className="text-sm">Velocidade de Rotação: {config.sphere_rotation_speed || 20}s</Label>
                                                    <Slider
                                                        value={[config.sphere_rotation_speed || 20]}
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, sphere_rotation_speed: value })
                                                        }
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
                                                        onValueChange={([value]) =>
                                                            setConfig({ ...config, sphere_opacity: value / 100 })
                                                        }
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scroll Indicator */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold">⬇️ Indicador de Scroll</Label>
                                            <p className="text-xs text-muted-foreground">Mouse scroll animado</p>
                                        </div>
                                        <Switch
                                            checked={config.enable_scroll_indicator}
                                            onCheckedChange={(checked) =>
                                                setConfig({ ...config, enable_scroll_indicator: checked })
                                            }
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Live Preview */}
                <div className="col-span-6">
                    <Card className="h-full sticky top-4">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Preview ao Vivo</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant={!isMobilePreview ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsMobilePreview(false)}
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={isMobilePreview ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsMobilePreview(true)}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <div
                                    className={`relative rounded-lg overflow-hidden border bg-black transition-all duration-300 ${isMobilePreview ? 'w-[375px] h-[500px]' : 'w-full h-[500px]'
                                        }`}
                                    style={{
                                        boxShadow: isMobilePreview ? '0 20px 50px -10px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    {/* Particles Animation */}
                                    {config.enable_particle_animation && config.background_type === 'particles' && (
                                        <ParticleBackground
                                            count={config.particle_count}
                                            size={config.particle_size}
                                            speed={config.particle_speed}
                                            opacity={config.particle_opacity}
                                            color={config.particle_color}
                                        />
                                    )}

                                    {/* Background gradient */}
                                    {config.background_type === 'gradient' && config.enable_gradient_animation && (
                                        <div
                                            className="absolute inset-0 opacity-30 animate-pulse"
                                            style={{
                                                background: `radial-gradient(circle at 30% 20%, ${config.primary_color}40, transparent 50%), radial-gradient(circle at 70% 80%, ${config.secondary_color}40, transparent 50%)`,
                                                animation: `pulse ${config.gradient_speed}s ease-in-out infinite`
                                            }}
                                        />
                                    )}

                                    {/* Default gradient background (always visible but subtle) */}
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            background: `radial-gradient(circle at 30% 20%, ${config.primary_color}30, transparent 50%), radial-gradient(circle at 70% 80%, ${config.secondary_color}30, transparent 50%)`
                                        }}
                                    />

                                    {/* Simulated Hero Preview */}
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                                        <div className="mb-4">
                                            <span
                                                className="inline-block px-4 py-1.5 rounded-full text-xs font-medium"
                                                style={{
                                                    background: `linear-gradient(90deg, ${config.primary_color}20, ${config.secondary_color}20)`,
                                                    border: `1px solid ${config.primary_color}40`,
                                                    color: config.primary_color
                                                }}
                                            >
                                                {config.hero_badge_text}
                                            </span>
                                        </div>

                                        <h1 className={`font-bold text-white mb-4 ${isMobilePreview ? 'text-3xl' : 'text-5xl'}`}>
                                            <div>{config.hero_title_line1}</div>
                                            <div
                                                className="bg-clip-text text-transparent"
                                                style={{
                                                    backgroundImage: `linear-gradient(90deg, ${config.primary_color}, ${config.accent_color}, ${config.secondary_color})`
                                                }}
                                            >
                                                {config.hero_title_line2}
                                            </div>
                                            <div>{config.hero_title_line3}</div>
                                        </h1>

                                        <p className={`text-white/70 mb-6 max-w-2xl ${isMobilePreview ? 'text-sm' : 'text-base'}`}>
                                            {config.hero_subtitle}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                className="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
                                                style={{
                                                    background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
                                                }}
                                            >
                                                {config.cta_primary_text}
                                            </button>
                                            <button
                                                className="px-6 py-2.5 rounded-lg text-white font-medium border text-sm"
                                                style={{ borderColor: config.primary_color + '40' }}
                                            >
                                                {config.cta_secondary_text}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
});
