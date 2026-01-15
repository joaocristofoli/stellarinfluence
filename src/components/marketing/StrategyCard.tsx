import { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp, Link2, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export function StrategyCard({ strategy, allStrategies, onEdit, onDelete }: StrategyCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { data: tasks = [] } = useStrategyTasks(strategy.id);

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
        <Card className="card-hover overflow-hidden animate-fade-in">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${channelTypeColors[strategy.channelType]} flex items-center justify-center text-xl`}>
                            {channelTypeIcons[strategy.channelType]}
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-lg text-card-foreground">
                                {strategy.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {channelTypeLabels[strategy.channelType]}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColors[strategy.status]}>
                            {statusLabels[strategy.status]}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(strategy)}
                            className="h-8 w-8"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(strategy.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orçamento</span>
                    <span className="font-display font-bold text-xl text-primary">
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
    );
}

