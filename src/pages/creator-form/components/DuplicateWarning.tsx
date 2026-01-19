import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, GitMerge } from "lucide-react";

interface DuplicateWarningProps {
    duplicateName: string;
    onMerge?: () => void;
    onIgnore?: () => void;
}

export function DuplicateWarning({ duplicateName, onMerge, onIgnore }: DuplicateWarningProps) {
    return (
        <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10 text-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-400">Possível Duplicata Detectada</AlertTitle>
            <AlertDescription className="mt-2 text-orange-200/80">
                Já existe um criador cadastrado com o nome <strong>{duplicateName}</strong> ou com a mesma URL de rede social.

                <div className="flex gap-3 mt-4">
                    {onMerge && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30 text-orange-300"
                            onClick={onMerge}
                        >
                            <GitMerge className="w-4 h-4 mr-2" />
                            Mesclar Perfis
                        </Button>
                    )}
                    {onIgnore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-300/70 hover:text-orange-200 hover:bg-orange-500/20"
                            onClick={onIgnore}
                        >
                            Ignorar (Criar Novo)
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}
