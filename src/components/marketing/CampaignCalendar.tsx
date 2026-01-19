import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, List, Users, DollarSign, Filter, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    MarketingStrategy,
    MarketingCampaign,
    ChannelType,
    channelTypeLabels,
    channelTypeIcons,
    channelTypeColors,
} from '@/types/marketing';
import { FlyerEvent } from '@/types/flyer';
import { formatCurrency } from '@/utils/formatters';
import { DndContext, DragEndEvent, DragOverlay, DragOverEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuickAddStrategy } from './QuickAddStrategy';

// UX-009: Gradientes premium por canal
const channelGradients: Record<ChannelType, string> = {
    influencer: 'bg-gradient-to-r from-pink-500 to-rose-600',
    paid_traffic: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    social_media: 'bg-gradient-to-r from-purple-500 to-violet-600',
    flyers: 'bg-gradient-to-r from-green-500 to-emerald-600',
    events: 'bg-gradient-to-r from-orange-500 to-amber-600',
    radio: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    email_marketing: 'bg-gradient-to-r from-cyan-500 to-teal-600',
    partnerships: 'bg-gradient-to-r from-emerald-600 to-green-700',
    sound_car: 'bg-gradient-to-r from-red-500 to-rose-600',
    promoters: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    physical_media: 'bg-gradient-to-r from-amber-700 to-orange-800',
};

interface CampaignCalendarProps {
    strategies: MarketingStrategy[];
    campaigns: MarketingCampaign[];
    flyerEvents?: FlyerEvent[];
    onStrategyClick: (strategy: MarketingStrategy) => void;
    onDateClick: (date: Date) => void;
    onStrategyDrop: (strategyId: string, newStartDate: string) => void;
    onFlyerEventClick?: (event: FlyerEvent) => void;
    onQuickAdd?: (data: {
        name: string;
        channelType: ChannelType;
        budget: number;
        startDate: Date;
        companyId: string;
    }) => void;
    companyId?: string;
    creators?: { id: string; name: string; image_url?: string }[];
    showCosts?: boolean;
    isQuickAddLoading?: boolean;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    strategies: MarketingStrategy[];
}

