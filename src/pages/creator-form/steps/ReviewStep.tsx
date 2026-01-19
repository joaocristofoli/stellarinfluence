import { CreatorFormData } from "@/types/creatorForm";
import { Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewStepProps {
    formData: CreatorFormData;
    onSubmit: () => void;
    onEditStep: (step: number) => void;
    isSubmitting: boolean;
}

export function ReviewStep({ formData, onSubmit, onEditStep, isSubmitting }: ReviewStepProps) {
    // Helper to count active socials
    const activeSocials = [
        formData.instagram_active,
        formData.youtube_active,
        formData.tiktok_active,
        formData.twitter_active,
        formData.kwai_active
    ].filter(Boolean).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Revisão Final</h1>
                <p className="text-white/60">Confira os dados antes de enviar</p>
            </div>

            <div className="space-y-4">
                {/* Basic Info Summary */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span>
                            Informações Básicas
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">Nome</span>
                            <span className="font-medium">{formData.name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Categoria</span>
                            <span className="font-medium">{formData.category || '-'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Slug (URL)</span>
                            <span className="font-medium text-accent">/{formData.slug}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Tipo</span>
                            <span className="font-medium capitalize">{formData.profile_type}</span>
                        </div>
                    </div>
                </div>

                {/* Social Summary */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">2</span>
                            Redes Sociais
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-sm">
                        <p className="mb-2">
                            <span className="text-muted-foreground">Plataformas Ativas:</span>
                            <strong className="ml-2">{activeSocials}</strong>
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {formData.instagram_active && <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">Instagram</span>}
                            {formData.youtube_active && <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">YouTube</span>}
                            {formData.tiktok_active && <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">TikTok</span>}
                        </div>
                    </div>
                </div>

                {/* Media Summary */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">3</span>
                            Galeria
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Imagens na galeria:</span>
                        <strong className="ml-2">{(formData.gallery_urls || []).length}</strong>
                    </div>
                </div>
            </div>

            <Button
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={onSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>Enviando...</>
                ) : (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirmar Cadastro
                    </>
                )}
            </Button>
        </div>
    );
}
