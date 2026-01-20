import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { useSoftDelete } from "@/hooks/useSoftDelete";
import { useCityFilter } from "@/hooks/useCityFilter";
import { getSafeFollowerDisplay } from "@/utils/followers";
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
import { Pencil, Trash2, Loader2, ExternalLink, Palette, AlertTriangle, CheckCircle, GitMerge, CheckCircle2, Users, Plus } from "lucide-react";
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
import {
  parseFollowerCount,
  parseEngagementRate,
  meetsFollowerRequirement
} from "@/utils/creatorParsing";
import {
  PROFILE_CATEGORIES,
  getProfileTypeIcon,
  getProfileTypeLabel,
  getProfileTypeColor,
  MEDIA_GROUPS,
  ProfileType,
} from "@/types/profileTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MobileCreatorCard } from "./MobileCreatorCard";
import { FilterBar, FilterState } from "./FilterBar";

/**
 * CreatorsTable - Admin component for managing content creators
 * 
 * @description
 * Provides CRUD operations with soft delete, cascade checking,
 * approval workflow, and advanced filtering capabilities.
 */
export function CreatorsTable() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [linkedStrategiesCount, setLinkedStrategiesCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    city: "",
    mediaType: "",
    minFollowers: "",
    engagementMin: "",
    platforms: [],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Soft delete hook with undo capability
  const { softDelete, checkLinkedData, isPending } = useSoftDelete({
    tableName: 'creators',
    successMessage: 'Criador removido',
    undoMessage: 'Desfazer',
    undoTimeout: 5000,
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .is("deleted_at", null) // Only fetch non-deleted creators
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

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('creators')
        .update({ approval_status: 'approved', approved_at: new Date().toISOString() } as any) // Cast to any if Types aren't updated yet
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setCreators(prev => prev.map(c =>
        c.id === id ? { ...c, approval_status: 'approved' } : c
      ));

      toast({ title: "Criador Aprovado", description: "O perfil está agora visível no planejamento." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  /**
   * Check for linked strategies before deletion
   * Prevents orphaned data in marketing_strategies
   */
  const handleDeleteClick = useCallback(async (id: string) => {
    // Check for linked strategies
    const linkedTables = await checkLinkedData(id, [
      { table: 'marketing_strategies', field: 'linkedCreatorIds' },
    ]);

    if (linkedTables.length > 0) {
      // Get count of linked strategies
      const { data } = await (supabase as any)
        .from('marketing_strategies')
        .select('id')
        .contains('linkedCreatorIds', [id]);

      setLinkedStrategiesCount(data?.length || 0);
    } else {
      setLinkedStrategiesCount(0);
    }

    setDeleteId(id);
  }, [checkLinkedData]);

  /**
   * Execute soft delete with undo capability
   */
  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await softDelete(deleteId);
    if (success) {
      // Optimistically remove from list
      setCreators(prev => prev.filter(c => c.id !== deleteId));
    }
    setDeleteId(null);
  };

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(creators.map(c => c.category)));
  }, [creators]);

  /**
   * Filter creators with proper K/M suffix parsing
   * Handles engagement rate as string and validates all inputs
   */
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      // Search filter (name or category)
      if (filters.search &&
        !creator.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !creator.category?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && creator.category !== filters.category) {
        return false;
      }

      // City filter - case insensitive match
      if (filters.city && creator.city?.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Media type filter using MEDIA_GROUPS
      if (filters.mediaType) {
        const creatorProfileType = (creator.profile_type || 'influencer') as ProfileType;
        const mediaGroup = MEDIA_GROUPS[filters.mediaType as keyof typeof MEDIA_GROUPS];
        if (mediaGroup && !mediaGroup.includes(creatorProfileType)) {
          return false;
        }
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

      // FIX: Min followers filter with K/M suffix parsing
      if (filters.minFollowers) {
        if (!meetsFollowerRequirement(creator.total_followers, filters.minFollowers)) {
          return false;
        }
      }

      // FIX: Engagement filter with proper string parsing
      if (filters.engagementMin) {
        const creatorEngagement = parseEngagementRate(creator.engagement_rate);
        const minEngagement = parseFloat(filters.engagementMin);

        // Skip filter if either value is unparseable
        if (creatorEngagement !== null && !isNaN(minEngagement)) {
          if (creatorEngagement < minEngagement) return false;
        }
      }

      return true;
    });
  }, [creators, filters]);

  // Extract unique cities for filter - MUST be called before any early returns (Rules of Hooks)
  const { uniqueCities } = useCityFilter(creators);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-8 rounded-full mb-6 ring-1 ring-accent/20 shadow-[0_0_50px_-10px_hsla(var(--accent)/0.3)] backdrop-blur-sm">
          <Users className="w-16 h-16 text-accent" />
        </div>
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-3 tracking-tight">
          Comece sua jornada
        </h3>
        <p className="max-w-md mb-8 text-lg text-muted-foreground font-light leading-relaxed">
          Nenhum parceiro de mídia cadastrado ainda.<br />
          Adicione talentos para começar a gerenciar seu ecossistema.
        </p>
        <Button
          onClick={() => navigate("/admin/creators/new")}
          size="lg"
          className="bg-accent hover:bg-accent/90 hover:scale-105 transition-all duration-300 btn-glow shadow-xl shadow-accent/20 rounded-xl px-10 h-14 text-lg font-semibold"
        >
          <Plus className="w-6 h-6 mr-2" />
          Adicionar Primeiro Parceiro
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <FilterBar
          onFilterChange={setFilters}
          categories={categories}
          cities={uniqueCities}
        />
        {/* QW-001: Bulk Approve All Pending */}
        {filteredCreators.filter(c => (c as any).approval_status === 'pending').length > 0 && (
          <Button
            onClick={async () => {
              const pendingIds = filteredCreators
                .filter(c => (c as any).approval_status === 'pending')
                .map(c => c.id);

              const { error } = await supabase
                .from('creators')
                .update({ approval_status: 'approved', approved_at: new Date().toISOString() } as any)
                .in('id', pendingIds);

              if (error) {
                toast({ title: "Erro", description: error.message, variant: "destructive" });
                return;
              }

              // Optimistic update
              setCreators(prev => prev.map(c =>
                pendingIds.includes(c.id) ? { ...c, approval_status: 'approved' } : c
              ));

              toast({
                title: "Aprovação em Massa",
                description: `${pendingIds.length} criadores aprovados com sucesso!`
              });
            }}
            variant="outline"
            className="gap-2 border-green-500/50 text-green-600 hover:bg-green-500/10"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprovar Todos ({filteredCreators.filter(c => (c as any).approval_status === 'pending').length})
          </Button>
        )}
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
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Seguidores</TableHead>
                <TableHead>Engajamento</TableHead>
                <TableHead>Redes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/admin/creators/${creator.id}`)}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {creator.image_url && <img src={creator.image_url} className="w-8 h-8 rounded-full object-cover" />}
                        {creator.name}
                        {/* VISIBILITY: Profile Type Badge - ALWAYS VISIBLE with dynamic colors */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${getProfileTypeColor((creator.profile_type || 'influencer') as ProfileType)}`}>
                                {getProfileTypeIcon((creator.profile_type || 'influencer') as ProfileType)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {getProfileTypeLabel((creator.profile_type || 'influencer') as ProfileType)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {creator.approval_status === 'pending' ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-yellow-500/20 text-yellow-300 rounded-full animate-pulse">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-300 rounded-full">
                        Aprovado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{creator.category}</TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {getSafeFollowerDisplay(creator)}
                  </TableCell>
                  <TableCell>{creator.engagement_rate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {creator.instagram_active && (
                        <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-300 rounded" title="Instagram">IG</span>
                      )}
                      {creator.youtube_active && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded" title="YouTube">YT</span>
                      )}
                      {creator.tiktok_active && (
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded" title="TikTok">TT</span>
                      )}
                      {creator.twitter_active && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded" title="Twitter">TW</span>
                      )}
                      {creator.kwai_active && (
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded" title="Kwai">KW</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Actions container with click propagation stopped to prevent row navigation */}
                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      {creator.approval_status === 'pending' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-400 hover:bg-green-500/20"
                              onClick={(e) => handleApprove(creator.id, e)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Aprovar Criador</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/creators/${creator.id}`);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(creator.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Esta ação enviará o criador para a lixeira. Você poderá restaurá-lo por 5 segundos.
              </p>

              {linkedStrategiesCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Atenção: Vínculos Detectados</p>
                    <p className="text-sm opacity-90">
                      Este criador está vinculado a {linkedStrategiesCount} estratégia(s) de marketing.
                      A exclusão removerá o criador dessas estratégias.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {linkedStrategiesCount > 0 ? "Excluir e Remover Vínculos" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
