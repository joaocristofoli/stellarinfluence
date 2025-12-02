import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    currentImage?: string;
    onImageUploaded: (url: string | string[]) => void;
    label?: string;
    multiple?: boolean;
    maxFiles?: number;
}

export function ImageUpload({ currentImage, onImageUploaded, label = "Foto do Criador", multiple = false, maxFiles = 1 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Sync preview when currentImage prop changes
    useEffect(() => {
        setPreview(currentImage || null);
    }, [currentImage]);

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    // Max dimensions
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image'));
                                return;
                            }
                            // Create new file with same name but .jpg extension if it wasn't
                            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                            const newFile = new File([blob], newName, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        },
                        'image/jpeg',
                        0.7
                    );
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (multiple && files.length > maxFiles) {
            toast({
                title: "Muitos arquivos",
                description: `Selecione no máximo ${maxFiles} arquivos.`,
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            // Process each file
            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                // Validate type
                if (!file.type.startsWith('image/')) continue;

                // Validate size and compress if needed
                if (file.size > 5 * 1024 * 1024) {
                    try {
                        file = await compressImage(file);
                    } catch (error) {
                        console.error("Compression error:", error);
                        continue;
                    }
                }

                // Create unique filename
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${i}.${fileExt}`;
                const filePath = `creators/${fileName}`;

                // Upload
                const { error } = await supabase.storage
                    .from('creator-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('creator-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            if (uploadedUrls.length > 0) {
                if (multiple) {
                    onImageUploaded(uploadedUrls);
                    toast({
                        title: "Imagens enviadas!",
                        description: `${uploadedUrls.length} fotos foram carregadas.`,
                    });
                } else {
                    setPreview(uploadedUrls[0]);
                    onImageUploaded(uploadedUrls[0]);
                    toast({
                        title: "Imagem enviada!",
                        description: "A foto foi carregada com sucesso.",
                    });
                }
            }
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
                {!multiple && preview ? (
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
                        multiple={multiple}
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
