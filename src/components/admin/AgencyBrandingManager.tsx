import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageIcon, Loader2, Save, Scissors, Trash2 } from "lucide-react";
import type { AgencyBranding } from "@/integrations/supabase/types";
import { ImageCropper } from "@/components/admin/ImageCropper";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const AgencyBrandingManager = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [branding, setBranding] = useState<AgencyBranding>({
        logo_url: null,
        agency_name: 'AGENCY',
        primary_color: '#FF6B35',
        secondary_color: '#004E89',
        logo_position: 'left',
        logo_height_desktop: 40,
        logo_height_mobile: 32,
        logo_margin_top: 0
    });

    // Cropper State
    const [cropperOpen, setCropperOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("agency_settings")
                .select("value")
                .eq("key", "branding")
                .maybeSingle();

            if (error) throw error;
            if (data?.value) {
                setBranding({
                    ...branding, // defaults
                    ...(data.value as AgencyBranding)
                });
            }
        } catch (error: any) {
            console.error("Error fetching branding:", error);
            toast.error("Erro ao carregar configurações");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("agency_settings")
                .upsert({
                    key: "branding",
                    value: branding as any,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error("Error saving branding:", error);
            toast.error("Erro ao salvar configurações");
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelected = (file: File) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setTempImageSrc(reader.result as string);
            setCropperOpen(true);
        });
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            const fileName = `agency-logo-${Date.now()}.png`;
            const { data, error } = await supabase.storage
                .from('agency_assets')
                .upload(fileName, croppedBlob, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('agency_assets')
                .getPublicUrl(fileName);

            setBranding({ ...branding, logo_url: publicUrl });
            toast.success("Logo recortado e salvo!");
        } catch (error) {
            console.error("Error uploading cropped image:", error);
            toast.error("Erro ao salvar imagem recortada");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Marca da Agência
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Logo Upload & Crop */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">Logo da Agência</Label>
                        {branding.logo_url && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setTempImageSrc(branding.logo_url);
                                        setCropperOpen(true);
                                    }}
                                >
                                    <Scissors className="w-4 h-4 mr-2" />
                                    Recortar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setBranding({ ...branding, logo_url: null })}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Faça upload do logo. Você poderá recortá-lo antes de salvar.
                            </p>
                            {/* We override the default upload behavior to open cropper */}
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageSelected(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-sm font-medium">Clique para selecionar imagem</span>
                                </div>
                            </div>
                        </div>

                        {branding.logo_url && (
                            <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/20">
                                <img
                                    src={branding.logo_url}
                                    alt="Agency Logo"
                                    style={{
                                        height: `${branding.logo_height_desktop || 40}px`,
                                        marginTop: `${branding.logo_margin_top || 0}px`
                                    }}
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Advanced Display Settings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Aparência no Site</h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Position */}
                        <div className="space-y-4">
                            <Label>Posição do Logo (Navbar)</Label>
                            <RadioGroup
                                value={branding.logo_position || 'left'}
                                onValueChange={(val: any) => setBranding({ ...branding, logo_position: val })}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="left" id="pos-left" />
                                    <Label htmlFor="pos-left">Esquerda</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="center" id="pos-center" />
                                    <Label htmlFor="pos-center">Centro</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="right" id="pos-right" />
                                    <Label htmlFor="pos-right">Direita</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Margin Top */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Margem Superior (Ajuste Vertical)</Label>
                                <span className="text-xs text-muted-foreground">{branding.logo_margin_top || 0}px</span>
                            </div>
                            <Slider
                                value={[branding.logo_margin_top || 0]}
                                min={-20}
                                max={20}
                                step={1}
                                onValueChange={(vals) => setBranding({ ...branding, logo_margin_top: vals[0] })}
                            />
                        </div>

                        {/* Desktop Size */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Tamanho Desktop (Altura)</Label>
                                <span className="text-xs text-muted-foreground">{branding.logo_height_desktop || 40}px</span>
                            </div>
                            <Slider
                                value={[branding.logo_height_desktop || 40]}
                                min={20}
                                max={100}
                                step={1}
                                onValueChange={(vals) => setBranding({ ...branding, logo_height_desktop: vals[0] })}
                            />
                        </div>

                        {/* Mobile Size */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Tamanho Mobile (Altura)</Label>
                                <span className="text-xs text-muted-foreground">{branding.logo_height_mobile || 32}px</span>
                            </div>
                            <Slider
                                value={[branding.logo_height_mobile || 32]}
                                min={15}
                                max={60}
                                step={1}
                                onValueChange={(vals) => setBranding({ ...branding, logo_height_mobile: vals[0] })}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Branding Colors & Name */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nome da Agência (Texto Alternativo)</Label>
                        <Input
                            value={branding.agency_name}
                            onChange={(e) => setBranding({ ...branding, agency_name: e.target.value })}
                            placeholder="AGENCY"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cor Primária</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={branding.primary_color}
                                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={branding.primary_color}
                                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Cor Secundária</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={branding.secondary_color}
                                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={branding.secondary_color}
                                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </CardContent>

            <ImageCropper
                open={cropperOpen}
                onClose={() => setCropperOpen(false)}
                imageSrc={tempImageSrc}
                onCropComplete={handleCropComplete}
            />
        </Card>
    );
};
