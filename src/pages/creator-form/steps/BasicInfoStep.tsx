import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    PROFILE_CATEGORIES,
    CATEGORIES_BY_PROFILE_TYPE,
    EXTRA_FIELDS_BY_TYPE,
    ProfileType
} from "@/types/profileTypes";
import { CreatorFormData } from "@/types/creatorForm";
import { ImageUpload } from "@/components/ImageUpload";
import { DuplicateWarning } from "../components/DuplicateWarning";
import { AgencySelect } from "../components/AgencySelect";

interface BasicInfoStepProps {
    formData: CreatorFormData;
    setFormData: (data: CreatorFormData) => void;
    isAdmin: boolean;
    duplicates: any[];
    onMerge?: () => void;
    onIgnoreDuplicate?: () => void;
}

export function BasicInfoStep({
    formData,
    setFormData,
    isAdmin,
    duplicates,
    onMerge,
    onIgnoreDuplicate
}: BasicInfoStepProps) {

    // Helper to extract handle from slug/url
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.includes(' ')) return;
        setFormData({ ...formData, slug: value.toLowerCase() });
    };

    // Helper to format phone
    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, 11);
        if (limited.length <= 2) return `(${limited}`;
        if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    };

    const extraFields = formData.profile_type ? EXTRA_FIELDS_BY_TYPE[formData.profile_type as ProfileType] : {};

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Perfil do Criador</h1>
                <p className="text-white/60">Informações básicas e apresentação</p>
            </div>

            {/* Duplicate Warning */}
            {duplicates.length > 0 && (
                <DuplicateWarning
                    duplicateName={duplicates[0].name}
                    onMerge={onMerge}
                    onIgnore={onIgnoreDuplicate}
                />
            )}

            {/* Profile Type Selector - Admin Only */}
            {isAdmin && (
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Tipo de Perfil</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {PROFILE_CATEGORIES.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, profile_type: type.id as ProfileType, category: '' })}
                                className={`
                                    p-3 rounded-xl border-2 transition-all text-left
                                    ${formData.profile_type === type.id
                                        ? 'border-accent bg-accent/10 shadow-lg'
                                        : 'border-white/10 hover:border-white/30 bg-black/20'
                                    }
                                `}
                            >
                                <span className="text-2xl block mb-1">{type.icon}</span>
                                <span className="text-sm font-medium block">{type.label}</span>
                                <span className="text-xs text-muted-foreground block truncate">{type.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ImageUpload
                currentImage={formData.image_url}
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url as string })}
                label="Foto de Perfil / Logo"
            />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Nome Completo / Razão Social</Label>
                    <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: João Silva ou Empresa X"
                    />
                </div>

                {isAdmin ? (
                    <div className="space-y-2">
                        <Label>@ do Instagram (Identificador Principal)</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-2 rounded-md border border-white/10">@</span>
                            <Input
                                value={formData.instagram_url?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || formData.slug}
                                onChange={e => {
                                    const handle = e.target.value.replace('@', '').toLowerCase();
                                    setFormData({
                                        ...formData,
                                        slug: handle,
                                        instagram_url: handle ? `https://instagram.com/${handle}` : '',
                                        instagram_active: handle ? true : formData.instagram_active
                                    });
                                }}
                                placeholder="ex: joaosilva"
                                className="flex-1"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label>Link Personalizado</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">seu-site.com/</span>
                            <Input value={formData.slug} onChange={handleSlugChange} placeholder="ex: joao-silva" className="flex-1" />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Selecione uma categoria...</option>
                        {formData.profile_type && CATEGORIES_BY_PROFILE_TYPE[formData.profile_type as ProfileType]?.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <AgencySelect
                        value={formData.agency_id}
                        onChange={(value) => setFormData({ ...formData, agency_id: value })}
                    />
                </div>

                {/* Dynamic Fields based on Profile Type */}
                {isAdmin && formData.profile_type && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        {extraFields.company && (
                            <div className="space-y-2">
                                <Label>{extraFields.company}</Label>
                                <Input
                                    value={formData.company || ''}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        )}
                        {extraFields.program && (
                            <div className="space-y-2">
                                <Label>{extraFields.program}</Label>
                                <Input
                                    value={formData.program_name || ''}
                                    onChange={e => setFormData({ ...formData, program_name: e.target.value })}
                                />
                            </div>
                        )}
                        {extraFields.reach && (
                            <div className="space-y-2">
                                <Label>{extraFields.reach}</Label>
                                <Input
                                    value={formData.reach || ''}
                                    onChange={e => setFormData({ ...formData, reach: e.target.value })}
                                />
                            </div>
                        )}
                        {/* New Outdoor/BTL Fields */}
                        {extraFields.location && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>{extraFields.location}</Label>
                                <Input
                                    value={formData.location || ''}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Endereço, coordenadas ou ponto de referência"
                                />
                            </div>
                        )}
                        {extraFields.dimensions && (
                            <div className="space-y-2">
                                <Label>{extraFields.dimensions}</Label>
                                <Input
                                    value={formData.dimensions || ''}
                                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                                    placeholder="Ex: 9x3m"
                                />
                            </div>
                        )}
                        {extraFields.traffic && (
                            <div className="space-y-2">
                                <Label>{extraFields.traffic}</Label>
                                <Input
                                    value={formData.traffic || ''}
                                    onChange={e => setFormData({ ...formData, traffic: e.target.value })}
                                    placeholder="Ex: 50.000 visualizações/dia"
                                />
                            </div>
                        )}
                        {extraFields.format && (
                            <div className="space-y-2">
                                <Label>{extraFields.format}</Label>
                                <Input
                                    value={formData.format || ''}
                                    onChange={e => setFormData({ ...formData, format: e.target.value })}
                                    placeholder="Ex: Stand 3x3m"
                                />
                            </div>
                        )}
                        {/* Premium Agency Outdoor Fields */}
                        {extraFields.face && (
                            <div className="space-y-2">
                                <Label>{extraFields.face}</Label>
                                <Input
                                    value={formData.outdoor_face || ''}
                                    onChange={e => setFormData({ ...formData, outdoor_face: e.target.value })}
                                    placeholder="Ex: Face Norte / A"
                                />
                            </div>
                        )}
                        {extraFields.lighting && (
                            <div className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-white/5 h-[42px] mt-[29px]">
                                <Label className="cursor-pointer" htmlFor="lighting-check">{extraFields.lighting}</Label>
                                <input
                                    id="lighting-check"
                                    type="checkbox"
                                    checked={formData.outdoor_lighting || false}
                                    onChange={e => setFormData({ ...formData, outdoor_lighting: e.target.checked })}
                                    className="w-5 h-5 accent-accent"
                                />
                            </div>
                        )}
                        {extraFields.min_period && (
                            <div className="space-y-2">
                                <Label>{extraFields.min_period}</Label>
                                <Input
                                    value={formData.min_period || ''}
                                    onChange={e => setFormData({ ...formData, min_period: e.target.value })}
                                    placeholder="Ex: Bi-semana (14 dias)"
                                />
                            </div>
                        )}
                        {extraFields.gps_coordinates && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>{extraFields.gps_coordinates}</Label>
                                <Input
                                    value={formData.gps_coordinates || ''}
                                    onChange={e => setFormData({ ...formData, gps_coordinates: e.target.value })}
                                    placeholder="-23.550520, -46.633308"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Bio / Descrição</Label>
                    <Textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Uma breve descrição..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Contato (WhatsApp)</Label>
                    <Input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        placeholder="(00) 00000-0000"
                        inputMode="tel"
                    />
                </div>
            </div>
        </div>
    );
}
