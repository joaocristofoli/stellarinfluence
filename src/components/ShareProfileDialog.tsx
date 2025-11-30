import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShareProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    creatorSlug: string;
}

export function ShareProfileDialog({ isOpen, onClose, creatorSlug }: ShareProfileDialogProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    // Construct the full URL - assuming the app is hosted at the current origin
    const profileUrl = `${window.location.origin}/creator/${creatorSlug}`;

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(profileUrl);
            } else {
                // Fallback for non-secure contexts (http)
                const textArea = document.createElement("textarea");
                textArea.value = profileUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    throw new Error("Falha ao copiar");
                }
                document.body.removeChild(textArea);
            }

            setCopied(true);
            toast({
                title: "Link copiado!",
                description: "O link do seu perfil foi copiado para a área de transferência.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
            toast({
                title: "Erro ao copiar",
                description: "Não foi possível copiar o link. Tente selecionar e copiar manualmente.",
                variant: "destructive",
            });
        }
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <Share2 className="w-5 h-5" />, // Using generic share icon for WA as specific one might not be in lucide-react basic set or just preference
            color: "bg-green-500 hover:bg-green-600",
            url: `https://wa.me/?text=${encodeURIComponent(`Confira meu perfil: ${profileUrl}`)}`
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-5 h-5" />,
            color: "bg-sky-500 hover:bg-sky-600",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira meu perfil: ${profileUrl}`)}`
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="w-5 h-5" />,
            color: "bg-blue-600 hover:bg-blue-700",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5" />,
            color: "bg-blue-500 hover:bg-blue-600",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-background/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-4 rounded-full hover:bg-white/10"
                                    onClick={onClose}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-accent/10 rounded-full mb-2">
                                        <Share2 className="w-8 h-8 text-accent" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                        Compartilhar Perfil
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Compartilhe seu perfil com o mundo e aumente seu alcance
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Copy Link Section */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Link do Perfil
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                readOnly
                                                value={profileUrl}
                                                className="pr-10 bg-secondary/50 border-white/5 focus-visible:ring-accent"
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            className={`${copied ? "bg-green-500 hover:bg-green-600" : "bg-accent hover:bg-accent/90"} transition-colors`}
                                            onClick={handleCopy}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Social Share Buttons */}
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Compartilhar em
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {shareLinks.map((link) => (
                                            <motion.a
                                                key={link.name}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-white transition-colors ${link.color}`}
                                            >
                                                {link.icon}
                                            </motion.a>
                                        ))}
                                    </div>
                                    <div className="flex justify-between px-1">
                                        {shareLinks.map((link) => (
                                            <span key={link.name} className="text-[10px] text-muted-foreground w-full text-center">
                                                {link.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Decoration */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
