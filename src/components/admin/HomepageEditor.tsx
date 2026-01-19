import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageConfig } from "@/types/homepageConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Atomic subcomponents
import { TextsTab, ColorsTab, FeaturesTab, HeroPreview } from "./homepage-editor";

/**
 * HomepageEditor - Visual editor for homepage configuration
 * 
 * @description
 * This component provides a comprehensive editor for the homepage,
 * split into multiple tabs for better organization:
 * - Textos: Badge, titles, subtitle, CTA buttons
 * - Cores: Color palette (primary, secondary, accent)
 * - Features: Animation toggles and settings
 * 
 * The editor includes a live preview panel that updates in real-time.
 * 
 * @refactor
 * Original 633-line monolith split into atomic components:
 * - TextsTab: ~100 lines
 * - ColorsTab: ~65 lines
 * - FeaturesTab: ~220 lines
 * - HeroPreview: ~115 lines
 * 
 * @example
 * ```tsx
 * const editorRef = useRef<{ save: () => void }>(null);
 * <HomepageEditor ref={editorRef} />
 * <Button onClick={() => editorRef.current?.save()}>Salvar</Button>
 * ```
 */
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

    /**
     * Load homepage configuration from Supabase
     */
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
            if (import.meta.env.DEV) {
                console.error('Error loading homepage config:', error);
            }
            toast({
                title: "Erro",
                description: "Não foi possível carregar as configurações.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save homepage configuration to Supabase
     */
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
            if (import.meta.env.DEV) {
                console.error('Error saving homepage config:', error);
            }
            toast({
                title: "Erro",
                description: "Erro ao salvar configurações.",
                variant: "destructive",
            });
        }
    };

    /**
     * Reset configuration to last saved state
     */
    const handleReset = () => {
        loadConfig();
        toast({
            title: "Resetado",
            description: "Configurações restauradas.",
        });
    };

    /**
     * Handle partial config updates from child components
     */
    const handleConfigChange = useCallback((updates: Partial<HomepageConfig>) => {
        setConfig(prev => prev ? { ...prev, ...updates } : null);
    }, []);

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

                                <TabsContent value="text" className="mt-4 max-h-[500px] overflow-y-auto">
                                    <TextsTab
                                        config={config}
                                        onConfigChange={handleConfigChange}
                                    />
                                </TabsContent>

                                <TabsContent value="colors" className="mt-4">
                                    <ColorsTab
                                        config={config}
                                        onConfigChange={handleConfigChange}
                                    />
                                </TabsContent>

                                <TabsContent value="features" className="mt-4 max-h-[500px] overflow-y-auto">
                                    <FeaturesTab
                                        config={config}
                                        onConfigChange={handleConfigChange}
                                    />
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
                                <HeroPreview
                                    config={config}
                                    isMobile={isMobilePreview}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
});
