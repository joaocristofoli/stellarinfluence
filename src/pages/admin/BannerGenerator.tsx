import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeSelector } from "@/components/landing/ThemeSelector";
import { ThemeBackground } from "@/components/ui/ThemeBackground";
import { LayoutType, LAYOUT_PRESETS, LandingTheme } from "@/types/landingTheme";
import { ArrowLeft, Download, Loader2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { toPng } from 'html-to-image';
import { saveAs } from "file-saver";
import { toast } from "sonner";
import type { AgencyBranding } from "@/integrations/supabase/types";

interface CustomTextElement {
    id: string;
    text: string;
    fontSize: number;
    fontFamily: string;
}

export default function BannerGenerator() {
    const navigate = useNavigate();
    const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
    const [selectedTheme, setSelectedTheme] = useState<LayoutType>("bold");
    const [layoutMode, setLayoutMode] = useState<'profile' | 'stats'>('profile');
    const [customTitle, setCustomTitle] = useState("");
    const [customSubtitle, setCustomSubtitle] = useState("");
    const [showAvatar, setShowAvatar] = useState(true);
    const [showHandle, setShowHandle] = useState(true);
    const [bannerFormat, setBannerFormat] = useState<'landscape' | 'square' | 'portrait' | 'custom'>('landscape');
    const [customWidth, setCustomWidth] = useState(1920);
    const [customHeight, setCustomHeight] = useState(1080);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState("");

    // Logo options
    const [showLogo, setShowLogo] = useState(false);
    const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('top-right');
    const [logoSize, setLogoSize] = useState(80);

    // Custom text elements
    const [customTexts, setCustomTexts] = useState<CustomTextElement[]>([]);

    // Agency branding
    const [branding, setBranding] = useState<AgencyBranding | null>(null);

    const bannerRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

    // Update custom text when creator changes
    useEffect(() => {
        if (selectedCreator) {
            setCustomTitle(selectedCreator.name);
            setCustomSubtitle("Influenciador Digital");
        }
    }, [selectedCreator]);

    // Parse landing_theme safely
    const creatorTheme = selectedCreator?.landing_theme ? (selectedCreator.landing_theme as unknown as LandingTheme) : null;

    // Construct theme object for preview
    const currentTheme: LandingTheme = selectedCreator ? {
        layout: selectedTheme,
        headerStyle: 'centered', // Default for banner
        primaryColor: LAYOUT_PRESETS[selectedTheme].primaryColor || creatorTheme?.primaryColor || '#FF6B35',
        secondaryColor: LAYOUT_PRESETS[selectedTheme].secondaryColor || creatorTheme?.secondaryColor || '#004E89',
        backgroundColor: LAYOUT_PRESETS[selectedTheme].backgroundColor || creatorTheme?.backgroundColor || '#FFFFFF',
        textColor: LAYOUT_PRESETS[selectedTheme].textColor || creatorTheme?.textColor || '#1A1A1A',
        fontFamily: LAYOUT_PRESETS[selectedTheme].fontFamily || creatorTheme?.fontFamily || 'Inter',
        sections: {} // Not needed for banner
    } as any as LandingTheme : {
        layout: selectedTheme,
        headerStyle: 'centered',
        ...LAYOUT_PRESETS[selectedTheme],
        sections: {}
    } as any as LandingTheme;

    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleDownload = async () => {
        if (!bannerRef.current || !selectedCreator) return;

        setIsGenerating(true);
        setGeneratedImage(null); // Clear previous
        try {
            // Wait a bit for any animations or images to load/settle
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Calculate dimensions based on format
            let width = 1920, height = 1080;
            if (bannerFormat === 'square') { width = 1080; height = 1080; }
            else if (bannerFormat === 'portrait') { width = 1080; height = 1920; }
            else if (bannerFormat === 'custom') { width = customWidth; height = customHeight; }

            // Use html-to-image to generate Blob directly with explicit type
            const blob = await toPng(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 2, // High resolution
                backgroundColor: null,
                width,
                height,
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
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const dataUrl = await toPng(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 2,
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
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Configuração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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

                            {/* Layout Mode */}
                            <div className="space-y-2">
                                <Label>Estilo do Banner</Label>
                                <Select value={layoutMode} onValueChange={(v: any) => setLayoutMode(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="profile">Perfil (Padrão)</SelectItem>
                                        <SelectItem value="stats">Estatísticas (Numérico)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Format Selection */}
                            <div className="space-y-2">
                                <Label>Formato do Banner</Label>
                                <Select value={bannerFormat} onValueChange={(v: any) => setBannerFormat(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="landscape">Horizontal/Paisagem (16:9)</SelectItem>
                                        <SelectItem value="square">Quadrado (1:1)</SelectItem>
                                        <SelectItem value="portrait">Retrato/Vertical (9:16)</SelectItem>
                                        <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Custom Dimensions */}
                            {bannerFormat === 'custom' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Largura (px)</Label>
                                        <input
                                            type="number"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1920)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Altura (px)</Label>
                                        <input
                                            type="number"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1080)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Background Image URL */}
                            <div className="space-y-2">
                                <Label>Imagem de Fundo (URL)</Label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={backgroundImageUrl}
                                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                                    placeholder="https://exemplo.com/fundo.jpg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    ⚠️ Use imagens do Supabase ou serviços como Imgur, Unsplash. Sites de notícias podem bloquear por CORS.
                                </p>
                            </div>

                            {/* Custom Text */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>Título Principal</Label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="Ex: Nome ou Número"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtítulo</Label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={customSubtitle}
                                        onChange={(e) => setCustomSubtitle(e.target.value)}
                                        placeholder="Ex: Cargo ou 'Seguidores'"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label>Mostrar Foto</Label>
                                    <input type="checkbox" checked={showAvatar} onChange={(e) => setShowAvatar(e.target.checked)} className="h-4 w-4" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Mostrar @Handle</Label>
                                    <input type="checkbox" checked={showHandle} onChange={(e) => setShowHandle(e.target.checked)} className="h-4 w-4" />
                                </div>
                            </div>

                            {/* Theme Selection */}
                            <div className="space-y-2 border-t pt-4">
                                <Label>Tema do Banner</Label>
                                <ThemeSelector
                                    currentLayout={selectedTheme}
                                    onSelectTheme={setSelectedTheme}
                                />
                            </div>

                            {/* Logo Options */}
                            {branding?.logo_url && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Mostrar Logo da Agência</Label>
                                        <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="h-4 w-4" />
                                    </div>
                                    {showLogo && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Posição do Logo</Label>
                                                <Select value={logoPosition} onValueChange={(v: any) => setLogoPosition(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="top-left">Superior Esquerdo</SelectItem>
                                                        <SelectItem value="top-right">Superior Direito</SelectItem>
                                                        <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                                                        <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                                                        <SelectItem value="center">Centro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tamanho do Logo ({logoSize}px)</Label>
                                                <input
                                                    type="range"
                                                    min="40"
                                                    max="200"
                                                    value={logoSize}
                                                    onChange={(e) => setLogoSize(parseInt(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Custom Text Elements */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label>Textos Personalizados</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCustomTexts([...customTexts, {
                                                id: Date.now().toString(),
                                                text: "Novo Texto",
                                                fontSize: 24,
                                                fontFamily: "Inter"
                                            }]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Adicionar
                                    </Button>
                                </div>
                                {customTexts.map((textEl, index) => (
                                    <div key={textEl.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Elemento {index + 1}</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setCustomTexts(customTexts.filter(t => t.id !== textEl.id))}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <input
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                            value={textEl.text}
                                            onChange={(e) => {
                                                const updated = [...customTexts];
                                                updated[index].text = e.target.value;
                                                setCustomTexts(updated);
                                            }}
                                            placeholder="Texto"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Fonte</Label>
                                                <Select
                                                    value={textEl.fontFamily}
                                                    onValueChange={(v) => {
                                                        const updated = [...customTexts];
                                                        updated[index].fontFamily = v;
                                                        setCustomTexts(updated);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Inter">Inter</SelectItem>
                                                        <SelectItem value="Outfit">Outfit</SelectItem>
                                                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                                                        <SelectItem value="Arial">Arial</SelectItem>
                                                        <SelectItem value="Impact">Impact</SelectItem>
                                                        <SelectItem value="Georgia">Georgia</SelectItem>
                                                        <SelectItem value="Times New Roman">Times</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Tamanho ({textEl.fontSize}px)</Label>
                                                <input
                                                    type="range"
                                                    min="12"
                                                    max="120"
                                                    value={textEl.fontSize}
                                                    onChange={(e) => {
                                                        const updated = [...customTexts];
                                                        updated[index].fontSize = parseInt(e.target.value);
                                                        setCustomTexts(updated);
                                                    }}
                                                    className="w-full h-8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={handleOpenPreview}
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

                            {/* Generated Image Preview */}
                            {generatedImage && (
                                <div id="generated-image-preview" className="space-y-2 border-t pt-4 animate-in fade-in zoom-in duration-300">
                                    <Label className="text-green-600 font-bold">Imagem Gerada (Sucesso!)</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Se o download automático falhou, tente o link abaixo ou clique com o botão direito na imagem.
                                    </p>

                                    {/* Manual Download Link */}
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href={generatedImage}
                                            download={`banner-${selectedCreator?.slug || 'manual'}.png`}
                                            className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                                        >
                                            <Download className="w-3 h-3" />
                                            Clique aqui para baixar manualmente (Link Direto)
                                        </a>
                                    </div>

                                    <div className="border-2 border-green-500/20 rounded-lg overflow-hidden shadow-lg">
                                        <img src={generatedImage} alt="Banner Gerado" className="w-full h-auto" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview Area */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Preview
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                Formato: {bannerFormat === 'landscape' ? '16:9 (1920x1080)' : bannerFormat === 'square' ? '1:1 (1080x1080)' : bannerFormat === 'portrait' ? '9:16 (1080x1920)' : `${customWidth}x${customHeight}`}
                            </span>
                        </div>

                        {/* Banner Canvas */}
                        <div className="border rounded-xl overflow-hidden shadow-2xl bg-black/5 max-w-4xl mx-auto w-full">
                            {selectedCreator ? (
                                <div
                                    ref={bannerRef}
                                    className={`relative overflow-hidden flex items-center justify-center ${bannerFormat === 'landscape' ? 'w-full aspect-video' :
                                        bannerFormat === 'square' ? 'aspect-square mx-auto max-w-2xl' :
                                            bannerFormat === 'portrait' ? 'aspect-[9/16] mx-auto max-w-xl' : ''
                                        }`}
                                    style={{
                                        backgroundColor: currentTheme.backgroundColor || '#000',
                                        color: currentTheme.textColor || '#fff',
                                        ...(bannerFormat === 'custom' ? { width: `${customWidth}px`, height: `${customHeight}px`, maxWidth: '100%' } : {})
                                    }}
                                >
                                    {/* Custom Background Image */}
                                    {backgroundImageUrl && (
                                        <div className="absolute inset-0 z-0">
                                            <img
                                                key={backgroundImageUrl}
                                                src={backgroundImageUrl}
                                                alt="Background"
                                                className="w-full h-full object-cover opacity-50"
                                                onError={(e) => {
                                                    console.error("Failed to load background image - possible CORS issue");
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Background Animation */}
                                    <div className="absolute inset-0 z-0">
                                        <ThemeBackground theme={currentTheme} position="absolute" />
                                    </div>

                                    {/* Agency Logo */}
                                    {showLogo && branding?.logo_url && (
                                        <div
                                            className={`absolute z-20 ${logoPosition === 'top-left' ? 'top-4 left-4' :
                                                logoPosition === 'top-right' ? 'top-4 right-4' :
                                                    logoPosition === 'bottom-left' ? 'bottom-4 left-4' :
                                                        logoPosition === 'bottom-right' ? 'bottom-4 right-4' :
                                                            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                                                }`}
                                        >
                                            <img
                                                src={branding.logo_url}
                                                alt="Logo"
                                                style={{ height: `${logoSize}px`, width: 'auto' }}
                                                className="object-contain drop-shadow-lg"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center text-center p-12 w-full h-full justify-center">

                                        {/* PROFILE LAYOUT */}
                                        {layoutMode === 'profile' && (
                                            <>
                                                {/* Avatar with Glow */}
                                                {showAvatar && selectedCreator.image_url && (
                                                    <div className="relative mb-8">
                                                        <div
                                                            className="w-48 h-48 rounded-full border-4 shadow-2xl overflow-hidden relative z-10"
                                                            style={{ borderColor: currentTheme.primaryColor }}
                                                        >
                                                            <img
                                                                src={selectedCreator.image_url}
                                                                alt={selectedCreator.name}
                                                                className="w-full h-full object-cover"
                                                                crossOrigin="anonymous"
                                                            />
                                                        </div>
                                                        <div
                                                            className="absolute inset-0 rounded-full blur-[50px] opacity-60 -z-10 animate-pulse"
                                                            style={{ backgroundColor: currentTheme.primaryColor }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Name / Title */}
                                                <h1
                                                    className="text-6xl md:text-7xl font-black mb-2 tracking-tight uppercase"
                                                    style={{
                                                        fontFamily: currentTheme.fontFamily,
                                                        textShadow: `0 0 30px ${currentTheme.primaryColor}40`
                                                    }}
                                                >
                                                    {customTitle || selectedCreator.name}
                                                </h1>

                                                {/* Subtitle / Handle */}
                                                {showHandle && (
                                                    <div
                                                        className="text-2xl md:text-3xl font-light opacity-90 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10"
                                                        style={{ backgroundColor: `${currentTheme.secondaryColor}40` }}
                                                    >
                                                        {customSubtitle || `@${selectedCreator.slug}`}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* STATS LAYOUT (Reference Style) */}
                                        {layoutMode === 'stats' && (
                                            <div className="flex flex-col items-center justify-end h-full pb-8 w-full">
                                                {/* Avatar with Shape Behind */}
                                                {showAvatar && selectedCreator.image_url && (
                                                    <div className="relative mb-auto mt-8">
                                                        {/* Graphical Shape Behind */}
                                                        <div
                                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-[3rem] -z-10 opacity-20 rotate-3"
                                                            style={{ backgroundColor: currentTheme.primaryColor }}
                                                        />
                                                        <div
                                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-[3rem] -z-10 opacity-40 -rotate-2"
                                                            style={{ backgroundColor: currentTheme.secondaryColor }}
                                                        />

                                                        {/* Image */}
                                                        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-2 border-white/20">
                                                            <img
                                                                src={selectedCreator.image_url}
                                                                alt={selectedCreator.name}
                                                                className="w-full h-full object-cover"
                                                                crossOrigin="anonymous"
                                                            />
                                                        </div>

                                                        {/* Handle Badge Overlay */}
                                                        {showHandle && (
                                                            <div
                                                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 px-6 py-2 rounded-full font-bold text-lg shadow-lg whitespace-nowrap"
                                                                style={{
                                                                    backgroundColor: '#000',
                                                                    color: '#fff',
                                                                    border: `1px solid ${currentTheme.primaryColor}`
                                                                }}
                                                            >
                                                                @{selectedCreator.slug}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Big Stats Typography */}
                                                <div className="text-center mt-8 relative z-20">
                                                    <h1
                                                        className="text-8xl md:text-9xl font-black leading-none tracking-tighter uppercase drop-shadow-2xl"
                                                        style={{
                                                            fontFamily: 'Impact, sans-serif', // Strong font for stats
                                                            WebkitTextStroke: '2px white',
                                                            color: 'transparent' // Outline style option, or solid
                                                        }}
                                                    >
                                                        <span style={{ color: '#fff', WebkitTextStroke: '0' }}>
                                                            {customTitle || "57,6 MIL"}
                                                        </span>
                                                    </h1>
                                                    <p
                                                        className="text-2xl md:text-3xl font-bold uppercase tracking-[0.5em] mt-2"
                                                        style={{ color: currentTheme.primaryColor }}
                                                    >
                                                        {customSubtitle || "SEGUIDORES NO INSTAGRAM"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Custom Text Elements */}
                                        {customTexts.map((textEl) => (
                                            <div
                                                key={textEl.id}
                                                className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                style={{
                                                    fontFamily: textEl.fontFamily,
                                                    fontSize: `${textEl.fontSize}px`,
                                                    color: currentTheme.textColor,
                                                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {textEl.text}
                                            </div>
                                        ))}

                                        {/* Tagline / Footer */}
                                        <div className="absolute bottom-4 left-0 right-0 text-center opacity-50 text-xs uppercase tracking-[0.2em]">
                                            Stellar Influence Studio
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
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
                                        <ArrowLeft className="w-5 h-5" /> {/* Using ArrowLeft as close/back */}
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
