import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface PlatformSetting {
    platform: string;
    icon_url: string | null;
    bg_color: string | null;
    is_transparent: boolean;
    use_theme_color: boolean;
    base_url?: string;
}

const PLATFORMS = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'twitter', label: 'Twitter/X' },
    { key: 'kwai', label: 'Kwai' },
];

export const PlatformSettingsManager = forwardRef((props, ref) => {
    const [settings, setSettings] = useState<PlatformSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    useImperativeHandle(ref, () => ({
        save: handleSave
    }));

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*');

            if (error) throw error;

            // Merge with default platforms to ensure all are present
            const mergedSettings = PLATFORMS.map(p => {
                const existing = data?.find(s => s.platform === p.key);
                return existing || {
                    platform: p.key,
                    icon_url: null,
                    bg_color: '#000000',
                    is_transparent: false,
                    use_theme_color: true
                };
            });

            setSettings(mergedSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Fallback for when table doesn't exist yet
            setSettings(PLATFORMS.map(p => ({
                platform: p.key,
                icon_url: null,
                bg_color: '#000000',
                is_transparent: false,
                use_theme_color: true
            })));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert(settings);

            if (error) throw error;

            toast({
                title: "Configurações salvas!",
                description: "As alterações foram aplicadas.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (platform: string, updates: Partial<PlatformSetting>) => {
        setSettings(prev => prev.map(s =>
            s.platform === platform ? { ...s, ...updates } : s
        ));
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Ícones das Redes Sociais</h2>
                    <p className="text-sm text-muted-foreground">
                        Personalize os ícones e cores das plataformas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PLATFORMS.map(platform => {
                    const setting = settings.find(s => s.platform === platform.key)!;

                    return (
                        <div key={platform.key} className="glass p-6 rounded-xl space-y-4 border border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{
                                        backgroundColor: setting.is_transparent ? 'transparent' : (setting.use_theme_color ? '#ccc' : setting.bg_color || '#000'),
                                        border: '1px solid #333'
                                    }}>
                                    {setting.icon_url ? (
                                        <img src={setting.icon_url} alt={platform.label} className="w-6 h-6 object-contain" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Padrão</span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg">{platform.label}</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Configurações de URL e Ícone</Label>
                                    <div className="space-y-2">
                                        <Label>URL Base (Prefixo)</Label>
                                        <Input
                                            value={setting.base_url || ''}
                                            onChange={(e) => updateSetting(setting.platform, { base_url: e.target.value })}
                                            placeholder="https://instagram.com/"
                                            className="bg-background/50"
                                        />
                                        <p className="text-xs text-muted-foreground">O usuário digitará apenas o @usuário ou ID.</p>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <Label>Ícone Personalizado (URL)</Label>
                                        <Input
                                            value={setting.icon_url || ''}
                                            onChange={e => updateSetting(platform.key, { icon_url: e.target.value })}
                                            placeholder="https://..."
                                            className="bg-background/50"
                                        />
                                        <p className="text-xs text-muted-foreground">Deixe em branco para usar o ícone padrão.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <Label>Usar Cor do Tema (Texto)</Label>
                                        <Switch
                                            checked={setting.use_theme_color}
                                            onCheckedChange={c => updateSetting(platform.key, { use_theme_color: c })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Fundo Transparente</Label>
                                        <Switch
                                            checked={setting.is_transparent}
                                            onCheckedChange={c => updateSetting(platform.key, { is_transparent: c })}
                                        />
                                    </div>

                                    {!setting.use_theme_color && !setting.is_transparent && (
                                        <div>
                                            <Label className="mb-2 block">Cor de Fundo Personalizada</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={setting.bg_color || '#000000'}
                                                    onChange={e => updateSetting(platform.key, { bg_color: e.target.value })}
                                                    className="w-12 h-12 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={setting.bg_color || '#000000'}
                                                    onChange={e => updateSetting(platform.key, { bg_color: e.target.value })}
                                                    className="uppercase"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
