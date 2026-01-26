import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image } from "lucide-react";
import { CreatorFormData } from "@/types/creatorForm";
import { MediaUploadZone } from "../components/MediaUploadZone";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaStepProps {
    formData: CreatorFormData;
    setFormData: (data: CreatorFormData) => void;
}

export function MediaStep({ formData, setFormData }: MediaStepProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleUpload = async (files: File[]) => {
        setIsUploading(true);
        try {
            const newUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('creator_gallery')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('creator_gallery')
                    .getPublicUrl(filePath);

                newUrls.push(publicUrl);
            }

            setFormData({
                ...formData,
                gallery_urls: [...(formData.gallery_urls || []), ...newUrls]
            });

            toast({
                title: "Sucesso",
                description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: "Erro no Upload",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = (urlToRemove: string) => {
        setFormData({
            ...formData,
            gallery_urls: (formData.gallery_urls || []).filter(url => url !== urlToRemove)
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Galeria & Mídia Kit</h1>
                <p className="text-white/60">Adicione fotos, banners e apresentação</p>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-3">Galeria de Fotos</h3>
                    <MediaUploadZone
                        onUpload={handleUpload}
                        isUploading={isUploading}
                        acceptedFileTypes={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                        existingUrls={formData.gallery_urls}
                        onRemoveUrl={handleRemove}
                        description="Arraste fotos de alta qualidade do criador"
                    />
                </div>

                {/* 
                   Future expansion: PDF Media Kit upload
                   For now, reusing the zone logic or adding a specific one for PDFs
                */}
                <div>
                    <div className="flex items-center justify-between mb-4 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-medium">Configuração de Capa (Home)</h3>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <Label htmlFor="featured-switch" className="text-sm cursor-pointer">Destaque na Home</Label>
                            <Switch
                                id="featured-switch"
                                checked={formData.admin_metadata?.featured || false}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, featured: checked }
                                })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Imagem de Capa (URL)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://..."
                                    value={formData.admin_metadata?.home_image || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        admin_metadata: { ...formData.admin_metadata, home_image: e.target.value }
                                    })}
                                />
                                <Button size="icon" variant="outline" className="shrink-0" onClick={() => {
                                    // Quick Copy from first gallery image if available
                                    if (formData.gallery_urls?.[0]) {
                                        setFormData({
                                            ...formData,
                                            admin_metadata: { ...formData.admin_metadata, home_image: formData.gallery_urls[0] }
                                        })
                                    }
                                }} title="Copiar da Galeria">
                                    <Image className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">URL direta da imagem recortada para a home.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Posição do Recorte</Label>
                            <Select
                                value={formData.admin_metadata?.home_image_pos || 'center center'}
                                onValueChange={(val) => setFormData({
                                    ...formData,
                                    admin_metadata: { ...formData.admin_metadata, home_image_pos: val }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center center">Centralizado</SelectItem>
                                    <SelectItem value="top center">Topo Centro</SelectItem>
                                    <SelectItem value="bottom center">Base Centro</SelectItem>
                                    <SelectItem value="center left">Centro Esquerda</SelectItem>
                                    <SelectItem value="center right">Centro Direita</SelectItem>
                                    <SelectItem value="top left">Topo Esquerda</SelectItem>
                                    <SelectItem value="top right">Topo Direita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Preview */}
                    {(formData.admin_metadata?.home_image || formData.gallery_urls?.[0]) && (
                        <div className="mt-4 p-4 border border-white/10 rounded-xl bg-black/20">
                            <p className="text-xs text-muted-foreground mb-2">Pré-visualização do Card</p>
                            <div className="relative w-full max-w-xs h-80 rounded-xl overflow-hidden border border-white/10 mx-auto">
                                <img
                                    src={formData.admin_metadata?.home_image || formData.gallery_urls?.[0]}
                                    className="w-full h-full object-cover"
                                    style={{
                                        objectPosition: formData.admin_metadata?.home_image_pos || 'center center'
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h4 className="font-bold text-white text-lg">{formData.name || 'Nome do Criador'}</h4>
                                    <p className="text-white/60 text-xs">{formData.category || 'Categoria'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
