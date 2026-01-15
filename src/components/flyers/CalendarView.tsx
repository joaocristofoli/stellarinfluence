import { useState, useMemo } from 'react';
import { FlyerEvent, FlyerCampaign, CalendarDay } from '@/types/flyer';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from './EventCard';
import {
    generateCalendarDays,
    groupEventsByDate,
    dateToISOString,
    isToday,
} from '@/utils/calendarHelpers';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

interface CalendarViewProps {
    events: FlyerEvent[];
    campaign: FlyerCampaign;
    onEventClick: (event: FlyerEvent) => void;
    onDateClick: (date: Date) => void;
    onEventDrop: (eventId: string, newDate: string) => void;
}

export function CalendarView({
    events,
    campaign,
    onEventClick,
    onDateClick,
    onEventDrop,
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeEvent, setActiveEvent] = useState<FlyerEvent | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de movimento antes de iniciar drag
            },
        })
    );

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Gerar dias do calendário
    const calendarDays = useMemo(() => {
        const days = generateCalendarDays(year, month);
        const eventsByDate = groupEventsByDate(events);

        return days.map(day => ({
            ...day,
            events: eventsByDate.get(dateToISOString(day.date)) || [],
        }));
    }, [year, month, events]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDragStart = (event: any) => {
        const draggedEvent = events.find(e => e.id === event.active.id);
        setActiveEvent(draggedEvent || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // over.id é a data no formato YYYY-MM-DD
            onEventDrop(active.id as string, over.id as string);
        }

        setActiveEvent(null);
    };

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {monthNames[month]} {year}
                </h2>
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
                                className="p-2 text-center text-sm font-semibold text-muted-foreground"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {calendarDays.map((day, index) => {
                            const dateKey = dateToISOString(day.date);
                            const isTodayDate = isToday(day.date);

                            return (
                                <SortableContext key={index} items={[dateKey]} id={dateKey}>
                                    <div
                                        className={`
                      min-h-[120px] border-r border-b p-2 transition-colors
                      hover:bg-muted/30 cursor-pointer
                      ${!day.isCurrentMonth ? 'bg-muted/10 opacity-50' : ''}
                      ${isTodayDate ? 'bg-primary/5 ring-2 ring-primary/20' : ''}
                    `}
                                        onClick={() => day.isCurrentMonth && onDateClick(day.date)}
                                        data-date={dateKey}
                                    >
                                        {/* Day Number */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span
                                                className={`
                          text-sm font-medium
                          ${isTodayDate ? 'text-primary font-bold' : ''}
                          ${!day.isCurrentMonth ? 'text-muted-foreground' : ''}
                        `}
                                            >
                                                {day.date.getDate()}
                                            </span>
                                            {day.isCurrentMonth && day.events.length === 0 && (
                                                <Plus
                                                    className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDateClick(day.date);
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Events */}
                                        <div className="space-y-1">
                                            {day.events.map(event => (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                >
                                                    <EventCard
                                                        event={event}
                                                        campaignColor={campaign.color}
                                                        isDraggable={true}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </SortableContext>
                            );
                        })}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeEvent && (
                        <div className="opacity-90">
                            <EventCard
                                event={activeEvent}
                                campaignColor={campaign.color}
                            />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
