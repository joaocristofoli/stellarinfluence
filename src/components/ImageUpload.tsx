import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    currentImage?: string;
    onImageUploaded: (url: string) => void;
    label?: string;
}

export function ImageUpload({ currentImage, onImageUploaded, label = "Foto do Criador" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Arquivo inválido",
                description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Arquivo muito grande",
                description: "A imagem deve ter no máximo 5MB",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `creators/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('creator-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('creator-images')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onImageUploaded(publicUrl);

            toast({
                title: "Imagem enviada!",
                description: "A foto foi carregada com sucesso.",
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: "Erro no upload",
                description: error.message || "Não foi possível fazer upload da imagem",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageUploaded('');
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <div className="flex items-start gap-4">
                {/* Preview */}
                {preview ? (
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted border-2 border-border">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemove}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full sm:w-auto"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                {preview ? 'Trocar Imagem' : 'Fazer Upload'}
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        JPG, PNG ou GIF. Máximo 5MB.
                    </p>
                </div>
            </div>
        </div>
    );
}
