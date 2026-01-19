import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreatorFormData } from "@/types/creatorForm";
import { motion } from "framer-motion";

interface SocialStepProps {
    formData: CreatorFormData;
    setFormData: (data: CreatorFormData) => void;
    platformSettings: any[];
}

export function SocialStep({ formData, setFormData, platformSettings }: SocialStepProps) {

    // Helper: format numbers while typing
    const handleNumberChange = (field: keyof CreatorFormData, value: string) => {
        const raw = value.replace(/\./g, '').replace(/[^\d]/g, '');
        const formatted = raw ? parseInt(raw).toLocaleString('pt-BR') : '';
        setFormData({ ...formData, [field]: formatted });
    };

    const socials = [
        { id: 'instagram', label: 'Instagram', color: 'text-pink-500', placeholder: 'instagram.com/seu_perfil', metric: 'instagram_followers', metricLabel: 'Seguidores' },
        { id: 'youtube', label: 'YouTube', color: 'text-red-500', placeholder: 'youtube.com/@seu_canal', metric: 'youtube_subscribers', metricLabel: 'Inscritos' },
        { id: 'tiktok', label: 'TikTok', color: 'text-cyan-500', placeholder: 'tiktok.com/@seu_perfil', metric: 'tiktok_followers', metricLabel: 'Seguidores' },
        { id: 'twitter', label: 'Twitter/X', color: 'text-blue-400', placeholder: 'twitter.com/seu_perfil', metric: 'twitter_followers', metricLabel: 'Seguidores' },
        { id: 'kwai', label: 'Kwai', color: 'text-orange-500', placeholder: 'kwai.com/@seu_perfil', metric: 'kwai_followers', metricLabel: 'Seguidores' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Redes Sociais</h1>
                <p className="text-white/60">Conecte as plataformas e estatísticas</p>
            </div>

            <div className="space-y-4">
                {socials.map(social => {
                    const isActive = (formData as any)[`${social.id}_active`];

                    return (
                        <div key={social.id} className="p-4 glass rounded-xl space-y-4 border border-white/5 transition-all hover:border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Label className={`text-lg font-medium ${social.color}`}>{social.label}</Label>
                                    {isActive && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Ativo</span>
                                    )}
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={c => setFormData({ ...formData, [`${social.id}_active`]: c })}
                                />
                            </div>

                            {isActive && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Link do Perfil</Label>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const setting = platformSettings.find(s => s.platform === social.id);
                                                const baseUrl = setting?.base_url || '';
                                                const currentUrl = (formData as any)[`${social.id}_url`];
                                                const displayValue = currentUrl && currentUrl.startsWith(baseUrl)
                                                    ? currentUrl.slice(baseUrl.length)
                                                    : currentUrl;

                                                return (
                                                    <>
                                                        {baseUrl && (
                                                            <span className="text-sm text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-2 rounded-md border border-white/10">
                                                                {baseUrl}
                                                            </span>
                                                        )}
                                                        <Input
                                                            value={displayValue || ''}
                                                            onChange={e => {
                                                                const val = e.target.value.replace('@', '');
                                                                setFormData({
                                                                    ...formData,
                                                                    [`${social.id}_url`]: baseUrl ? `${baseUrl}${val}` : val
                                                                });
                                                            }}
                                                            placeholder={social.placeholder}
                                                        />
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{social.metricLabel}</Label>
                                        <Input
                                            value={(formData as any)[social.metric] || ''}
                                            onChange={e => handleNumberChange(social.metric as keyof CreatorFormData, e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* General Engagement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="space-y-2">
                    <Label>Taxa de Engajamento Média (%)</Label>
                    <Input
                        value={formData.engagement_rate || ''}
                        onChange={e => {
                            // Allow only numbers and dots/commas
                            const val = e.target.value.replace(/[^\d.,]/g, '');
                            setFormData({ ...formData, engagement_rate: val });
                        }}
                        placeholder="Ex: 3.5"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Visualizações de Stories (Média)</Label>
                    <Input
                        value={formData.stories_views || ''}
                        onChange={e => handleNumberChange('stories_views', e.target.value)}
                        placeholder="Ex: 5.000"
                    />
                </div>
            </div>
        </div>
    );
}
