import { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp, Link2, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
    MarketingStrategy,
    channelTypeLabels,
    channelTypeIcons,
    channelTypeColors
} from '@/types/marketing';
import { TaskList } from './TaskList';
import { useStrategyTasks } from '@/hooks/useStrategyTasks';

interface StrategyCardProps {
    strategy: MarketingStrategy;
    allStrategies: MarketingStrategy[];
    onEdit: (strategy: MarketingStrategy) => void;
    onDelete: (id: string) => void;
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

export function StrategyCard({ strategy, allStrategies, onEdit, onDelete }: StrategyCardProps) {
    const [expanded, setExpanded] = useState(false);
    // CRIT-001 fix: Estado para confirmação de delete
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const { data: tasks = [] } = useStrategyTasks(strategy.id);

    // CA-000: Fetch creators to resolve avatars (Cached by React Query)
    const { data: creators = [] } = useCreators();

    // Resolve linked creator (Primary)
    const linkedCreator = strategy.channelType === 'influencer' && strategy.linkedCreatorIds && strategy.linkedCreatorIds.length > 0
        ? creators.find(c => strategy.linkedCreatorIds![0] === c.id)
        : null;

    // Calculate task progress
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // formatCurrency importado de @/utils/formatters

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

    const connectedStrategies = allStrategies.filter(s =>
        strategy.connections.includes(s.id)
    );

    return (
        <>
            {/* CARD-001: Borda lateral colorida + CARD-005: Hover float + QW-002: Glass Premium */}
            <Card
                className="overflow-hidden animate-fade-in relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group glass-premium"
                style={{ borderLeft: `4px solid ${getChannelColor(strategy.channelType)}` }}
            >
                {/* CARD-002: Header com gradiente sutil */}
                <CardHeader
                    className="pb-3 relative"
                    style={{
                        background: `linear-gradient(135deg, ${getChannelColor(strategy.channelType)}08 0%, transparent 100%)`
                    }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* CA-001: Face-First Logic - Show Avatar if Influencer */}
                            {linkedCreator ? (
                                <div
                                    className="relative w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 overflow-hidden border-2 border-white/20"
                                    style={{
                                        boxShadow: `0 8px 24px ${getChannelColor(strategy.channelType)}40`
                                    }}
                                >
                                    <Avatar className="w-full h-full rounded-none">
                                        <AvatarImage src={linkedCreator.image_url || ''} className="object-cover" />
                                        <AvatarFallback className={`${channelTypeColors[strategy.channelType]} text-white`}>
                                            {linkedCreator.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Small badge to indicate it's an influencer channel type */}
                                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg ${channelTypeColors[strategy.channelType]} flex items-center justify-center`}>
                                        <span className="text-[10px] text-white">
                                            {channelTypeIcons[strategy.channelType]}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Icon Fallback */
                                <div
                                    className={`w-12 h-12 rounded-xl ${channelTypeColors[strategy.channelType]} flex items-center justify-center text-2xl shadow-lg transition-all duration-300 group-hover:scale-110`}
                                    style={{
                                        boxShadow: `0 8px 24px ${getChannelColor(strategy.channelType)}40`
                                    }}
                                >
                                    {channelTypeIcons[strategy.channelType]}
                                </div>
                            )}

                            <div>
                                <h3 className="font-display font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {strategy.name}
                                </h3>
                                {/* CA-002: Show Creator Name if linked, otherwise Channel Label */}
                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                    {linkedCreator ? (
                                        <span className="text-primary font-semibold flex items-center gap-1">
                                            @{linkedCreator.slug || linkedCreator.name}
                                        </span>
                                    ) : (
                                        channelTypeLabels[strategy.channelType]
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* CLEAN-003: Badge de alerta para estratégias sem data */}
                            {!strategy.startDate && (
                                <Badge
                                    variant="outline"
                                    className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50 animate-pulse"
                                >
                                    ⚠️ Sem data
                                </Badge>
                            )}
                            <Badge
                                variant="outline"
                                className={`${statusColors[strategy.status]} font-medium`}
                            >
                                {statusLabels[strategy.status]}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(strategy)}
                                className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                                aria-label="Editar estratégia"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmOpen(true)}
                                className="h-8 w-8 text-destructive hover:text-destructive opacity-60 group-hover:opacity-100 transition-opacity"
                                aria-label="Excluir estratégia"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                    {/* CARD-004: Budget com destaque 2xl + tabular-nums para financeiro */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <span className="text-sm text-muted-foreground font-medium">Orçamento</span>
                        <span className="font-display font-black text-2xl text-primary tabular-nums">
                            {formatCurrency(strategy.budget)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Responsável</span>
                        <span className="font-medium text-card-foreground">{strategy.responsible}</span>
                    </div>

                    {/* Task Progress Indicator */}
                    {tasks.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <ListTodo className="w-4 h-4" />
                                Tarefas
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${taskProgress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{completedTasks}/{tasks.length}</span>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {strategy.description}
                    </p>

                    <Button
                        variant="ghost"
                        className="w-full justify-between text-muted-foreground hover:text-foreground"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span>Ver detalhes</span>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {expanded && (
                        <div className="space-y-4 pt-2 border-t border-border animate-fade-in">
                            {/* Tasks Section */}
                            <div>
                                <h4 className="font-semibold text-sm text-card-foreground mb-3 flex items-center gap-2">
                                    <ListTodo className="w-4 h-4" />
                                    Sub-tarefas
                                </h4>
                                <TaskList strategyId={strategy.id} strategyName={strategy.name} />
                            </div>

                            <div className="border-t border-border pt-4">
                                <h4 className="font-semibold text-sm text-card-foreground mb-1">Como fazer?</h4>
                                <p className="text-sm text-muted-foreground">{strategy.howToDo}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-card-foreground mb-1">Quando fazer?</h4>
                                <p className="text-sm text-muted-foreground">{strategy.whenToDo}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-card-foreground mb-1">Por que fazer?</h4>
                                <p className="text-sm text-muted-foreground">{strategy.whyToDo}</p>
                            </div>

                            {connectedStrategies.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-card-foreground mb-2 flex items-center gap-2">
                                        <Link2 className="w-4 h-4" />
                                        Conecta com
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {connectedStrategies.map(connected => (
                                            <Badge key={connected.id} variant="secondary" className="text-xs">
                                                {channelTypeIcons[connected.channelType]} {connected.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CRIT-001 fix: AlertDialog de confirmação */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir estratégia?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{strategy.name}"?
                            Esta ação não pode ser desfeita e todas as tarefas associadas serão removidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
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

