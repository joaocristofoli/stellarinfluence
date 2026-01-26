
import { useMemo, useState } from 'react';
import { MarketingStrategy, ChannelType } from '@/types/marketing';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StrategyCard } from './StrategyCard';
import { useUpdateStrategy } from '@/hooks/useStrategies';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface KanbanBoardProps {
    strategies: MarketingStrategy[];
    companyId: string;
    onEdit: (strategy: MarketingStrategy) => void;
    onDelete: (id: string) => void;
    allStrategies: MarketingStrategy[];
    onStrategyClick?: (strategy: MarketingStrategy) => void;
}

const columns = [
    { id: 'planned', title: '📋 Planejado', color: 'bg-muted/30 border-muted' },
    { id: 'in_progress', title: '🚀 Em Andamento', color: 'bg-blue-500/5 border-blue-500/20' },
    { id: 'completed', title: '✅ Concluído', color: 'bg-emerald-500/5 border-emerald-500/20' },
];

export function KanbanBoard({ strategies, companyId, onEdit, onDelete, allStrategies, onStrategyClick }: KanbanBoardProps) {
    const updateStrategy = useUpdateStrategy();
    const [activeId, setActiveId] = useState<string | null>(null);

    // Group strategies by status
    const items = useMemo(() => {
        const groups: Record<string, MarketingStrategy[]> = {
            planned: [],
            in_progress: [],
            completed: [],
        };
        strategies.forEach((s) => {
            if (groups[s.status]) {
                groups[s.status].push(s);
            }
        });
        return groups;
    }, [strategies]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeStrategy = strategies.find(s => s.id === active.id);
        const overId = over.id as string;

        if (activeStrategy) {
            let newStatus = overId;

            // If dropped on a container (column) or an item in that column
            if (!columns.find(c => c.id === overId)) {
                // Determine new status from the item we dropped ON
                const overStrategy = strategies.find(s => s.id === overId);
                if (overStrategy) {
                    newStatus = overStrategy.status;
                }
            }

            if (newStatus !== activeStrategy.status && ['planned', 'in_progress', 'completed'].includes(newStatus)) {
                updateStrategy.mutate({
                    id: activeStrategy.id,
                    status: newStatus as any,
                    companyId
                }, {
                    onSuccess: () => {
                        toast({ title: "Status Atualizado", description: `Movido para ${newStatus === 'in_progress' ? 'Em Andamento' : newStatus === 'completed' ? 'Concluído' : 'Planejado'}` });
                    },
                    onError: () => {
                        toast({ title: "Erro ao mover", variant: "destructive" });
                    }
                });
            }
        }

        setActiveId(null);
    };

    const activeStrategy = useMemo(() =>
        strategies.find((s) => s.id === activeId),
        [activeId, strategies]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px] pb-20">
                {columns.map((col) => (
                    <div key={col.id} className={cn("flex flex-col h-full rounded-xl border p-4 transition-colors", col.color)}>
                        <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
                            {col.title}
                            <span className="text-xs font-mono py-1 px-2 rounded-full bg-background/50 border border-border/50">
                                {items[col.id]?.length || 0}
                            </span>
                        </h3>

                        <div className="flex-1">
                            <SortableContext
                                items={items[col.id]?.map(s => s.id) || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4 min-h-[100px]" id={col.id} data-droppable-id={col.id}>
                                    {items[col.id]?.map((strategy) => (
                                        <SortableItem
                                            key={strategy.id}
                                            strategy={strategy}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            allStrategies={allStrategies}
                                            onStrategyClick={onStrategyClick}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeStrategy ? (
                    <div className="opacity-90 rotate-2 scale-105">
                        <StrategyCard
                            strategy={activeStrategy}
                            allStrategies={allStrategies}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            onViewDetails={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function SortableItem({ strategy, onEdit, onDelete, allStrategies, onStrategyClick }: { strategy: MarketingStrategy; onEdit: any; onDelete: any; allStrategies: any[]; onStrategyClick?: ((s: MarketingStrategy) => void) }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: strategy.id, data: { status: strategy.status } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <StrategyCard
                strategy={strategy}
                allStrategies={allStrategies}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={() => onStrategyClick && onStrategyClick(strategy)}
            />
        </div>
    );
}
