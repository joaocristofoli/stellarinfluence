import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListTodo, Link2, Calendar, Target, User, Users, Pencil, Clock, MapPin } from "lucide-react";
import { MarketingStrategy, channelTypeIcons, channelTypeLabels, channelTypeColors } from "@/types/marketing";
import { TaskList } from "./TaskList";
import { useStrategyTasks } from "@/hooks/useStrategyTasks";
import { useCreators } from "@/hooks/useCreators"; // Added
import { formatCurrency } from "@/utils/formatters";
import { parseFollowerCount } from '@/utils/numberParsers';

interface StrategyDetailsModalProps {
    strategy: MarketingStrategy | null;
    open: boolean;
    onClose: () => void;
    allStrategies: MarketingStrategy[];
    onEdit?: (strategy: MarketingStrategy) => void; // NEW: Edit Handler
}

export function StrategyDetailsModal({ strategy, open, onClose, allStrategies, onEdit }: StrategyDetailsModalProps) {
    if (!strategy) return null;

    const handleEdit = () => {
        onClose(); // Close the modal first
        if (onEdit) onEdit(strategy);
    };

    // Only fetch tasks when modal is open for this specific strategy
    const { data: tasks = [] } = useStrategyTasks(strategy.id);
    const { data: creators = [] } = useCreators();

    const connectedStrategies = allStrategies.filter(s =>
        strategy.connections.includes(s.id)
    );

    // Resolve linked creators (Multiple) & Sort by Followers Descending
    const linkedCreators = strategy.channelType === 'influencer' && strategy.linkedCreatorIds && strategy.linkedCreatorIds.length > 0
        ? creators
            .filter(c => strategy.linkedCreatorIds!.includes(c.id))
            .sort((a, b) => parseFollowerCount(b.total_followers) - parseFollowerCount(a.total_followers))
        : [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${channelTypeColors[strategy.channelType]} bg-opacity-10 text-2xl shadow-sm`}>
                                {channelTypeIcons[strategy.channelType]}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-display font-bold">{strategy.name}</DialogTitle>
                                <DialogDescription className="flex items-center gap-3 mt-1.5">
                                    <Badge variant="outline" className="text-muted-foreground bg-secondary/50">
                                        {channelTypeLabels[strategy.channelType]}
                                    </Badge>
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {formatCurrency(strategy.budget)}
                                    </span>
                                    {strategy.startDate && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(strategy.startDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                        {/* EDIT BUTTON */}
                        {onEdit && (
                            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1.5 shrink-0">
                                <Pencil className="w-4 h-4" />
                                Editar
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                    {/* Left Column: Context & Influencers (7 cols) */}
                    <div className="md:col-span-7 space-y-6">

                        {/* INFLUENCERS SQUAD SECTION (NEW) */}
                        {linkedCreators.length > 0 && (
                            <div className="bg-secondary/20 border border-border/50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <Users className="w-4 h-4" />
                                    Squad de Influenciadores ({linkedCreators.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {linkedCreators.map(creator => {
                                        // Find deliverables for this creator
                                        const deliverables = strategy.deliverables?.filter(d => d.creatorId === creator.id) || [];

                                        return (
                                            <div key={creator.id} className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                                                <Avatar className="w-10 h-10 border border-border">
                                                    <AvatarImage src={creator.image_url || ''} className="object-cover" />
                                                    <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold truncate text-foreground">{creator.name}</p>
                                                    <p className="text-xs text-muted-foreground mb-1">{creator.total_followers} followers</p>

                                                    {/* Deliverables Mini-Badges */}
                                                    {deliverables.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {deliverables.map((d, i) => (
                                                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                                    {d.format}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-secondary/30 p-5 rounded-xl space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
                                <Target className="w-4 h-4" />
                                Planejamento Estratégico
                            </h4>
                            <div className="space-y-4 text-sm text-foreground/80">
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-xs text-muted-foreground uppercase font-bold pt-0.5">Como:</span>
                                    <p className="leading-relaxed">{strategy.howToDo || 'Definir estratégia...'}</p>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-xs text-muted-foreground uppercase font-bold pt-0.5">Quando:</span>
                                    <p className="leading-relaxed">{strategy.whenToDo || 'Definir cronograma...'}</p>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-xs text-muted-foreground uppercase font-bold pt-0.5">Por que:</span>
                                    <p className="leading-relaxed">{strategy.whyToDo || 'Definir objetivo...'}</p>
                                </div>
                            </div>
                        </div>

                        {/* PANFLETAGEM SCHEDULE SECTION */}
                        {strategy.channelType === 'flyers' && strategy.flyerSchedule && strategy.flyerSchedule.length > 0 && (
                            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl">
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-green-700">
                                    <MapPin className="w-4 h-4" />
                                    Escala de Panfletagem ({strategy.flyerSchedule.length} {strategy.flyerSchedule.length === 1 ? 'turno' : 'turnos'})
                                </h4>
                                <div className="space-y-2">
                                    {strategy.flyerSchedule.map((slot, index) => (
                                        <div key={slot.id || index} className="flex items-center gap-3 bg-background/60 p-3 rounded-lg border border-border/30">
                                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Clock className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">
                                                    {slot.startTime} - {slot.endTime}
                                                    {slot.date && strategy.startDate !== strategy.endDate && (
                                                        <span className="text-muted-foreground ml-2 text-xs">
                                                            ({new Date(slot.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {slot.location && <span>{slot.location} • </span>}
                                                    {Array.isArray(slot.assignees) && slot.assignees.length > 0
                                                        ? slot.assignees.join(', ')
                                                        : 'Sem equipe definida'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {connectedStrategies.length > 0 && (
                            <div className="bg-secondary/30 p-4 rounded-xl">
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <Link2 className="w-4 h-4" />
                                    Conexões
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {connectedStrategies.map(connected => (
                                        <Badge key={connected.id} variant="secondary" className="gap-1 pl-1 py-1">
                                            <span className="text-xs">{channelTypeIcons[connected.channelType]}</span>
                                            {connected.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Tasks (5 cols) */}
                    <div className="md:col-span-5 bg-background border border-border/50 rounded-xl p-0 overflow-hidden flex flex-col h-full min-h-[400px]">
                        <div className="p-4 bg-secondary/20 border-b border-border/50">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                <ListTodo className="w-4 h-4" />
                                Checklist de Execução
                            </h4>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <TaskList strategyId={strategy.id} strategyName={strategy.name} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