export function CampaignCalendar({
    strategies,
    campaigns,
    flyerEvents = [],
    onStrategyClick,
    onDateClick,
    onStrategyDrop,
    onFlyerEventClick,
    onQuickAdd,
    companyId,
    creators = [],
    showCosts = true,
    isQuickAddLoading = false,
}: CampaignCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeStrategy, setActiveStrategy] = useState<MarketingStrategy | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [activeFilters, setActiveFilters] = useState<(ChannelType | 'flyers')[]>([]); // Empty = show all

    // IMP-002: Persistir showFlyers em localStorage
    const [showFlyers, setShowFlyers] = useState(() => {
        try {
            const stored = localStorage.getItem('campaign-calendar-show-flyers');
            return stored !== null ? JSON.parse(stored) : true;
        } catch {
            return true;
        }
    });
    const [quickAddDate, setQuickAddDate] = useState<Date | null>(null); // Data para Quick-Add

    // UX-001: Estado para highlight de drop zone
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);

    // UX-003: Animação de sucesso após soltar
    const [recentlyDropped, setRecentlyDropped] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // IMP-002: Persistir showFlyers quando mudar
    useEffect(() => {
        localStorage.setItem('campaign-calendar-show-flyers', JSON.stringify(showFlyers));
    }, [showFlyers]);

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

        // Assign strategies to days based on date RANGE (startDate to endDate)
        strategies.forEach(strategy => {
            if (strategy.startDate) {
                const strategyStart = new Date(strategy.startDate);
                strategyStart.setHours(0, 0, 0, 0);

                // Se tem endDate, usar; senão, usar startDate como único dia
                const strategyEnd = strategy.endDate
                    ? new Date(strategy.endDate)
                    : new Date(strategy.startDate);
                strategyEnd.setHours(23, 59, 59, 999);

                days.forEach(day => {
                    const dayDate = new Date(day.date);
                    dayDate.setHours(12, 0, 0, 0); // Meio do dia para comparação segura

                    // Verificar se o dia está DENTRO do intervalo
                    if (dayDate >= strategyStart && dayDate <= strategyEnd) {
                        day.strategies.push(strategy);
                    }
                });
            }
        });

        return days;
    }, [year, month, strategies]);

    // Filter strategies by active filters
    const filteredStrategies = useMemo(() => {
        if (activeFilters.length === 0) return strategies;
        return strategies.filter(s => activeFilters.includes(s.channelType));
    }, [strategies, activeFilters]);

    // Calculate total costs for visible strategies + flyers
    const totalCosts = useMemo(() => {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        // Custo das estratégias
        const strategyCosts = filteredStrategies
            .filter(s => {
                if (!s.startDate) return false;
                const startDate = new Date(s.startDate);
                return startDate >= monthStart && startDate <= monthEnd;
            })
            .reduce((sum, s) => sum + s.budget, 0);

        // Custo dos flyers (se visíveis)
        const flyerCosts = showFlyers
            ? flyerEvents
                .filter(e => {
                    const eventDate = new Date(e.eventDate);
                    return eventDate >= monthStart && eventDate <= monthEnd;
                })
                .reduce((sum, e) => sum + e.dayCost, 0)
            : 0;

        return strategyCosts + flyerCosts;
    }, [filteredStrategies, flyerEvents, showFlyers, year, month]);

    // UX-004: Calcular total por canal para sumário visual
    const totalByChannel = useMemo(() => {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const channelTotals: Partial<Record<ChannelType, number>> = {};

        filteredStrategies
            .filter(s => {
                if (!s.startDate) return false;
                const startDate = new Date(s.startDate);
                return startDate >= monthStart && startDate <= monthEnd;
            })
            .forEach(s => {
                channelTotals[s.channelType] = (channelTotals[s.channelType] || 0) + s.budget;
            });

        return channelTotals;
    }, [filteredStrategies, year, month]);

    // Toggle channel filter
    const toggleFilter = (channel: ChannelType) => {
        setActiveFilters(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    // Get flyer events for a specific date (respeitando filtro)
    const getFlyerEventsForDate = (date: Date) => {
        if (!showFlyers) return []; // Ocultar se filtro desativado
        const dateStr = date.toISOString().split('T')[0];
        return flyerEvents.filter(e => e.eventDate === dateStr);
    };

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

    // UX-001: Handler para highlight de drop zone
    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        if (over) {
            setDragOverDate(over.id as string);
        } else {
            setDragOverDate(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            onStrategyDrop(active.id as string, over.id as string);

            // UX-003: Animação de sucesso - pulse verde
            setRecentlyDropped(active.id as string);
            setTimeout(() => setRecentlyDropped(null), 1500);
        }

        setActiveStrategy(null);
        setDragOverDate(null);
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

    // Detectar posição do dia no intervalo da estratégia (para barras contínuas)
    const getStrategyDayPosition = (strategy: MarketingStrategy, dayDate: Date): 'first' | 'middle' | 'last' | 'single' => {
        if (!strategy.startDate) return 'single';

        const start = new Date(strategy.startDate);
        start.setHours(0, 0, 0, 0);

        const end = strategy.endDate ? new Date(strategy.endDate) : new Date(strategy.startDate);
        end.setHours(0, 0, 0, 0);

        const current = new Date(dayDate);
        current.setHours(0, 0, 0, 0);

        const isFirstDay = current.getTime() === start.getTime();
        const isLastDay = current.getTime() === end.getTime();

        if (isFirstDay && isLastDay) return 'single';
        if (isFirstDay) return 'first';
        if (isLastDay) return 'last';
        return 'middle';
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
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Mês anterior">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentDate(new Date())}
                        aria-label="Ir para hoje"
                    >
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Próximo mês">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Legend & Filters */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(channelTypeLabels).map(([key, label]) => {
                        const channel = key as ChannelType;
                        const isActive = activeFilters.length === 0 || activeFilters.includes(channel);

                        return (
                            <button
                                key={key}
                                onClick={() => toggleFilter(channel)}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all cursor-pointer border",
                                    isActive
                                        ? cn(channelTypeColors[channel], "text-white border-transparent")
                                        : "bg-muted/50 text-muted-foreground border-border opacity-50"
                                )}
                            >
                                <span>{channelTypeIcons[channel]}</span>
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        );
                    })}

                    {/* Flyers Toggle - Separado mas integrado */}
                    <button
                        onClick={() => setShowFlyers(!showFlyers)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all cursor-pointer border",
                            showFlyers
                                ? "bg-green-500 text-white border-transparent"
                                : "bg-muted/50 text-muted-foreground border-border opacity-50"
                        )}
                    >
                        <span>📄</span>
                        <span className="hidden sm:inline">Panfletagem</span>
                        {showFlyers && flyerEvents.length > 0 && (
                            <span className="bg-white/20 px-1.5 rounded-full text-[10px]">
                                {flyerEvents.length}
                            </span>
                        )}
                    </button>

                    {(activeFilters.length > 0 || !showFlyers) && (
                        <button
                            onClick={() => {
                                setActiveFilters([]);
                                setShowFlyers(true);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* Total Costs */}
                {showCosts && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Total do mês: <span className="text-primary font-bold">{formatCurrency(totalCosts)}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* UX-004: Sumário Visual por Canal */}
            {showCosts && Object.keys(totalByChannel).length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-xs text-muted-foreground self-center mr-2">Por canal:</span>
                    {(Object.entries(totalByChannel) as [ChannelType, number][]).map(([channel, total]) => (
                        <div
                            key={channel}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white shadow-sm",
                                channelGradients[channel]
                            )}
                        >
                            <span>{channelTypeIcons[channel]}</span>
                            <span className="font-medium">{formatCurrency(total)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* CLEAN-002: Estratégias sem data - DESTAQUE NO TOPO */}
            {strategies.filter(s => !s.startDate).length > 0 && (
                <div className="border-2 border-yellow-500/50 rounded-lg p-4 bg-yellow-500/10">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        ⚠️ Atenção: {strategies.filter(s => !s.startDate).length} estratégia(s) sem data
                    </h3>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400/80 mb-3">
                        Estas estratégias não aparecem no calendário. Clique para definir uma data ou arraste para um dia.
                    </p>
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
                </div>
            )}

            {/* Calendar Grid */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
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
                            // UX-011: Weekend styling
                            const dayOfWeek = day.date.getDay();
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            // UX-001: Drop zone visual
                            const isDropZone = dragOverDate === dateKey && activeStrategy !== null;

                            return (
                                <div
                                    key={index}
                                    data-date={dateKey}
                                    className={cn(
                                        "min-h-[120px] border-r border-b p-2 transition-all duration-200 cursor-pointer group",
                                        "hover:bg-muted/30",
                                        !day.isCurrentMonth && "bg-muted/10 opacity-50",
                                        isTodayDate && "bg-primary/5 ring-2 ring-primary/20 ring-inset",
                                        // UX-011: Weekend com fundo mais escuro
                                        isWeekend && day.isCurrentMonth && "bg-muted/20",
                                        // UX-001: Drop zone visual - borda azul pontilhada
                                        isDropZone && "bg-primary/15 border-primary border-dashed border-2 scale-[1.02] ring-4 ring-primary/30"
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
                                        {day.isCurrentMonth && (
                                            <button
                                                className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onQuickAdd && companyId) {
                                                        setQuickAddDate(day.date);
                                                    } else {
                                                        onDateClick(day.date);
                                                    }
                                                }}
                                                title="Adicionar ação rápida"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Quick Add Form */}
                                    <AnimatePresence>
                                        {quickAddDate && dateToISOString(quickAddDate) === dateKey && onQuickAdd && companyId && (
                                            <QuickAddStrategy
                                                date={quickAddDate}
                                                companyId={companyId}
                                                onSave={(data) => {
                                                    onQuickAdd(data);
                                                    setQuickAddDate(null);
                                                }}
                                                onCancel={() => setQuickAddDate(null)}
                                                isLoading={isQuickAddLoading}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Strategies */}
                                    <div className="space-y-1">
                                        {day.strategies
                                            .filter(s => activeFilters.length === 0 || activeFilters.includes(s.channelType))
                                            .slice(0, 3)
                                            .map(strategy => {
                                                const linkedCreators = getStrategyCreators(strategy);
                                                // UX-003: Detectar se acabou de ser dropado
                                                const justDropped = recentlyDropped === strategy.id;
                                                // Detectar posição para barra contínua
                                                const dayPosition = getStrategyDayPosition(strategy, day.date);
                                                const isFirst = dayPosition === 'first' || dayPosition === 'single';
                                                const isLast = dayPosition === 'last' || dayPosition === 'single';
                                                const isMiddle = dayPosition === 'middle';

                                                return (
                                                    <motion.div
                                                        key={strategy.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: justDropped ? [1, 1.05, 1] : 1,
                                                            boxShadow: justDropped ? ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 8px rgba(34,197,94,0.3)', '0 0 0 0 rgba(34,197,94,0)'] : undefined
                                                        }}
                                                        transition={{ duration: justDropped ? 0.5 : 0.2 }}
                                                        className={cn(
                                                            "p-1.5 text-xs cursor-grab active:cursor-grabbing shadow-sm",
                                                            "hover:ring-2 ring-offset-1 transition-all hover:shadow-md",
                                                            // UX-009: Gradientes premium em vez de cores sólidas
                                                            channelGradients[strategy.channelType],
                                                            "text-white",
                                                            // BARRA CONTÍNUA: estilos de rounded baseados na posição
                                                            isFirst && !isLast && "rounded-l",
                                                            isLast && !isFirst && "rounded-r",
                                                            isMiddle && "rounded-none -mx-0.5",
                                                            dayPosition === 'single' && "rounded",
                                                            // UX-003: Highlight verde quando acabou de dropar
                                                            justDropped && "ring-2 ring-green-400 ring-offset-2"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStrategyClick(strategy);
                                                        }}
                                                        title={[
                                                            strategy.name,
                                                            strategy.responsible ? `Responsável: ${strategy.responsible}` : null,
                                                            strategy.description ? `${strategy.description.slice(0, 80)}...` : null,
                                                            showCosts ? `Orçamento: ${formatCurrency(strategy.budget)}` : null
                                                        ].filter(Boolean).join('\n')}
                                                    >
                                                        <div className="flex items-center gap-1 truncate">
                                                            <span>{channelTypeIcons[strategy.channelType]}</span>
                                                            <span className="truncate font-medium">{strategy.name}</span>
                                                            {showCosts && strategy.budget > 0 && (
                                                                <span className="text-[10px] opacity-75 ml-auto">
                                                                    {formatCurrency(strategy.budget)}
                                                                </span>
                                                            )}
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

                                        {/* Flyer Events - Sem limite */}
                                        {getFlyerEventsForDate(day.date).map(flyerEvent => (
                                            <motion.div
                                                key={flyerEvent.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={cn(
                                                    "p-1.5 rounded text-xs cursor-pointer",
                                                    "hover:ring-2 ring-offset-1 transition-all",
                                                    "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onFlyerEventClick?.(flyerEvent);
                                                }}
                                                title={`Panfletagem: ${flyerEvent.location} - ${flyerEvent.numPeople} pessoas - ${formatCurrency(flyerEvent.dayCost)}`}
                                            >
                                                <div className="flex items-center gap-1 truncate">
                                                    <span>📄</span>
                                                    <span className="truncate font-medium">{flyerEvent.location}</span>
                                                    <span className="text-[10px] opacity-80 ml-auto flex items-center gap-0.5">
                                                        <span className="font-bold">{flyerEvent.numPeople}</span>👥
                                                    </span>
                                                </div>
                                                {showCosts && (
                                                    <div className="text-[10px] opacity-90 mt-0.5">
                                                        {formatCurrency(flyerEvent.dayCost)}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* More indicator */}
                                        {(day.strategies.filter(s => activeFilters.length === 0 || activeFilters.includes(s.channelType)).length + getFlyerEventsForDate(day.date).length) > 3 && (
                                            <div className="text-xs text-muted-foreground text-center">
                                                +{(day.strategies.filter(s => activeFilters.length === 0 || activeFilters.includes(s.channelType)).length + getFlyerEventsForDate(day.date).length) - 3} mais
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
            </DndContext >
        </div >
    );
}
