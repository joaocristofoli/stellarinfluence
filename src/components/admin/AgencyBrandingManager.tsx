import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageIcon, Loader2, Save } from "lucide-react";
import type { AgencyBranding } from "@/integrations/supabase/types";

export const AgencyBrandingManager = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [branding, setBranding] = useState<AgencyBranding>({
        logo_url: null,
        agency_name: 'AGENCY',
        primary_color: '#FF6B35',
        secondary_color: '#004E89',
    });

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
                setBranding(data.value as AgencyBranding);
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
            <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                    <Label>Logo da Agência</Label>
                    <p className="text-sm text-muted-foreground">
                        Este logo aparecerá em todos os perfis de criadores e materiais gerados.
                    </p>
                    <ImageUpload
                        currentImage={branding.logo_url || undefined}
                        onImageUploaded={(url) => setBranding({ ...branding, logo_url: url })}
                        label="Logo da Agência"
                    />
                    {branding.logo_url && (
                        <div className="p-4 border rounded-lg bg-muted/20">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <img
                                src={branding.logo_url}
                                alt="Agency Logo"
                                className="max-h-24 w-auto mx-auto object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Agency Name */}
                <div className="space-y-2">
                    <Label>Nome da Agência</Label>
                    <Input
                        value={branding.agency_name}
                        onChange={(e) => setBranding({ ...branding, agency_name: e.target.value })}
                        placeholder="AGENCY"
                    />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={branding.primary_color}
                                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                                className="w-16 h-10 p-1"
                            />
                            <Input
                                value={branding.primary_color}
                                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                                placeholder="#FF6B35"
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
                                className="w-16 h-10 p-1"
                            />
                            <Input
                                value={branding.secondary_color}
                                onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                                placeholder="#004E89"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full">
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
        </Card>
    );
};
