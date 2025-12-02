import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemePreset {
    id: string;
    theme_key: string;
    theme_name: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    enable_animated_background: boolean;
    background_blur: number;
    background_opacity: number;
}

export function ThemeManager() {
    const { toast } = useToast();
    const [themes, setThemes] = useState<ThemePreset[]>([]);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState<string | null>(null);

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        const { data, error } = await supabase
            .from('theme_presets' as any)
            .select('*')
            .order('theme_key');

        if (error) {
            toast({
                title: "Erro ao carregar temas",
                description: error.message,
                variant: "destructive",
            });
        } else if (data) {
            setThemes(data as unknown as ThemePreset[]);
        }
    };

    const updateTheme = async (themeId: string, updates: Partial<ThemePreset>) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('theme_presets' as any)
                .update(updates)
                .eq('id', themeId);

            if (error) throw error;

            toast({
                title: "Tema atualizado!",
                description: "As alterações foram salvas com sucesso.",
            });

            fetchThemes();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const applyThemeToAllCreators = async (themeKey: string) => {
        setApplying(themeKey);
        try {
            // Get the theme preset
            const theme = themes.find(t => t.theme_key === themeKey);
            if (!theme) throw new Error("Tema não encontrado");

            // Get all creators using this theme
            const { data: creators, error: fetchError } = await supabase
                .from('creators')
                .select('id, landing_theme')
                .eq('landing_theme->>layout', themeKey);

            if (fetchError) throw fetchError;

            if (!creators || creators.length === 0) {
                toast({
                    title: "Nenhum criador encontrado",
                    description: `Nenhum criador está usando o tema "${theme.theme_name}".`,
                });
                return;
            }

            // Update each creator
            const updates = creators.map(creator => {
                const currentTheme = creator.landing_theme as any || {};
                return supabase
                    .from('creators')
                    .update({
                        landing_theme: {
                            ...currentTheme,
                            primaryColor: theme.primary_color,
                            secondaryColor: theme.secondary_color,
                            backgroundColor: theme.background_color,
                            textColor: theme.text_color,
                            fontFamily: theme.font_family,
                            enableAnimatedBackground: theme.enable_animated_background,
                            backgroundBlur: theme.background_blur,
                            backgroundOpacity: theme.background_opacity,
                            layout: themeKey,
                        }
                    })
                    .eq('id', creator.id);
            });

            await Promise.all(updates);

            toast({
                title: "Tema aplicado!",
                description: `O tema "${theme.theme_name}" foi aplicado a ${creators.length} criador(es).`,
            });
        } catch (error: any) {
            toast({
                title: "Erro ao aplicar tema",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setApplying(null);
        }
    };

    const handleColorChange = (themeId: string, field: keyof ThemePreset, value: any) => {
        setThemes(prev => prev.map(t =>
            t.id === themeId ? { ...t, [field]: value } : t
        ));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Gerenciador de Temas
                    </CardTitle>
                    <CardDescription>
                        Personalize todos os temas disponíveis para os criadores. Você pode aplicar as alterações a todos os criadores que usam cada tema.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue={themes[0]?.theme_key} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    {themes.map(theme => (
                        <TabsTrigger key={theme.theme_key} value={theme.theme_key}>
                            {theme.theme_name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {themes.map(theme => (
                    <TabsContent key={theme.theme_key} value={theme.theme_key}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{theme.theme_name}</CardTitle>
                                <CardDescription>
                                    Personalize as cores e tipografia deste tema
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Color Pickers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cor Primária</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={theme.primary_color}
                                                onChange={e => handleColorChange(theme.id, 'primary_color', e.target.value)}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={theme.primary_color}
                                                onChange={e => handleColorChange(theme.id, 'primary_color', e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cor Secundária</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={theme.secondary_color}
                                                onChange={e => handleColorChange(theme.id, 'secondary_color', e.target.value)}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={theme.secondary_color}
                                                onChange={e => handleColorChange(theme.id, 'secondary_color', e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cor de Fundo</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={theme.background_color}
                                                onChange={e => handleColorChange(theme.id, 'background_color', e.target.value)}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={theme.background_color}
                                                onChange={e => handleColorChange(theme.id, 'background_color', e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cor do Texto</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={theme.text_color}
                                                onChange={e => handleColorChange(theme.id, 'text_color', e.target.value)}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={theme.text_color}
                                                onChange={e => handleColorChange(theme.id, 'text_color', e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fonte</Label>
                                        <Input
                                            type="text"
                                            value={theme.font_family}
                                            onChange={e => handleColorChange(theme.id, 'font_family', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t col-span-full">
                                        <h4 className="font-medium">Configurações de Fundo</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <Label>Animar Fundo</Label>
                                                <input
                                                    type="checkbox"
                                                    checked={theme.enable_animated_background}
                                                    onChange={e => handleColorChange(theme.id, 'enable_animated_background', e.target.checked)}
                                                    className="w-5 h-5 accent-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Desfoque ({theme.background_blur || 0}px)</Label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="50"
                                                    value={theme.background_blur || 0}
                                                    onChange={e => handleColorChange(theme.id, 'background_blur', parseInt(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Opacidade ({Math.round((theme.background_opacity || 1) * 100)}%)</Label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={theme.background_opacity || 1}
                                                    onChange={e => handleColorChange(theme.id, 'background_opacity', parseFloat(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div
                                    className="p-8 rounded-lg border-2 transition-all"
                                    style={{
                                        backgroundColor: theme.background_color,
                                        borderColor: theme.primary_color,
                                        color: theme.text_color,
                                        fontFamily: theme.font_family,
                                    }}
                                >
                                    <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primary_color }}>
                                        Preview do Tema
                                    </h3>
                                    <p className="mb-4">Este é um texto de exemplo usando a cor padrão.</p>
                                    <button
                                        className="px-4 py-2 rounded font-semibold"
                                        style={{
                                            backgroundColor: theme.primary_color,
                                            color: theme.background_color,
                                        }}
                                    >
                                        Botão Primário
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded font-semibold ml-2"
                                        style={{
                                            backgroundColor: theme.secondary_color,
                                            color: theme.text_color,
                                        }}
                                    >
                                        Botão Secundário
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => updateTheme(theme.id, theme)}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Salvar Alterações
                                    </Button>
                                    <Button
                                        onClick={() => applyThemeToAllCreators(theme.theme_key)}
                                        disabled={applying === theme.theme_key}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {applying === theme.theme_key ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        Aplicar a Todos os Criadores
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div >
    );
}
