import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ThemeSelector } from "@/components/landing/ThemeSelector";
import { ThemeBackground } from "@/components/ui/ThemeBackground";
import { LayoutType, LAYOUT_PRESETS, LandingTheme } from "@/types/landingTheme";
import { ArrowLeft, Download, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import { toPng } from 'html-to-image';
import { saveAs } from "file-saver";
import { toast } from "sonner";
import type { AgencyBranding } from "@/integrations/supabase/types";

import { BannerLayer, LayerType } from "@/components/admin/banner/types";
import { BannerLayerCanvas } from "@/components/admin/banner/BannerLayerCanvas";
import { LayerManager } from "@/components/admin/banner/LayerManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfessionalTextColor, addAlpha } from "@/lib/bannerUtils";
import { getBannerTheme, applyBannerTheme } from "@/lib/bannerThemes";

export default function BannerGenerator() {
    const navigate = useNavigate();
    const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
    const [selectedTheme, setSelectedTheme] = useState<LayoutType>("bold");
    const [layers, setLayers] = useState<BannerLayer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

    const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

    const updateLayer = (id: string, updates: Partial<BannerLayer['style'] | { content: string; visible: boolean; locked: boolean }>) => {
        setLayers(prev => prev.map(layer => {
            if (layer.id !== id) return layer;
            return { ...layer, ...updates, style: { ...layer.style, ...updates } };
        }));
    };

    const handleDeleteLayer = (id: string) => {
        setLayers(prev => prev.filter(l => l.id !== id));
        if (selectedLayerId === id) {
            setSelectedLayerId(null);
        }
    };

    const [bannerFormat, setBannerFormat] = useState<'landscape' | 'square' | 'portrait' | 'vertical-4-5' | 'custom'>('landscape');
    const [customWidth, setCustomWidth] = useState(1920);
    const [customHeight, setCustomHeight] = useState(1080);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState("");

    // Custom Colors
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>("");
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>("");
    const [customTextColor, setCustomTextColor] = useState<string>("");
    const [customBackgroundColor, setCustomBackgroundColor] = useState<string>("");

    // Agency Text (Footer)
    const [showFooterText, setShowFooterText] = useState(true);
    const [footerText, setFooterText] = useState("Agência Eternizar");
    const [footerTextSize, setFooterTextSize] = useState(24);

    // Logo options
    const [showLogo, setShowLogo] = useState(false);
    const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('top-right');
    const [logoSize, setLogoSize] = useState(80);

    // ... (rest of imports)

    // ... inside return ...


    // Agency branding
    const [branding, setBranding] = useState<AgencyBranding | null>(null);

    const bannerRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Dynamic Scale Factor for Preview
    const [scaleFactor, setScaleFactor] = useState(0.4);
    const containerRef = useRef<HTMLDivElement>(null);

    const getBannerDimensions = () => {
        if (bannerFormat === 'square') return { width: 1080, height: 1080 };
        if (bannerFormat === 'portrait') return { width: 1080, height: 1920 };
        if (bannerFormat === 'vertical-4-5') return { width: 1080, height: 1350 };
        if (bannerFormat === 'custom') return { width: customWidth, height: customHeight };
        return { width: 1920, height: 1080 };
    };

    const { width: bannerWidth, height: bannerHeight } = getBannerDimensions();

    useEffect(() => {
        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 48; // padding
                const containerHeight = 600; // Max height target

                const { width: targetWidth, height: targetHeight } = getBannerDimensions();

                const scaleW = containerWidth / targetWidth;
                const scaleH = containerHeight / targetHeight;

                // Use the smaller scale to fit both dimensions, but prioritize width fit mostly
                setScaleFactor(Math.min(scaleW, scaleH, 0.8)); // Cap at 0.8 to avoid too big
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [bannerFormat, customWidth, customHeight]);

    // Fetch agency branding
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const { data, error } = await supabase
                    .from("agency_settings")
                    .select("value")
                    .eq("key", "branding")
                    .maybeSingle();

                if (error) throw error;

                if (data?.value) {
                    setBranding(data.value as AgencyBranding);
                }
            } catch (error) {
                console.error("Error fetching branding:", error);
            }
        };

        fetchBranding();
    }, []);

    // Fetch Creators
    const { data: creators, isLoading: isLoadingCreators } = useQuery({
        queryKey: ["creators-list"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("creators")
                .select("id, name, slug, image_url, landing_theme")
                .order("name");

            if (error) throw error;
            return data;
        },
    });

    const selectedCreator = creators?.find(c => c.id === selectedCreatorId);

    // Initialize Layers when creator changes
    useEffect(() => {
        if (selectedCreator) {
            // Get banner theme for professional defaults
            const bannerTheme = applyBannerTheme(selectedTheme, {
                backgroundColor: customBackgroundColor,
                textColor: customTextColor
            });

            // Auto-adjust text color for readability
            const bgColor = customBackgroundColor || bannerTheme.backgroundColor;
            const autoTextColor = getProfessionalTextColor(bgColor, customTextColor);

            const initialLayers: BannerLayer[] = [
                // Profile Photo
                {
                    id: 'avatar',
                    type: 'image',
                    name: 'Foto de Perfil',
                    content: selectedCreator.image_url || '',
                    visible: true,
                    locked: false,
                    style: {
                        x: 810,
                        y: 200,
                        width: 300,
                        height: 300,
                        zIndex: 10,
                        borderRadius: 500,
                        opacity: 1
                    }
                },
                // Title with auto-adjusted color
                {
                    id: 'title',
                    type: 'text',
                    name: 'Título',
                    content: selectedCreator.name,
                    visible: true,
                    locked: false,
                    style: {
                        x: 0,
                        y: 550,
                        fontSize: 120,
                        fontFamily: 'Inter',
                        color: autoTextColor,
                        textAlign: 'center',
                        zIndex: 20,
                        width: 1920,
                        textShadow: bannerTheme.textShadow,
                        fontWeight: '700'
                    }
                },
                // Subtitle with auto-adjusted color
                {
                    id: 'subtitle',
                    type: 'text',
                    name: 'Subtítulo',
                    content: 'Influenciador Digital',
                    visible: true,
                    locked: false,
                    style: {
                        x: 0,
                        y: 700,
                        fontSize: 48,
                        fontFamily: 'Inter',
                        color: autoTextColor,
                        textAlign: 'center',
                        zIndex: 20,
                        width: 1920,
                        textShadow: bannerTheme.textShadow
                    }
                }
            ];
            setLayers(initialLayers);
        }
    }, [selectedCreator, selectedTheme, customBackgroundColor, customTextColor]);

    // Parse landing_theme safely
    const creatorTheme = selectedCreator?.landing_theme ? (selectedCreator.landing_theme as unknown as LandingTheme) : null;

    // Construct theme object for preview
    const currentTheme: LandingTheme = selectedCreator ? {
        layout: selectedTheme,
        headerStyle: 'centered', // Default for banner
        primaryColor: customPrimaryColor || LAYOUT_PRESETS[selectedTheme].primaryColor || creatorTheme?.primaryColor || '#FF6B35',
        secondaryColor: customSecondaryColor || LAYOUT_PRESETS[selectedTheme].secondaryColor || creatorTheme?.secondaryColor || '#004E89',
        backgroundColor: customBackgroundColor || LAYOUT_PRESETS[selectedTheme].backgroundColor || creatorTheme?.backgroundColor || '#FFFFFF',
        textColor: customTextColor || LAYOUT_PRESETS[selectedTheme].textColor || creatorTheme?.textColor || '#1A1A1A',
        fontFamily: LAYOUT_PRESETS[selectedTheme].fontFamily || creatorTheme?.fontFamily || 'Inter',
        sections: {} // Not needed for banner
    } as any as LandingTheme : {
        layout: selectedTheme,
        headerStyle: 'centered',
        ...LAYOUT_PRESETS[selectedTheme],
        primaryColor: customPrimaryColor || LAYOUT_PRESETS[selectedTheme].primaryColor,
        secondaryColor: customSecondaryColor || LAYOUT_PRESETS[selectedTheme].secondaryColor,
        backgroundColor: customBackgroundColor || LAYOUT_PRESETS[selectedTheme].backgroundColor,
        textColor: customTextColor || LAYOUT_PRESETS[selectedTheme].textColor,
        sections: {}
    } as any as LandingTheme;

    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleDownload = async () => {
        if (!bannerRef.current || !selectedCreator) return;

        setIsGenerating(true);
        setSelectedLayerId(null); // Deselect to hide controls
        setGeneratedImage(null); // Clear previous
        try {
            // Wait a bit for any animations or images to load/settle
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Calculate dimensions based on format
            let width = 1920, height = 1080;
            if (bannerFormat === 'square') { width = 1080; height = 1080; }
            else if (bannerFormat === 'portrait') { width = 1080; height = 1920; }
            else if (bannerFormat === 'vertical-4-5') { width = 1080; height = 1350; }
            else if (bannerFormat === 'custom') { width = customWidth; height = customHeight; }

            // Use html-to-image to generate Blob directly with explicit type
            const blob = await toPng(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 1, // 1 is enough since we are rendering at full resolution now
                backgroundColor: null,
                width,
                height,
                style: {
                    transform: 'none', // Reset transform for capture
                    width: `${width}px`,
                    height: `${height}px`
                }
            }).then(dataUrl => fetch(dataUrl).then(res => res.blob()));

            // Ensure blob is PNG
            const pngBlob = blob.slice(0, blob.size, "image/png");

            // Sanitize filename
            const safeSlug = (selectedCreator.slug || 'creator').replace(/[^a-z0-9-]/gi, '_').toLowerCase();
            const timestamp = new Date().getTime();
            const filename = `banner-${safeSlug}-${timestamp}.png`;

            console.log("Attempting download with file-saver:", filename);
            saveAs(pngBlob, filename);

            toast.success("Banner baixado! Verifique sua pasta de downloads.");

            // Also generate preview for the page
            const previewUrl = window.URL.createObjectURL(pngBlob);
            setGeneratedImage(previewUrl);

            // Scroll to preview
            setTimeout(() => {
                const previewElement = document.getElementById('generated-image-preview');
                if (previewElement) {
                    previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);

        } catch (error) {
            console.error("Error generating banner:", error);
            toast.error("Erro ao gerar banner. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenPreview = async () => {
        if (!bannerRef.current || !selectedCreator) return;

        setIsGenerating(true);
        setSelectedLayerId(null); // Deselect to hide controls
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            let width = 1920, height = 1080;
            if (bannerFormat === 'square') { width = 1080; height = 1080; }
            else if (bannerFormat === 'portrait') { width = 1080; height = 1920; }
            else if (bannerFormat === 'vertical-4-5') { width = 1080; height = 1350; }
            else if (bannerFormat === 'custom') { width = customWidth; height = customHeight; }

            const dataUrl = await toPng(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 1,
                width,
                height,
                style: {
                    transform: 'none',
                    width: `${width}px`,
                    height: `${height}px`
                }
            });

            setGeneratedImage(dataUrl);
            setShowPreviewModal(true);
            toast.success("Preview gerado!");
        } catch (error) {
            console.error("Error opening preview:", error);
            toast.error("Erro ao gerar preview.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Gerador de Banners</h1>
                        <p className="text-muted-foreground">Crie materiais promocionais para seus influenciadores</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Controls */}
                    <Card className="md:col-span-1 h-[calc(100vh-8rem)] flex flex-col">
                        <CardHeader className="pb-2 shrink-0">
                            <CardTitle>Configuração</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                            <Tabs defaultValue="general" className="flex-1 flex flex-col h-full">
                                <div className="px-6 pt-2 shrink-0">
                                    <TabsList className="w-full grid grid-cols-2">
                                        <TabsTrigger value="general">Geral</TabsTrigger>
                                        <TabsTrigger value="layers">Camadas</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                                    <TabsContent value="general" className="space-y-6 mt-0">
                                        {/* Creator Selection */}
                                        <div className="space-y-2">
                                            <Label>Selecione o Influenciador</Label>
                                            <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingCreators ? "Carregando..." : "Selecione um criador"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {creators?.map((creator) => (
                                                        <SelectItem key={creator.id} value={creator.id}>
                                                            {creator.name} (@{creator.slug})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Logo Options */}
                                        <div className="space-y-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Mostrar Logo da Agência</Label>
                                                <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="h-4 w-4" />
                                            </div>
                                            {showLogo && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Posição</Label>
                                                        <Select value={logoPosition} onValueChange={(v: any) => setLogoPosition(v)}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="top-left">Sup. Esquerdo</SelectItem>
                                                                <SelectItem value="top-right">Sup. Direito</SelectItem>
                                                                <SelectItem value="bottom-left">Inf. Esquerdo</SelectItem>
                                                                <SelectItem value="bottom-right">Inf. Direito</SelectItem>
                                                                <SelectItem value="center">Centro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Tamanho</Label>
                                                        <input type="range" min="40" max="200" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Theme Selection */}
                                        <div className="space-y-4 border-t pt-4">
                                            <Label>Tema do Banner</Label>
                                            <ThemeSelector
                                                currentLayout={selectedTheme}
                                                onSelectTheme={setSelectedTheme}
                                            />
                                            {/* Custom Colors if needed */}
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Cor de Fundo</Label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={customBackgroundColor || currentTheme.backgroundColor}
                                                            onChange={(e) => setCustomBackgroundColor(e.target.value)}
                                                            className="h-8 w-full cursor-pointer rounded-md border border-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Cor do Texto</Label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={customTextColor || currentTheme.textColor}
                                                            onChange={(e) => setCustomTextColor(e.target.value)}
                                                            className="h-8 w-full cursor-pointer rounded-md border border-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banner Format */}
                                        <div className="space-y-4 border-t pt-4">
                                            <Label>Formato do Banner</Label>
                                            <Select value={bannerFormat} onValueChange={(v: any) => setBannerFormat(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="landscape">Paisagem (16:9)</SelectItem>
                                                    <SelectItem value="square">Quadrado (1:1)</SelectItem>
                                                    <SelectItem value="portrait">Retrato (9:16)</SelectItem>
                                                    <SelectItem value="vertical-4-5">Vertical (4:5)</SelectItem>
                                                    <SelectItem value="custom">Personalizado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {bannerFormat === 'custom' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Largura</Label>
                                                        <Input type="number" value={customWidth} onChange={(e) => setCustomWidth(parseInt(e.target.value))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Altura</Label>
                                                        <Input type="number" value={customHeight} onChange={(e) => setCustomHeight(parseInt(e.target.value))} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Background Image */}
                                        <div className="space-y-4 border-t pt-4">
                                            <Label>Imagem de Fundo (URL)</Label>
                                            <Input
                                                placeholder="https://exemplo.com/imagem.jpg"
                                                value={backgroundImageUrl}
                                                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">Cole a URL de uma imagem para usar como fundo.</p>
                                        </div>

                                        {/* Footer Text */}
                                        <div className="space-y-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Texto de Rodapé</Label>
                                                <input type="checkbox" checked={showFooterText} onChange={(e) => setShowFooterText(e.target.checked)} className="h-4 w-4" />
                                            </div>
                                            {showFooterText && (
                                                <div className="space-y-2">
                                                    <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
                                                    <div className="flex justify-between items-center">
                                                        <Label className="text-xs">Tamanho</Label>
                                                        <input type="range" min="12" max="48" value={footerTextSize} onChange={(e) => setFooterTextSize(parseInt(e.target.value))} className="w-32" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                className="flex-1"
                                                variant="outline"
                                                onClick={() => setShowPreviewModal(true)}
                                                disabled={!selectedCreator || isGenerating}
                                            >
                                                Expandir
                                            </Button>
                                            <Button
                                                className="flex-[2]"
                                                onClick={handleDownload}
                                                disabled={!selectedCreator || isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Gerando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Baixar PNG
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="layers" className="space-y-4 mt-0">
                                        <div className="flex gap-2 flex-wrap pb-4 border-b">
                                            <Button size="sm" variant="outline" onClick={() => setLayers([...layers, {
                                                id: Date.now().toString(),
                                                type: 'text',
                                                name: 'Novo Texto',
                                                content: 'Texto',
                                                visible: true,
                                                locked: false,
                                                style: { x: 100, y: 100, fontSize: 60, fontFamily: 'Inter', color: '#FFFFFF', textAlign: 'left', zIndex: layers.length + 10 }
                                            }])}>
                                                <Plus className="w-4 h-4 mr-1" /> Texto
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setLayers([...layers, {
                                                id: Date.now().toString(),
                                                type: 'image',
                                                name: 'Nova Imagem',
                                                content: 'https://placehold.co/400',
                                                visible: true,
                                                locked: false,
                                                style: { x: 150, y: 150, width: 300, height: 300, zIndex: layers.length + 10, opacity: 1, borderRadius: 0 }
                                            }])}>
                                                <Plus className="w-4 h-4 mr-1" /> Imagem
                                            </Button>
                                        </div>

                                        <LayerManager
                                            layers={[...layers].reverse()}
                                            selectedLayerId={selectedLayerId}
                                            onReorder={(newOrdered) => setLayers([...newOrdered].reverse())}
                                            onSelect={(id) => setSelectedLayerId(prev => prev === id ? null : id)}
                                            onToggleVisibility={(id) => updateLayer(id, { visible: !layers.find(l => l.id === id)?.visible })}
                                            onToggleLock={(id) => updateLayer(id, { locked: !layers.find(l => l.id === id)?.locked })}
                                            onDelete={handleDeleteLayer}
                                            onUpdate={updateLayer}
                                        />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Preview Area */}
                    <div className="md:col-span-2 space-y-4 sticky top-4 self-start">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Preview
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                Formato: {bannerFormat === 'landscape' ? '16:9 (1920x1080)' : bannerFormat === 'square' ? '1:1 (1080x1080)' : bannerFormat === 'portrait' ? '9:16 (1080x1920)' : bannerFormat === 'vertical-4-5' ? '4:5 (1080x1350)' : `${customWidth}x${customHeight}`}
                                <span className="ml-2 opacity-50">Scale: {Math.round(scaleFactor * 100)}%</span>
                            </span>
                        </div>

                        {/* Banner Canvas Container with Scaling */}
                        <div ref={containerRef} className="border rounded-xl overflow-hidden shadow-2xl bg-black/5 max-w-4xl mx-auto w-full relative flex items-center justify-center p-4 min-h-[600px]">
                            {selectedCreator ? (
                                <div
                                    style={{
                                        width: bannerWidth * scaleFactor,
                                        height: bannerHeight * scaleFactor,
                                        transition: 'width 0.3s, height 0.3s'
                                    }}
                                >
                                    <div
                                        ref={bannerRef}
                                        className="relative overflow-hidden shadow-2xl transition-all duration-500 ease-in-out origin-top-left bg-white"
                                        style={{
                                            width: `${bannerWidth}px`,
                                            height: `${bannerHeight}px`,
                                            transform: `scale(${scaleFactor})`,
                                            backgroundColor: currentTheme.backgroundColor || '#000',
                                            color: currentTheme.textColor || '#fff',
                                        }}
                                        onClick={() => setSelectedLayerId(null)} // Deselect on background click
                                    >
                                        {/* Custom Background Image */}
                                        {backgroundImageUrl && (
                                            <div className="absolute inset-0 z-0 pointer-events-none">
                                                <img
                                                    key={backgroundImageUrl}
                                                    src={backgroundImageUrl}
                                                    alt="Background"
                                                    className="w-full h-full object-cover opacity-50"
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                        )}

                                        {/* Background Animation */}
                                        <div className="absolute inset-0 z-0 pointer-events-none">
                                            <ThemeBackground theme={currentTheme} position="absolute" />
                                        </div>

                                        {/* Professional Overlay Gradient */}
                                        <div
                                            className="absolute inset-0 z-[5] pointer-events-none"
                                            style={{
                                                background: getBannerTheme(selectedTheme).overlayGradient || 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)'
                                            }}
                                        />

                                        {/* Agency Logo (Overlay) */}
                                        {showLogo && branding?.logo_url && (
                                            <div
                                                className={`absolute z-[100] pointer-events-none ${logoPosition === 'top-left' ? 'top-12 left-12' :
                                                    logoPosition === 'top-right' ? 'top-12 right-12' :
                                                        logoPosition === 'bottom-left' ? 'bottom-12 left-12' :
                                                            logoPosition === 'bottom-right' ? 'bottom-12 right-12' :
                                                                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                                                    }`}
                                            >
                                                <img
                                                    src={branding.logo_url}
                                                    alt="Logo"
                                                    style={{ height: `${logoSize * 2}px`, width: 'auto' }}
                                                    className="object-contain drop-shadow-lg"
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                        )}

                                        {/* Footer Text (Overlay) */}
                                        {showFooterText && (
                                            <div
                                                className="absolute bottom-8 left-0 right-0 text-center opacity-50 uppercase tracking-[0.2em] z-[100] pointer-events-none"
                                                style={{
                                                    fontSize: `${footerTextSize}px`,
                                                    color: currentTheme.textColor
                                                }}
                                            >
                                                {footerText}
                                            </div>
                                        )}

                                        {/* LAYERS */}
                                        {layers.map((layer) => (
                                            <BannerLayerCanvas
                                                key={layer.id}
                                                layer={layer}
                                                isSelected={layer.id === selectedLayerId}
                                                scaleFactor={scaleFactor}
                                                onSelect={setSelectedLayerId}
                                                onUpdate={updateLayer}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground bg-muted/20 w-full">
                                    <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Selecione um criador para visualizar o banner</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Full Screen Preview Modal */}
                    {showPreviewModal && generatedImage && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="relative max-w-7xl w-full max-h-[90vh] bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col">
                                <div className="p-4 border-b flex items-center justify-between">
                                    <h3 className="font-bold text-lg">Preview do Banner</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowPreviewModal(false)}>
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                                    <img src={generatedImage} alt="Preview Full" className="max-w-full h-auto shadow-lg rounded-md" />
                                </div>
                                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                                        Fechar
                                    </Button>
                                    <Button onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedImage;
                                        link.download = `banner-${selectedCreator?.slug || 'download'}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        toast.success("Download iniciado!");
                                    }}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Baixar Agora
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
