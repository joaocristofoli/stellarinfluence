import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Creator = {
  id: string;
  name: string;
  category: string;
  total_followers: string;
  engagement_rate: string;
  instagram_active: boolean;
  youtube_active: boolean;
  tiktok_active: boolean;
  twitter_active: boolean;
};

export function CreatorsTable() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar criadores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("creators")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Criador removido",
        description: "O criador foi removido com sucesso.",
      });

      fetchCreators();
    } catch (error: any) {
      toast({
        title: "Erro ao remover criador",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-12 glass rounded-3xl">
        <p className="text-muted-foreground mb-4">
          Nenhum criador cadastrado ainda
        </p>
        <Button
          onClick={() => navigate("/admin/creators/new")}
          className="bg-accent hover:bg-accent/90"
        >
          Cadastrar primeiro criador
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Engajamento</TableHead>
              <TableHead>Redes Ativas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell className="font-medium">{creator.name}</TableCell>
                <TableCell>{creator.category}</TableCell>
                <TableCell>{creator.total_followers}</TableCell>
                <TableCell>{creator.engagement_rate}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {creator.instagram_active && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                        IG
                      </span>
                    )}
                    {creator.youtube_active && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                        YT
                      </span>
                    )}
                    {creator.tiktok_active && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                        TT
                      </span>
                    )}
                    {creator.twitter_active && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                        TW
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/creators/${creator.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(creator.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este criador? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
