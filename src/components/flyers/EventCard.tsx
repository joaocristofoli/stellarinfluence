import { FlyerEvent } from '@/types/flyer';
import { MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { formatTime, getStatusColor } from '@/utils/calendarHelpers';
import { formatCurrency } from '@/utils/formatters';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EventCardProps {
    event: FlyerEvent;
    campaignColor: string;
    onClick?: () => void;
    isDraggable?: boolean;
}

export function EventCard({ event, campaignColor, onClick, isDraggable = false }: EventCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: event.id,
        disabled: !isDraggable,
    });

    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // formatCurrency importado de @/utils/formatters

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...(isDraggable ? listeners : {})}
            onClick={onClick}
            className={`
        relative overflow-hidden rounded-lg border-2 p-3 cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
            style={{
                ...dragStyle,
                borderColor: campaignColor,
                background: `linear-gradient(135deg, ${campaignColor}15, ${campaignColor}05)`,
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Status Indicator */}
            <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(event.status) }}
            />

            {/* Content */}
            <div className="space-y-2">
                {/* Horário */}
                {(event.startTime || event.endTime) && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4" style={{ color: campaignColor }} />
                        <span>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                    </div>
                )}

                {/* Local */}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" style={{ color: campaignColor }} />
                    <span className="font-medium truncate">{event.location}</span>
                </div>

                {/* Pessoas */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                        {event.numPeople} {event.numPeople === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                </div>

                {/* Custo */}
                <div
                    className="flex items-center gap-2 text-sm font-bold pt-2 border-t"
                    style={{ borderColor: `${campaignColor}30` }}
                >
                    <DollarSign className="w-4 h-4" style={{ color: campaignColor }} />
                    <span style={{ color: campaignColor }}>{formatCurrency(event.dayCost)}</span>
                </div>
            </div>
        </div>
    );
}
