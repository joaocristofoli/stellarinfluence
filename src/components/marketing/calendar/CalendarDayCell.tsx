import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MarketingStrategy } from '@/types/marketing';
import { EventPill } from './EventPill';
import { Plus } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarDayCellProps {
    date: Date;
    events: MarketingStrategy[];
    isToday: boolean;
    isOtherMonth: boolean;
    onQuickAdd: (date: Date) => void;
    onEventClick: (event: MarketingStrategy) => void;
}

const MAX_VISIBLE_EVENTS = 3;

export function CalendarDayCell({
    date,
    events,
    isToday,
    isOtherMonth,
    onQuickAdd,
    onEventClick,
}: CalendarDayCellProps) {
    const [showPopover, setShowPopover] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
    const hiddenEvents = events.slice(MAX_VISIBLE_EVENTS);

    return (
        <div
            className={cn(
                "relative min-h-[100px] p-1.5 border-b border-r border-gray-100/80",
                "group transition-colors duration-150",
                isOtherMonth && "bg-gray-50/30",
                isHovered && "bg-purple-50/40"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header: Day number + Quick Add */}
            <div className="flex items-center justify-between mb-1.5">
                {/* Day number */}
                <span
                    className={cn(
                        "text-xs font-medium transition-all",
                        isToday && "bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-semibold",
                        !isToday && isOtherMonth && "text-gray-400",
                        !isToday && !isOtherMonth && "text-gray-600"
                    )}
                >
                    {date.getDate()}
                </span>

                {/* Quick Add Button - appears on hover */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(date);
                    }}
                    className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        "bg-purple-100 text-purple-600",
                        "opacity-0 group-hover:opacity-100",
                        "transition-all duration-150",
                        "hover:bg-purple-200 hover:scale-110",
                        "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    )}
                    title="Adicionar ação"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            {/* Events list */}
            <div className="space-y-1">
                {visibleEvents.map((event) => (
                    <EventPill
                        key={event.id}
                        title={event.name}
                        channelType={event.channelType}
                        status={event.status as 'planned' | 'in_progress' | 'completed'}
                        budget={event.budget}
                        onClick={() => onEventClick(event)}
                    />
                ))}

                {/* More indicator with popover */}
                {hiddenEvents.length > 0 && (
                    <Popover open={showPopover} onOpenChange={setShowPopover}>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "text-xs text-gray-500 font-medium pl-2 py-0.5",
                                    "hover:text-purple-600 transition-colors",
                                    "focus:outline-none focus:text-purple-600"
                                )}
                            >
                                +{hiddenEvents.length} mais
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-72 p-2 shadow-lg border-gray-200"
                            align="start"
                        >
                            <div className="text-xs font-medium text-gray-500 mb-2 px-1">
                                {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </div>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                {hiddenEvents.map((event) => (
                                    <EventPill
                                        key={event.id}
                                        title={event.name}
                                        channelType={event.channelType}
                                        status={event.status as 'planned' | 'in_progress' | 'completed'}
                                        budget={event.budget}
                                        onClick={() => {
                                            setShowPopover(false);
                                            onEventClick(event);
                                        }}
                                    />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
}
