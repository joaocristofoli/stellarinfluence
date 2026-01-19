import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar-premium.css';
import { MarketingStrategy, ChannelType } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';

// Localizer pt-BR
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
    getDay,
    locales,
});

const channelTypeIcons: Record<ChannelType, string> = {
    influencer: '👤',
    paid_traffic: '💰',
    flyers: '📄',
    physical_media: '📺',
    events: '🎉',
    partnerships: '🤝',
    social_media: '📱',
    email_marketing: '📧',
    radio: '📻',
    sound_car: '🔊',
    promoters: '👥',
};

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: MarketingStrategy;
}

interface CalendarReadOnlyProps {
    strategies: MarketingStrategy[];
    showBudget?: boolean;
    initialDate?: Date;
    onEventClick?: (strategy: MarketingStrategy) => void;
}

/**
 * Calendário read-only para visualização pública (Portal do Cliente)
 * Versão simplificada do BigCalendarView sem edição
 * Supports click events for drawer integration
 */
export function CalendarReadOnly({
    strategies,
    showBudget = true,
    initialDate = new Date(),
    onEventClick,
}: CalendarReadOnlyProps) {
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Converter estratégias para eventos
    const events: CalendarEvent[] = useMemo(() => {
        return strategies
            .filter(s => s.startDate)
            .map(strategy => {
                const start = new Date(strategy.startDate!);
                start.setHours(0, 0, 0, 0);

                const end = strategy.endDate
                    ? addDays(new Date(strategy.endDate), 1)
                    : addDays(start, 1);
                end.setHours(0, 0, 0, 0);

                return {
                    id: strategy.id,
                    title: showBudget && strategy.budget > 0
                        ? `${strategy.name} • ${formatCurrency(strategy.budget)}`
                        : strategy.name,
                    start,
                    end,
                    allDay: true,
                    resource: strategy,
                };
            });
    }, [strategies, showBudget]);

    // Classe CSS por canal
    const eventPropGetter = (event: CalendarEvent) => {
        const channelType = event.resource.channelType;
        return {
            className: `event-${channelType}`,
        };
    };

    // Componente de evento customizado (read-only)
    const CustomEvent = ({ event }: { event: CalendarEvent }) => {
        const strategy = event.resource;
        return (
            <div className="flex items-center gap-1.5 h-full px-2 py-1 cursor-default">
                <span className="text-sm">{channelTypeIcons[strategy.channelType]}</span>
                <span className="truncate text-xs font-semibold text-white drop-shadow-sm">
                    {event.title}
                </span>
            </div>
        );
    };

    const messages = {
        today: 'Hoje',
        previous: '←',
        next: '→',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
        agenda: 'Agenda',
        date: 'Data',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'Nenhuma ação neste período.',
        showMore: (total: number) => `+${total} mais`,
    };

    return (
        <div className="premium-calendar-container h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={[Views.MONTH]}
                defaultView={Views.MONTH}
                date={currentDate}
                onNavigate={setCurrentDate}
                selectable={false}
                onSelectEvent={(event) => onEventClick?.(event.resource)}
                eventPropGetter={eventPropGetter}
                components={{
                    event: CustomEvent,
                }}
                messages={messages}
                popup
                culture="pt-BR"
            />
        </div>
    );
}
