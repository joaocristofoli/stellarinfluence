import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, Save, Monitor, Smartphone } from "lucide-react";
import { LandingTheme, LAYOUT_PRESETS, LayoutType } from "@/types/landingTheme";
import { motion } from "framer-motion";
import { LandingPagePreview } from "./LandingPagePreview";
import { ThemeSelector } from "./ThemeSelector";
import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";
import { SectionManager } from "./SectionManager";

import { SectionEditor } from "./SectionEditor";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface LandingPageEditorProps {
    theme: LandingTheme;
    creatorId: string;
    creatorData?: any;
    onSave: (theme: LandingTheme) => Promise<void>;
}

export function LandingPageEditor({ theme: initialTheme, creatorId, creatorData, onSave }: LandingPageEditorProps) {
    const [theme, setTheme] = useState<LandingTheme>(initialTheme);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
    const [saving, setSaving] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(theme);
            toast({
                title: "Alterações salvas!",
                description: "O tema foi atualizado com sucesso.",
            });
        } catch (error) {
            // Error handled in parent
        } finally {
            setSaving(false);
        }
    };

    const handleSelectTheme = (layout: LayoutType) => {
        const preset = LAYOUT_PRESETS[layout];
        setTheme({
            ...theme,
            ...preset,
            layout,
        });
    };

    const handleUpdateColor = (key: keyof LandingTheme, color: string) => {
        setTheme({
            ...theme,
            [key]: color,
        });
    };

    // Sync with iframe
    useEffect(() => {
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'UPDATE_PREVIEW',
                theme,
                creatorData
            }, '*');
        }
    }, [theme, creatorData]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Editor de Landing Page</h1>
                        <p className="text-sm text-muted-foreground">Personalize sua página (Mobile First)</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Device Toggle */}
                        <div className="flex border border-border rounded-lg p-1">
                            <Button
                                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPreviewDevice('desktop')}
                                title="Visualizar Desktop"
                            >
                                <Monitor className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPreviewDevice('mobile')}
                                title="Visualizar Mobile"
                            >
                                <Smartphone className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-accent hover:bg-accent/90"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
                    {/* Editor Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-3xl p-4 max-h-[calc(100vh-120px)] overflow-y-auto"
                    >
                        <Tabs defaultValue="layout" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="layout">Layout</TabsTrigger>
                                <TabsTrigger value="design">Design</TabsTrigger>
                                <TabsTrigger value="typography">Fonte</TabsTrigger>
                                <TabsTrigger value="sections">Seções</TabsTrigger>
                                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                            </TabsList>

                            <TabsContent value="design" className="space-y-4 mt-4">
                                <div className="space-y-6">
                                    {/* Colors Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Cores</h3>
                                        <ColorPicker
                                            label="Cor de Fundo"
                                            color={theme.backgroundColor}
                                            onChange={(color) => handleUpdateColor('backgroundColor', color)}
                                        />
                                        <ColorPicker
                                            label="Cor Primária"
                                            color={theme.primaryColor}
                                            onChange={(color) => handleUpdateColor('primaryColor', color)}
                                        />
                                        <ColorPicker
                                            label="Cor Secundária"
                                            color={theme.secondaryColor}
                                            onChange={(color) => handleUpdateColor('secondaryColor', color)}
                                        />
                                        <ColorPicker
                                            label="Cor do Texto"
                                            color={theme.textColor}
                                            onChange={(color) => handleUpdateColor('textColor', color)}
                                        />
                                    </div>

                                    {/* Background Section */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h3 className="font-semibold text-sm">Fundo</h3>

                                        <div>
                                            <ImageUpload
                                                currentImage={theme.backgroundImage || ''}
                                                onImageUploaded={(url) => {
                                                    const updates: any = { backgroundImage: url as string };
                                                    // Auto-adjust opacity if it's currently 1 (opaque)
                                                    if ((theme.backgroundOpacity === undefined || theme.backgroundOpacity === 1)) {
                                                        updates.backgroundOpacity = 0.5;
                                                    }
                                                    setTheme({ ...theme, ...updates });
                                                }}
                                                label="Imagem de Fundo"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Faça upload de uma imagem para usar como fundo da página.
                                            </p>
                                        </div>

                                        <ColorPicker
                                            label="Cor de Fundo (Overlay)"
                                            color={theme.backgroundColor}
                                            onChange={(color) => setTheme({ ...theme, backgroundColor: color })}
                                        />

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label>Opacidade do Fundo</Label>
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round((theme.backgroundOpacity !== undefined ? theme.backgroundOpacity : 1) * 100)}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={[theme.backgroundOpacity !== undefined ? theme.backgroundOpacity : 1]}
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                onValueChange={([value]) => setTheme({ ...theme, backgroundOpacity: value })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Ajuste a opacidade da cor para ver a imagem de fundo.
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground -mt-3">
                                            Essa cor fica sobre a imagem. Ajuste a opacidade abaixo.
                                        </p>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Desfoque (Blur)</Label>
                                                <span className="text-xs text-muted-foreground">{theme.backgroundBlur || 0}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                step="1"
                                                value={theme.backgroundBlur || 0}
                                                onChange={(e) => setTheme({ ...theme, backgroundBlur: Number(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Opacidade da Cor de Fundo</Label>
                                                <span className="text-xs text-muted-foreground">{Math.round((theme.backgroundOpacity || 1) * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={theme.backgroundOpacity !== undefined ? theme.backgroundOpacity : 1}
                                                onChange={(e) => setTheme({ ...theme, backgroundOpacity: Number(e.target.value) })}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ajuste para ver a imagem através da cor de fundo.
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold text-sm mb-3">Animação de Fundo</h4>

                                            <div className="space-y-2 mb-4">
                                                <Label>Tipo de Animação</Label>
                                                <select
                                                    value={theme.layout}
                                                    onChange={(e) => setTheme({ ...theme, layout: e.target.value as LayoutType })}
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                    disabled={theme.enableAnimatedBackground === false}
                                                >
                                                    <option value="minimal">Minimal (Bolhas sutis)</option>
                                                    <option value="bold">Poder Feminino (Linhas animadas)</option>
                                                    <option value="elegant">Elegante (Círculos ornamentais)</option>
                                                    <option value="rock">Rock (Fogo e faíscas)</option>
                                                    <option value="gaming">Tech/Gaming (Grid tecnológico)</option>
                                                    <option value="lifestyle">Lifestyle (Formas orgânicas)</option>
                                                </select>
                                                <p className="text-xs text-muted-foreground">
                                                    Escolha o estilo de animação que combina com seu perfil.
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label>Fundo Animado Interativo</Label>
                                                    <input
                                                        type="checkbox"
                                                        checked={theme.enableAnimatedBackground !== false}
                                                        onChange={(e) => setTheme({ ...theme, enableAnimatedBackground: e.target.checked })}
                                                        className="h-4 w-4"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Ativa/Desativa as animações do tema escolhido. Se desativado, apenas a cor de fundo sólida é exibida.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="layout" className="space-y-4 mt-4">
                                <ThemeSelector
                                    currentLayout={theme.layout}
                                    onSelectTheme={handleSelectTheme}
                                />
                            </TabsContent>



                            <TabsContent value="typography" className="space-y-4 mt-4">
                                <FontSelector
                                    value={theme.fontFamily}
                                    onChange={(font) => setTheme({ ...theme, fontFamily: font })}
                                />
                            </TabsContent>

                            <TabsContent value="sections" className="space-y-4 mt-4">
                                <SectionManager
                                    theme={theme}
                                    onUpdateTheme={setTheme}
                                    onEditSection={setEditingSection}
                                />
                            </TabsContent>

                            <TabsContent value="content" className="space-y-4 mt-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Editar Conteúdo</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Vá para a aba "Seções" e clique em "Editar" para cada seção
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>

                    {/* Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-3xl p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Preview {previewDevice === 'desktop' ? 'Desktop' : 'Mobile'}
                                </h3>
                                {previewDevice === 'desktop' && (
                                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full animate-pulse">
                                        Priorize o Mobile!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Preview Container */}
                        <div className="bg-background border-2 border-border rounded-lg overflow-hidden flex justify-center bg-gray-100 dark:bg-gray-900">
                            <div
                                className={`transition-all duration-300 relative bg-white ${previewDevice === 'mobile'
                                    ? 'w-[375px] h-[667px] my-4 rounded-[40px] border-[8px] border-gray-800 shadow-xl overflow-hidden'
                                    : 'w-full h-[calc(100vh-200px)]'
                                    }`}
                            >
                                {previewDevice === 'mobile' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-50" />
                                )}

                                <iframe
                                    src="/preview"
                                    className="w-full h-full border-0 bg-white"
                                    title="Preview"
                                    onLoad={(e) => {
                                        const iframe = e.currentTarget;
                                        // Send initial data
                                        setTimeout(() => {
                                            iframe.contentWindow?.postMessage({
                                                type: 'UPDATE_PREVIEW',
                                                theme,
                                                creatorData
                                            }, '*');
                                        }, 500);
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Section Editor Dialog */}
            <SectionEditor
                open={!!editingSection}
                onClose={() => setEditingSection(null)}
                sectionKey={editingSection}
                theme={theme}
                onSave={setTheme}
            />
        </div>
    );
}
