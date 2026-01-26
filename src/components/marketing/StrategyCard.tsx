import { useState } from 'react';
import { Trash2, Edit2, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreators } from '@/hooks/useCreators';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/utils/formatters';
import { parseFollowerCount } from '@/utils/numberParsers';
import {
    MarketingStrategy,
    channelTypeLabels,
    channelTypeIcons,
    channelTypeColors
} from '@/types/marketing';

interface StrategyCardProps {
    strategy: MarketingStrategy;
    allStrategies: MarketingStrategy[];
    onEdit: (strategy: MarketingStrategy) => void;
    onDelete: (id: string) => void;
    onViewDetails: (strategy: MarketingStrategy) => void;
}

// Cores hex para estilos inline (glow, borda, gradiente)
const getChannelColor = (channelType: string): string => {
    const colors: Record<string, string> = {
        influencer: '#ec4899',
        paid_traffic: '#3b82f6',
        flyers: '#22c55e',
        physical_media: '#f97316',
        events: '#8b5cf6',
        partnerships: '#eab308',
        social_media: '#06b6d4',
        email_marketing: '#6366f1',
        radio: '#ef4444',
        sound_car: '#f59e0b',
        promoters: '#14b8a6',
    };
    return colors[channelType] || '#6b7280';
};

// ... imports cleaned up in next step, just logic first

export function StrategyCard({ strategy, allStrategies, onEdit, onDelete, onViewDetails }: StrategyCardProps & { onViewDetails: (s: MarketingStrategy) => void }) {
    // CRIT-001 fix: Estado para confirmação de delete
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // REMOVED: useStrategyTasks (Lag source)

    // CA-000: Fetch creators to resolve avatars (Cached by React Query)
    const { data: creators = [] } = useCreators();

    // Resolve linked creators (Multiple) & Sort by Followers Descending
    const linkedCreators = strategy.channelType === 'influencer' && strategy.linkedCreatorIds && strategy.linkedCreatorIds.length > 0
        ? creators
            .filter(c => strategy.linkedCreatorIds!.includes(c.id))
            .sort((a, b) => parseFollowerCount(b.total_followers) - parseFollowerCount(a.total_followers))
        : [];

    // Date Formatter
    const formatDateRange = (start?: Date | null, end?: Date | null) => {
        if (!start) return 'Sem data';
        const s = new Date(start);
        const e = end ? new Date(end) : null;

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        if (!e) return s.toLocaleDateString('pt-BR', options);
        return `${s.toLocaleDateString('pt-BR', options)} - ${e.toLocaleDateString('pt-BR', options)}`;
    };

    // REMOVED: Completion calculation (moved to Modal or simplified)

    const statusLabels = {
        planned: 'Planejado',
        in_progress: 'Em Andamento',
        completed: 'Concluído',
    };

    const statusColors = {
        planned: 'bg-muted text-muted-foreground',
        in_progress: 'bg-warning/20 text-warning-foreground border-warning',
        completed: 'bg-success/20 text-success border-success',
    };

    return (
        <>
            <Card
                // REVERTED: Removed break-inside-avoid-column, inline-block, mb-6
                className="overflow-hidden animate-fade-in relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group glass-premium border-l-[4px] cursor-pointer"
                style={{ borderLeftColor: getChannelColor(strategy.channelType) }}
                onClick={() => onViewDetails(strategy)} // Click card to open modal
            >
                {/* ... Header and shimmer same ... */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-0" />

                <CardHeader className="pb-3 relative z-10">
                    {/* ... Content Same ... */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {/* ... Avatar Group Same ... */}
                            {linkedCreators.length > 0 ? (
                                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300 p-1">
                                    {linkedCreators.slice(0, 3).map((creator, i) => (
                                        <div
                                            key={creator.id}
                                            className="relative w-12 h-12 rounded-xl shadow-lg transition-transform duration-300 hover:scale-110 hover:z-10 overflow-hidden border-2 border-white/20 shrink-0 bg-background"
                                            style={{
                                                zIndex: 3 - i,
                                                boxShadow: `0 4px 12px ${getChannelColor(strategy.channelType)}30`
                                            }}
                                            title={`${creator.name} (${creator.total_followers})`}
                                        >
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage src={creator.image_url || ''} className="object-cover" />
                                                <AvatarFallback className={`${channelTypeColors[strategy.channelType]} text-white text-[10px]`}>
                                                    {creator.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ))}
                                    {linkedCreators.length > 3 && (
                                        <TooltipProvider>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div className="relative w-12 h-12 rounded-xl shadow-lg flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-xs border-2 border-white/20 shrink-0 z-0 cursor-help">
                                                        +{linkedCreators.length - 3}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-background/95 backdrop-blur-xl border-white/20 text-foreground">
                                                    <p className="font-semibold mb-1 text-xs text-primary">Todos os {linkedCreators.length} creators:</p>
                                                    <ul className="text-xs space-y-1">
                                                        {linkedCreators.map(c => (
                                                            <li key={c.id} className="flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="w-1 h-1 rounded-full bg-primary" />
                                                                    {c.name}
                                                                </div>
                                                                <span className="text-muted-foreground text-[10px]">{c.total_followers}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            ) : (
                                /* Standard Icon Fallback */
                                <div
                                    className={`w-12 h-12 rounded-xl ${channelTypeColors[strategy.channelType]} flex items-center justify-center text-2xl shadow-lg transition-all duration-300 group-hover:scale-105 shrink-0`}
                                    style={{
                                        boxShadow: `0 8px 24px ${getChannelColor(strategy.channelType)}30`
                                    }}
                                >
                                    {channelTypeIcons[strategy.channelType]}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                {/* Improved Title: Reduced line-height for better density with line-clamp */}
                                <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight mb-1" title={strategy.name}>
                                    {strategy.name}
                                </h3>

                                {/* Date Display (New) */}
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium bg-background/50 rounded-md px-1.5 py-0.5 w-fit border border-white/5">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    {formatDateRange(strategy.startDate, strategy.endDate)}
                                </div>
                            </div>
                        </div>

                        {/* Actions (Hover Only) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(strategy); }} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirmOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 relative z-10">
                    {/* Metadata Grid (Minimalist) */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Budget */}
                        <div className="bg-secondary/40 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors group-hover:bg-secondary/60">
                            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-emerald-500 shadow-sm">
                                <span className="text-xs font-bold">$</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Orçamento</span>
                                <span className="text-sm font-bold text-foreground tabular-nums leading-none">
                                    {formatCurrency(strategy.budget)}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className={`rounded-lg p-2.5 flex items-center gap-2.5 border ${statusColors[strategy.status].replace('bg-', 'bg-opacity-20 ')} bg-opacity-20`}>
                            <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm`}>
                                <div className={`w-2 h-2 rounded-full ${statusColors[strategy.status].split(' ')[0].replace('/20', '')}`} />
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Status</span>
                                <span className="text-sm font-bold text-foreground leading-none">
                                    {statusLabels[strategy.status]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest pt-1 border-t border-border/50">
                        Clique para detalhes
                    </div>
                </CardContent>
            </Card>

            {/* Alert Dialog (Delete) */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                {/* ... same ... */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir estratégia?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{strategy.name}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={e => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(strategy.id);
                                setDeleteConfirmOpen(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

