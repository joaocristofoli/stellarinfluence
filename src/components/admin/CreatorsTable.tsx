import { useEffect, useState, useMemo } from "react";
import { Creator } from "@/types/creator";
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
import { Pencil, Trash2, Loader2, ExternalLink, Palette } from "lucide-react";
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
import { MobileCreatorCard } from "./MobileCreatorCard";
import { FilterBar, FilterState } from "./FilterBar";

// Removed local Creator type; using shared type from '@/types/creator'

export function CreatorsTable() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    minFollowers: "",
    engagementMin: "",
    platforms: [],
  });
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
      setCreators((data as unknown as Creator[]) || []);
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

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(creators.map(c => c.category)));
  }, [creators]);

  // Filter creators based on FilterState
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      // Search filter
      if (filters.search &&
        !creator.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !creator.category.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && creator.category !== filters.category) {
        return false;
      }

      // Platform filters
      if (filters.platforms.length > 0) {
        const hasMatchingPlatform = filters.platforms.some(platform => {
          if (platform === "instagram") return creator.instagram_active;
          if (platform === "youtube") return creator.youtube_active;
          if (platform === "tiktok") return creator.tiktok_active;
          if (platform === "twitter") return creator.twitter_active;
          if (platform === "kwai") return creator.kwai_active;
          return false;
        });
        if (!hasMatchingPlatform) return false;
      }

      // Min followers filter (simple comparison)
      if (filters.minFollowers) {
        // This is a simple string comparison, could be enhanced
        // to parse K/M suffixes
      }

      // Engagement filter
      if (filters.engagementMin) {
        const creatorEngagement = parseFloat(creator.engagement_rate);
        const minEngagement = parseFloat(filters.engagementMin);
        if (creatorEngagement < minEngagement) return false;
      }

      return true;
    });
  }, [creators, filters]);

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
      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar onFilterChange={setFilters} categories={categories} />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {filteredCreators.length === 0 ? (
          <div className="text-center py-8 glass rounded-2xl">
            <p className="text-muted-foreground">Nenhum criador encontrado com os filtros aplicados</p>
          </div>
        ) : (
          filteredCreators.map((creator) => (
            <MobileCreatorCard
              key={creator.id}
              creator={creator}
              onDelete={setDeleteId}
            />
          ))
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block glass rounded-3xl overflow-hidden">
        {filteredCreators.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum criador encontrado com os filtros aplicados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Seguidores</TableHead>
                <TableHead>Seguidores Kwai</TableHead>
                <TableHead>Engajamento</TableHead>
                <TableHead>Redes Ativas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id}>
                  <TableCell className="font-medium">{creator.name}</TableCell>
                  <TableCell>{creator.category}</TableCell>
                  <TableCell>{creator.total_followers}</TableCell>
                  <TableCell>{creator.kwai_followers || "-"}</TableCell>
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
                      {creator.kwai_active && (
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                          KW
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/creator/${creator.slug}`, '_blank')}
                        title="Ver perfil público"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/creators/${creator.id}/landing`)}
                        title="Editar landing page"
                      >
                        <Palette className="w-4 h-4" />
                      </Button>
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
        )}
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
