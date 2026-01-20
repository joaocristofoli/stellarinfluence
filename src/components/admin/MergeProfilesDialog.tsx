import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreators } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Merge, AlertTriangle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MergeProfilesDialog() {
    const [open, setOpen] = useState(false);
    const { data: creators = [], isLoading } = useCreators();
    const [sourceId, setSourceId] = useState<string>("");
    const [targetId, setTargetId] = useState<string>("");
    const [confirmSlug, setConfirmSlug] = useState("");
    const [isMerging, setIsMerging] = useState(false);
    const { toast } = useToast();

    const sourceCreator = creators.find(c => c.id === sourceId);
    const targetCreator = creators.find(c => c.id === targetId);

    const handleMerge = async () => {
        if (!sourceId || !targetId || sourceId === targetId) return;
        if (confirmSlug !== sourceCreator?.slug) {
            toast({
                title: "Confirmação incorreta",
                description: "Digite o slug do perfil de origem para confirmar.",
                variant: "destructive"
            });
            return;
        }

        setIsMerging(true);
        try {
            const { error } = await (supabase as any).rpc('merge_creators', {
                target_creator_id: targetId,
                source_creator_id: sourceId
            });

            if (error) throw error;

            toast({
                title: "Fusão concluída",
                description: `O perfil ${sourceCreator?.name} foi fundido em ${targetCreator?.name}.`
            });
            setOpen(false);
            setSourceId("");
            setTargetId("");
            setConfirmSlug("");
        } catch (error: any) {
            console.error("Error merging:", error);
            toast({
                title: "Erro na fusão",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10">
                    <Merge className="w-4 h-4" />
                    Mesclar Perfis
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Merge className="w-5 h-5 text-purple-600" />
                        Mesclar Perfis Duplicados
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Alert variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertTitle>Atenção: Ação Irreversível</AlertTitle>
                        <AlertDescription>
                            Todas as estratégias e conexões do perfil de <strong>ORIGEM</strong> serão movidas para o perfil de <strong>DESTINO</strong>.
                            O perfil de origem será deletado.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                        <div className="space-y-2">
                            <Label>Origem (Será Deletado)</Label>
                            <Select value={sourceId} onValueChange={setSourceId}>
                                <SelectTrigger className="border-red-500/30 bg-red-500/5">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {creators.filter(c => c.id !== targetId).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.slug})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <ArrowRight className="w-6 h-6 text-muted-foreground mt-6" />

                        <div className="space-y-2">
                            <Label>Destino (Será Mantido)</Label>
                            <Select value={targetId} onValueChange={setTargetId}>
                                <SelectTrigger className="border-green-500/30 bg-green-500/5">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {creators.filter(c => c.id !== sourceId).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.slug})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {sourceId && targetId && (
                        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                            <Label className="text-xs uppercase text-muted-foreground">Confirmação de Segurança</Label>
                            <p className="text-sm text-foreground mb-2">
                                Digite o slug do perfil de origem: <code className="bg-muted px-1 py-0.5 rounded text-red-500">{sourceCreator?.slug}</code>
                            </p>
                            <Input
                                value={confirmSlug}
                                onChange={e => setConfirmSlug(e.target.value)}
                                placeholder={`Digite "${sourceCreator?.slug}" para confirmar`}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        variant="destructive"
                        onClick={handleMerge}
                        disabled={!sourceId || !targetId || confirmSlug !== sourceCreator?.slug || isMerging}
                    >
                        {isMerging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Merge className="w-4 h-4 mr-2" />}
                        Confirmar Fusão
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
