import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar-premium.css';
import { MarketingStrategy, ChannelType } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Localizer pt-BR
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
    getDay,
    locales,
});

// Emojis por tipo de canal
const channelTypeIcons: Record<ChannelType, string> = {
    influencer: '✨',
    paid_traffic: '📈',
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

// Sistema de cores semântico premium por tipo de canal
const channelColors: Record<ChannelType, { bg: string; border: string; text: string; dot: string }> = {
    influencer: { bg: 'bg-pink-100', border: 'border-l-pink-500', text: 'text-pink-700', dot: 'bg-pink-500' },
    paid_traffic: { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
    flyers: { bg: 'bg-green-100', border: 'border-l-green-500', text: 'text-green-700', dot: 'bg-green-500' },
    physical_media: { bg: 'bg-orange-100', border: 'border-l-orange-500', text: 'text-orange-700', dot: 'bg-orange-500' },
    events: { bg: 'bg-violet-100', border: 'border-l-violet-500', text: 'text-violet-700', dot: 'bg-violet-500' },
    partnerships: { bg: 'bg-yellow-100', border: 'border-l-yellow-500', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    social_media: { bg: 'bg-cyan-100', border: 'border-l-cyan-500', text: 'text-cyan-700', dot: 'bg-cyan-500' },
    email_marketing: { bg: 'bg-indigo-100', border: 'border-l-indigo-500', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    radio: { bg: 'bg-red-100', border: 'border-l-red-500', text: 'text-red-700', dot: 'bg-red-500' },
    sound_car: { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
    promoters: { bg: 'bg-teal-100', border: 'border-l-teal-500', text: 'text-teal-700', dot: 'bg-teal-500' },
};

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: MarketingStrategy;
}

interface BigCalendarViewProps {
    strategies: MarketingStrategy[];
    onStrategyClick: (strategy: MarketingStrategy) => void;
    onDateClick?: (date: Date) => void;
    showCosts?: boolean;
    currentDate: Date;
    onNavigate: (date: Date) => void;
    onEventDrop: (data: { event: CalendarEvent; start: Date; end: Date; allDay: boolean }) => void;
}

const DnDCalendar = withDragAndDrop(Calendar);

// Componente de evento customizado premium com cores semânticas
const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
    const strategy = event.resource;
    const colors = channelColors[strategy.channelType] || channelColors.events;
    const isCompleted = strategy.status === 'completed';

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 h-full px-2 py-1 rounded-md transition-all",
                "border-l-[3px] cursor-pointer",
                colors.bg,
                colors.border,
                colors.text,
                isCompleted && "opacity-60",
                "hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", colors.dot)} />
            <span className={cn(
                "truncate text-xs font-semibold flex-1",
                isCompleted && "line-through"
            )}>
                {event.title}
            </span>
            {isCompleted && <Check className="w-3 h-3 flex-shrink-0 text-green-600" />}
        </div>
    );
};

export function BigCalendarView({
    strategies,
    onStrategyClick,
    onDateClick,
    showCosts = true,
    currentDate: initialDate,
    onNavigate,
    onEventDrop,
}: BigCalendarViewProps) {
    // Estado local para data atual
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Converter estratégias para eventos do calendário
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
                    title: showCosts && strategy.budget > 0
                        ? `${strategy.name} • ${formatCurrency(strategy.budget)}`
                        : strategy.name,
                    start,
                    end,
                    allDay: true,
                    resource: strategy,
                };
            });
    }, [strategies, showCosts]);

    // Handler de seleção de evento
    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        onStrategyClick(event.resource);
    }, [onStrategyClick]);

    // Handler de seleção de slot (dia)
    const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
        onDateClick?.(start);
    }, [onDateClick]);

    // Handler de navegação
    const handleNavigate = useCallback((date: Date) => {
        setCurrentDate(date);
        onNavigate(date);
    }, [onNavigate]);

    // Classe CSS limpa (cores via Tailwind no componente)
    const eventPropGetter = useCallback(() => {
        return {
            className: 'rbc-event-premium',
            style: {
                background: 'transparent',
                border: 'none',
                padding: '0',
            },
        };
    }, []);

    // Mensagens em português
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
        noEventsInRange: 'Nenhuma estratégia neste período.',
        showMore: (total: number) => `+${total} mais`,
    };

    return (
        <div className="premium-calendar-container h-[700px]">
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
                style={{ height: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.MONTH}
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventPropGetter}
                components={{
                    event: CustomEvent,
                }}
                messages={messages}
                popup
                culture="pt-BR"
                onEventDrop={onEventDrop}
                resizable={false}
            />
        </div>
    );
}



