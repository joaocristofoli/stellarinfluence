import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemePreset } from "@/types/themePreset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Save, X, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimationControls } from "./AnimationControls";
import { ThemePreview } from "./ThemePreview";

export function ThemeConfigManager() {
    const [themes, setThemes] = useState<ThemePreset[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            const { data, error } = await supabase
                .from('theme_presets')
                .select('*')
                .order('layout_type');

            if (error) throw error;
            setThemes(data || []);
        } catch (error) {
            console.error('Error loading themes:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os temas.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTheme = async () => {
        if (!selectedTheme) return;

        try {
            const { error } = await supabase
                .from('theme_presets')
                .update({
                    animation_config: selectedTheme.animation_config,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedTheme.id);

            if (error) throw error;

            // Update themes list to reflect changes
            setThemes(prevThemes =>
                prevThemes.map(t =>
                    t.id === selectedTheme.id ? selectedTheme : t
                )
            );

            toast({
                title: "✅ Salvo!",
                description: "Tema atualizado com sucesso.",
            });
        } catch (error) {
            console.error('Error saving theme:', error);
            toast({
                title: "Erro",
                description: "Erro ao salvar tema.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-8">Carregando temas...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configurações de Temas</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Personalize as animações de fundo para cada tipo de tema
                    </p>
                </div>
            </div>

            {/* 3 Column Layout */}
            <div className="grid grid-cols-12 gap-4 min-h-[700px]">
                {/* Column 1: Theme List (Sidebar) */}
                <div className="col-span-3 space-y-2">
                    <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase">
                        Temas Disponíveis
                    </h2>
                    {themes.map((theme) => (
                        <Card
                            key={theme.id}
                            className={`cursor-pointer transition-all hover:border-primary ${selectedTheme?.id === theme.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'hover:bg-accent/5'
                                }`}
                            onClick={() => setSelectedTheme(theme)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{theme.name}</p>
                                    {theme.is_default && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            Padrão
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {theme.layout_type}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Column 2: Configuration Controls */}
                {selectedTheme && (
                    <div className="col-span-5">
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    {selectedTheme.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                                <AnimationControls
                                    theme={selectedTheme}
                                    onChange={(updatedTheme) => setSelectedTheme(updatedTheme)}
                                />

                                <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-card">
                                    <Button
                                        onClick={() => handleSaveTheme()}
                                        className="flex-1"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => loadThemes()}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Column 3: Live Preview */}
                {selectedTheme && (
                    <div className="col-span-4">
                        <Card className="h-full sticky top-4">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Preview ao Vivo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ThemePreview theme={selectedTheme} />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Placeholder when no theme selected */}
                {!selectedTheme && (
                    <div className="col-span-9 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Palette className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Selecione um tema</p>
                            <p className="text-sm">Escolha um tema da lista para começar a editar</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
