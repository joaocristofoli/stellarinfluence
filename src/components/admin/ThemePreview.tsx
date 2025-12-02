import { ThemePreset } from "@/types/themePreset";
import { LandingTheme } from "@/types/landingTheme";
import { ThemeBackground } from "@/components/ui/ThemeBackground";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThemePreviewProps {
    theme: ThemePreset;
}

interface Creator {
    id: string;
    name: string;
    image_url?: string;
    bio?: string;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

    useEffect(() => {
        loadCreators();
    }, []);

    const loadCreators = async () => {
        try {
            const { data, error } = await supabase
                .from('creators')
                .select('id, name, image_url, bio')
                .order('name')
                .limit(10);

            if (error) throw error;
            setCreators(data || []);
        } catch (error) {
            console.error('Error loading creators:', error);
        }
    };

    // Convert ThemePreset to LandingTheme format for preview
    const previewTheme: Partial<LandingTheme> & { layout: string } = {
        layout: theme.layout_type,
        primaryColor: theme.animation_config.colors.primary || '#FF6B35',
        secondaryColor: theme.animation_config.colors.secondary || '#8000FF',
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontFamily: 'Inter',
        enableAnimatedBackground: theme.animation_config.enabled,
    };

    return (
        <div className="space-y-4">
            {/* Creator Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Visualizar com Influencer</label>
                <select
                    value={selectedCreator?.id || ''}
                    onChange={(e) => {
                        const creator = creators.find(c => c.id === e.target.value);
                        setSelectedCreator(creator || null);
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">Sem influencer (preview genérico)</option>
                    {creators.map((creator) => (
                        <option key={creator.id} value={creator.id}>
                            {creator.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {selectedCreator ? `Visualizando: ${selectedCreator.name}` : 'Preview do tema'}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant={!isMobile ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsMobile(false)}
                    >
                        <Monitor className="w-4 h-4 mr-2" />
                        Desktop
                    </Button>
                    <Button
                        variant={isMobile ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsMobile(true)}
                    >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile
                    </Button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center">
                <div
                    className={`relative rounded-lg overflow-hidden border transition-all duration-300 ${isMobile ? 'w-[375px] h-[667px]' : 'w-full h-[500px]'
                        }`}
                    style={{
                        boxShadow: isMobile ? '0 20px 50px -10px rgba(0,0,0,0.3)' : 'none'
                    }}
                >
                    <ThemeBackground theme={previewTheme as LandingTheme} position="absolute" />

                    {/* Sample content with creator info */}
                    <div className="relative z-10 flex items-center justify-center h-full p-8">
                        <div className={`text-center ${isMobile ? 'scale-90' : ''}`}>
                            {selectedCreator ? (
                                <>
                                    {selectedCreator.image_url && (
                                        <div className="mb-4 flex justify-center">
                                            <img
                                                src={selectedCreator.image_url}
                                                alt={selectedCreator.name}
                                                className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                                            />
                                        </div>
                                    )}
                                    <h2 className="text-4xl font-bold text-white mb-3">
                                        {selectedCreator.name}
                                    </h2>
                                    {selectedCreator.bio && (
                                        <p className="text-white/70 text-sm max-w-md mb-4">
                                            {selectedCreator.bio}
                                        </p>
                                    )}
                                    <p className="text-white/50 text-xs">
                                        {theme.name} • {isMobile ? 'Mobile' : 'Desktop'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-center">
                                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                                            <User className="w-12 h-12 text-white/30" />
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-bold text-white mb-4">
                                        Preview
                                    </h2>
                                    <p className="text-white/70 mb-2">
                                        {theme.name}
                                    </p>
                                    <p className="text-white/50 text-sm">
                                        {isMobile ? '375x667 (Mobile)' : 'Desktop'}
                                    </p>
                                    <p className="text-white/40 text-xs mt-4">
                                        Selecione um influencer acima para visualizar
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
