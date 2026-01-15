import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MarketingStrategy,
    MarketingCampaign,
    ChannelType,
    channelTypeLabels,
    channelTypeIcons,
    channelTypeColors,
} from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CampaignCalendarProps {
    strategies: MarketingStrategy[];
    campaigns: MarketingCampaign[];
    onStrategyClick: (strategy: MarketingStrategy) => void;
    onDateClick: (date: Date) => void;
    onStrategyDrop: (strategyId: string, newStartDate: string) => void;
    creators?: { id: string; name: string; image_url?: string }[];
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    strategies: MarketingStrategy[];
}

export function CampaignCalendar({
    strategies,
    campaigns,
    onStrategyClick,
    onDateClick,
    onStrategyDrop,
    creators = [],
}: CampaignCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeStrategy, setActiveStrategy] = useState<MarketingStrategy | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: CalendarDay[] = [];

        // Previous month's days
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false, strategies: [] });
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({ date, isCurrentMonth: true, strategies: [] });
        }

        // Next month's days to complete the grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, strategies: [] });
        }

        // Assign strategies to days based on startDate
        strategies.forEach(strategy => {
            if (strategy.startDate) {
                const strategyDate = new Date(strategy.startDate);
                days.forEach(day => {
                    if (
                        day.date.getFullYear() === strategyDate.getFullYear() &&
                        day.date.getMonth() === strategyDate.getMonth() &&
                        day.date.getDate() === strategyDate.getDate()
                    ) {
                        day.strategies.push(strategy);
                    }
                });
            }
        });

        return days;
    }, [year, month, strategies]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDragStart = (event: any) => {
        const draggedStrategy = strategies.find(s => s.id === event.active.id);
        setActiveStrategy(draggedStrategy || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            onStrategyDrop(active.id as string, over.id as string);
        }

        setActiveStrategy(null);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const dateToISOString = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Get creators for a strategy
    const getStrategyCreators = (strategy: MarketingStrategy) => {
        if (!strategy.linkedCreatorIds || strategy.linkedCreatorIds.length === 0) return [];
        return creators.filter(c => strategy.linkedCreatorIds?.includes(c.id));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6" style={{ color: 'var(--company-primary)' }} />
                        {monthNames[month]} {year}
                    </h2>
                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <Button
                            variant={viewMode === 'month' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('month')}
                            className="gap-1"
                        >
                            <Calendar className="w-4 h-4" />
                            Mês
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('week')}
                            className="gap-1"
                        >
                            <List className="w-4 h-4" />
                            Semana
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(channelTypeLabels).slice(0, 6).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1 text-xs">
                        <span className={cn('w-3 h-3 rounded-full', channelTypeColors[key as ChannelType])} />
                        <span className="text-muted-foreground">{channelTypeIcons[key as ChannelType]} {label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="border rounded-lg overflow-hidden bg-card">
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 border-b bg-muted/50">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="p-3 text-center text-sm font-semibold text-muted-foreground"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const dateKey = dateToISOString(day.date);
                            const isTodayDate = isToday(day.date);

                            return (
                                <div
                                    key={index}
                                    data-date={dateKey}
                                    className={cn(
                                        "min-h-[120px] border-r border-b p-2 transition-colors cursor-pointer group",
                                        "hover:bg-muted/30",
                                        !day.isCurrentMonth && "bg-muted/10 opacity-50",
                                        isTodayDate && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
                                    )}
                                    onClick={() => day.isCurrentMonth && onDateClick(day.date)}
                                >
                                    {/* Day Number */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={cn(
                                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                isTodayDate && "bg-primary text-primary-foreground font-bold",
                                                !day.isCurrentMonth && "text-muted-foreground"
                                            )}
                                        >
                                            {day.date.getDate()}
                                        </span>
                                        {day.isCurrentMonth && day.strategies.length === 0 && (
                                            <Plus
                                                className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDateClick(day.date);
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Strategies */}
                                    <div className="space-y-1">
                                        {day.strategies.slice(0, 3).map(strategy => {
                                            const linkedCreators = getStrategyCreators(strategy);

                                            return (
                                                <motion.div
                                                    key={strategy.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={cn(
                                                        "p-1.5 rounded text-xs cursor-grab active:cursor-grabbing",
                                                        "hover:ring-2 ring-offset-1 transition-all",
                                                        channelTypeColors[strategy.channelType],
                                                        "text-white"
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStrategyClick(strategy);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1 truncate">
                                                        <span>{channelTypeIcons[strategy.channelType]}</span>
                                                        <span className="truncate font-medium">{strategy.name}</span>
                                                    </div>
                                                    {linkedCreators.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-1 opacity-90">
                                                            <Users className="w-3 h-3" />
                                                            <span className="truncate text-[10px]">
                                                                {linkedCreators.map(c => c.name).join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                        {day.strategies.length > 3 && (
                                            <div className="text-xs text-muted-foreground text-center">
                                                +{day.strategies.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeStrategy && (
                        <div
                            className={cn(
                                "p-2 rounded shadow-lg text-xs text-white",
                                channelTypeColors[activeStrategy.channelType]
                            )}
                        >
                            <div className="flex items-center gap-1">
                                <span>{channelTypeIcons[activeStrategy.channelType]}</span>
                                <span className="font-medium">{activeStrategy.name}</span>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Unscheduled Strategies */}
            {strategies.filter(s => !s.startDate).length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Estratégias sem data ({strategies.filter(s => !s.startDate).length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {strategies.filter(s => !s.startDate).map(strategy => (
                            <Badge
                                key={strategy.id}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer hover:opacity-80 transition-opacity",
                                    channelTypeColors[strategy.channelType],
                                    "text-white border-0"
                                )}
                                onClick={() => onStrategyClick(strategy)}
                            >
                                {channelTypeIcons[strategy.channelType]} {strategy.name}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Clique em uma estratégia para definir a data, ou arraste para o calendário.
                    </p>
                </div>
            )}
        </div>
    );
}
