import { CreatorFormData } from "@/types/creatorForm";
import { MediaUploadZone } from "../components/MediaUploadZone";
import { uploadToSupabase } from "@/utils/uploadUtils"; // We might need to create this or perform logic inline
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
            </div>
        </div>
    );
}
