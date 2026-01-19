import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, FileImage, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MediaUploadZoneProps {
    onUpload: (files: File[]) => Promise<void>;
    isUploading?: boolean;
    acceptedFileTypes?: Record<string, string[]>;
    maxFiles?: number;
    description?: string;
    existingUrls?: string[];
    onRemoveUrl?: (url: string) => void;
}

export function MediaUploadZone({
    onUpload,
    isUploading = false,
    acceptedFileTypes = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles = 5,
    description = "Arraste fotos ou clique para selecionar",
    existingUrls = [],
    onRemoveUrl
}: MediaUploadZoneProps) {

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            await onUpload(acceptedFiles);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles,
        disabled: isUploading
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
                    isDragActive
                        ? "border-accent bg-accent/10 scale-[1.02]"
                        : "border-white/10 hover:border-white/30 hover:bg-white/5",
                    isUploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
                        <p className="text-sm text-muted-foreground">Enviando arquivos...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                        <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-accent/20' : 'bg-white/5'}`}>
                            <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-accent' : 'text-muted-foreground'}`} />
                        </div>
                        <p className="text-lg font-medium mb-1">
                            {isDragActive ? "Solte os arquivos aqui" : "Upload de Mídia"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {description}
                        </p>
                    </div>
                )}
            </div>

            {/* Gallery Preview */}
            {existingUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {existingUrls.map((url, index) => (
                        <div key={url + index} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20">
                            <img
                                src={url}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            {onRemoveUrl && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveUrl(url);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
