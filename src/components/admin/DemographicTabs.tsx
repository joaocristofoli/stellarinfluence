import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PercentageInput, NumberInput } from "@/components/ui/MaskedInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário", "Prefere não dizer"];
const AUDIENCE_TYPES = ["Jovem Adulto (18-24)", "Adolescente (13-17)", "Adulto (25-44)", "Sênior (45+)", "Misto"];
const IDEOLOGIES = ["Esquerda", "Centro-Esquerda", "Centro", "Centro-Direita", "Direita", "Apartidário", "Não se aplica"];
const NICHES = ["Lifestyle", "Tech", "Beauty", "Fitness", "Gaming", "Food", "Travel", "Fashion", "Education", "Business", "Entertainment", "Sports", "Music", "Art", "Health"];
const LANGUAGES = ["Português", "Inglês", "Espanhol", "Francês", "Italiano", "Alemão"];
const BRAZILIAN_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

interface DemographicTabsProps {
    currentStep: number;
    formData: any;
    setFormData: (data: any) => void;
}

export function DemographicTabs({ currentStep, formData, setFormData }: DemographicTabsProps) {
    const toggleNiche = (niche: string) => {
        const current = formData.content_niche || [];
        if (current.includes(niche)) {
            setFormData({ ...formData, content_niche: current.filter((n: string) => n !== niche) });
        } else {
            setFormData({ ...formData, content_niche: [...current, niche] });
        }
    };

    const toggleLanguage = (lang: string) => {
        const current = formData.content_language || [];
        if (current.includes(lang)) {
            setFormData({ ...formData, content_language: current.filter((l: string) => l !== lang) });
        } else {
            setFormData({ ...formData, content_language: [...current, lang] });
        }
    };

    // Step 4: Personal Demographics
    if (currentStep === 4) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold">📊 Demografia Pessoal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Gênero</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDER_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Data de Nascimento</Label>
                        <Input type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} />
                    </div>

                    <div>
                        <Label>Cidade</Label>
                        <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="São Paulo" />
                    </div>

                    <div>
                        <Label>Estado (UF)</Label>
                        <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {BRAZILIAN_STATES.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>CEP</Label>
                        <Input value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder="00000-000" />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Endereço Completo (Opcional)</Label>
                        <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Rua, número, complemento..." rows={2} />
                    </div>
                </div>
            </div>
        );
    }

    // Step 5: Audience Demographics
    if (currentStep === 5) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold">👥 Demografia da Audiência</h3>

                <div>
                    <Label>Tipo de Público Predominante</Label>
                    <Select value={formData.audience_type} onValueChange={(value) => setFormData({ ...formData, audience_type: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {AUDIENCE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Distribuição por Faixa Etária (%)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm">13-17 anos</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_age_13_17) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_age_13_17: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">18-24 anos</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_age_18_24) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_age_18_24: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">25-34 anos</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_age_25_34) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_age_25_34: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">35-44 anos</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_age_35_44) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_age_35_44: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">45+ anos</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_age_45_plus) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_age_45_plus: v.toString() })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Distribuição por Gênero (%)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm">Masculino</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_male_percent) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_male_percent: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Feminino</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_female_percent) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_female_percent: v.toString() })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Outros</Label>
                            <PercentageInput
                                value={parseFloat(formData.audience_other_percent) || 0}
                                onChange={(v) => setFormData({ ...formData, audience_other_percent: v.toString() })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 6: Content Segmentation
    if (currentStep === 6) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold">🎯 Segmentação de Conteúdo</h3>

                <div>
                    <Label className="text-base font-semibold mb-2 block">Nichos de Conteúdo (selecione todos que se aplicam)</Label>
                    <div className="flex flex-wrap gap-2">
                        {NICHES.map(niche => (
                            <Badge
                                key={niche}
                                variant={formData.content_niche?.includes(niche) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleNiche(niche)}
                            >
                                {niche}
                                {formData.content_niche?.includes(niche) && <X className="w-3 h-3 ml-1" />}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <Label>Ideologia Política (Opcional)</Label>
                    <Select value={formData.political_ideology} onValueChange={(value) => setFormData({ ...formData, political_ideology: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {IDEOLOGIES.map(ideology => <SelectItem key={ideology} value={ideology}>{ideology}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-base font-semibold mb-2 block">Idiomas do Conteúdo</Label>
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => (
                            <Badge
                                key={lang}
                                variant={formData.content_language?.includes(lang) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleLanguage(lang)}
                            >
                                {lang}
                                {formData.content_language?.includes(lang) && <X className="w-3 h-3 ml-1" />}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 7: Performance Metrics
    if (currentStep === 7) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold">📈 Métricas de Performance</h3>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Taxa de Engajamento por Plataforma (%)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm">Instagram</Label>
                            <PercentageInput
                                value={parseFloat(formData.instagram_engagement_rate) || 0}
                                onChange={(v) => setFormData({ ...formData, instagram_engagement_rate: v.toString() })}
                                placeholder="Ex: 3,5%"
                            />
                        </div>
                        <div>
                            <Label className="text-sm">TikTok</Label>
                            <PercentageInput
                                value={parseFloat(formData.tiktok_engagement_rate) || 0}
                                onChange={(v) => setFormData({ ...formData, tiktok_engagement_rate: v.toString() })}
                                placeholder="Ex: 8,2%"
                            />
                        </div>
                        <div>
                            <Label className="text-sm">YouTube</Label>
                            <PercentageInput
                                value={parseFloat(formData.youtube_engagement_rate) || 0}
                                onChange={(v) => setFormData({ ...formData, youtube_engagement_rate: v.toString() })}
                                placeholder="Ex: 5,1%"
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Twitter/X</Label>
                            <PercentageInput
                                value={parseFloat(formData.twitter_engagement_rate) || 0}
                                onChange={(v) => setFormData({ ...formData, twitter_engagement_rate: v.toString() })}
                                placeholder="Ex: 2,3%"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Métricas Médias (Geral)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm">Visualizações Médias</Label>
                            <NumberInput
                                value={parseInt(formData.average_views) || 0}
                                onChange={(v) => setFormData({ ...formData, average_views: v.toString() })}
                                placeholder="50.000"
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Curtidas Médias</Label>
                            <NumberInput
                                value={parseInt(formData.average_likes) || 0}
                                onChange={(v) => setFormData({ ...formData, average_likes: v.toString() })}
                                placeholder="5.000"
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Comentários Médios</Label>
                            <NumberInput
                                value={parseInt(formData.average_comments) || 0}
                                onChange={(v) => setFormData({ ...formData, average_comments: v.toString() })}
                                placeholder="200"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
