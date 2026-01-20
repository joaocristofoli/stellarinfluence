import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreatorFormData } from "@/types/creatorForm";
import { PRICING_FIELDS_BY_TYPE } from "@/types/profileTypes";

interface PricingStepProps {
    formData: CreatorFormData;
    setFormData: (data: CreatorFormData) => void;
}

export function PricingStep({ formData, setFormData }: PricingStepProps) {

    const handleCurrencyChange = (
        field: string,
        value: string
    ) => {
        const rawValue = value.replace(/\./g, '').replace(/[^\d]/g, '');
        if (!rawValue) {
            setFormData({
                ...formData,
                admin_metadata: { ...formData.admin_metadata, [field]: '' }
            });
            return;
        }
        const formatted = parseInt(rawValue).toLocaleString('pt-BR');
        setFormData({
            ...formData,
            admin_metadata: { ...formData.admin_metadata, [field]: formatted }
        });
    };

    const getPrice = (field: string) => (formData.admin_metadata as any)[field] || '';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Tabela de Preços</h1>
                <p className="text-white/60">Defina os valores de comercialização (Admin)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram Pricing */}
                {formData.instagram_active && (
                    <div className="p-4 glass rounded-xl border border-pink-500/20 space-y-4">
                        <h3 className="font-medium text-pink-400 flex items-center gap-2">📸 Instagram</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PriceInput
                                label="Story"
                                value={getPrice('price_story')}
                                onChange={v => handleCurrencyChange('price_story', v)}
                            />
                            <PriceInput
                                label="Reels"
                                value={getPrice('price_reels')}
                                onChange={v => handleCurrencyChange('price_reels', v)}
                            />
                            <PriceInput
                                label="Feed Post"
                                value={getPrice('price_feed_post')}
                                onChange={v => handleCurrencyChange('price_feed_post', v)}
                            />
                            <PriceInput
                                label="Carrossel"
                                value={getPrice('price_carousel')}
                                onChange={v => handleCurrencyChange('price_carousel', v)}
                            />
                        </div>
                    </div>
                )}

                {/* TikTok Pricing */}
                {formData.tiktok_active && (
                    <div className="p-4 glass rounded-xl border border-cyan-500/20 space-y-4">
                        <h3 className="font-medium text-cyan-400 flex items-center gap-2">🎵 TikTok</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PriceInput
                                label="Trilha Simples"
                                value={getPrice('price_tiktok_simple')}
                                onChange={v => handleCurrencyChange('price_tiktok_simple', v)}
                            />
                            <PriceInput
                                label="Vídeo Produzido"
                                value={getPrice('price_tiktok_produced')}
                                onChange={v => handleCurrencyChange('price_tiktok_produced', v)}
                            />
                        </div>
                    </div>
                )}

                {/* YouTube Pricing */}
                {formData.youtube_active && (
                    <div className="p-4 glass rounded-xl border border-red-500/20 space-y-4">
                        <h3 className="font-medium text-red-400 flex items-center gap-2">▶️ YouTube</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PriceInput
                                label="Menção"
                                value={getPrice('price_youtube_mention')}
                                onChange={v => handleCurrencyChange('price_youtube_mention', v)}
                            />
                            <PriceInput
                                label="Vídeo Dedicado"
                                value={getPrice('price_youtube_dedicated')}
                                onChange={v => handleCurrencyChange('price_youtube_dedicated', v)}
                            />
                        </div>
                    </div>
                )}

                {/* Packages */}
                <div className="p-4 glass rounded-xl border border-accent/20 space-y-4 col-span-1 md:col-span-2">
                    <h3 className="font-medium text-accent flex items-center gap-2">📦 Pacotes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PriceInput
                            label="Pacote Básico"
                            value={getPrice('price_package_basic')}
                            onChange={v => handleCurrencyChange('price_package_basic', v)}
                        />
                        <PriceInput
                            label="Pacote Premium"
                            value={getPrice('price_package_premium')}
                            onChange={v => handleCurrencyChange('price_package_premium', v)}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label className="text-xs">📝 Observações de Negociação</Label>
                    <Textarea
                        value={(formData.admin_metadata as any).pricing_notes || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            admin_metadata: { ...formData.admin_metadata, pricing_notes: e.target.value }
                        })}
                        placeholder="Aceita permuta, negocia valores, cobra extra por exclusividade..."
                        rows={3}
                        className="bg-black/20 text-sm"
                    />
                </div>
            </div>
            {/* Dynamic Specialized Pricing (Gossip, Press, etc) */}
            {formData.profile_type && formData.profile_type !== 'influencer' && (
                <div className="p-4 glass rounded-xl border border-white/10 space-y-4 col-span-1 md:col-span-2">
                    <h3 className="font-medium text-white flex items-center gap-2">
                        {/* Need to import getProfileTypeIcon/Label or just hardcode for now to avoid complexity */}
                        🏷️ Precificação Especial: <span className="text-accent">{formData.profile_type.toUpperCase()}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PRICING_FIELDS_BY_TYPE[formData.profile_type]?.map((field) => (
                            <PriceInput
                                key={field.id}
                                label={field.label}
                                value={(formData.admin_metadata as any)[field.id] || ''}
                                onChange={v => handleCurrencyChange(field.id, v)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>

    );
}

function PriceInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0,00"
                    className="bg-black/20 pl-8 h-9 text-sm"
                />
            </div>
        </div>
    );
}
