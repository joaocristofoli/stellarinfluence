import { FlyerEvent, CalendarDay, CampaignStats } from '@/types/flyer';

/**
 * Gera array de dias para visualização em calendário mensal
 * Inclui dias do mês anterior e próximo para preencher grid 7x6
 */
export function generateCalendarDays(year: number, month: number): CalendarDay[] {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia (0 = domingo)
    const startDayOfWeek = firstDay.getDay();

    // Adicionar dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
            date,
            isCurrentMonth: false,
            events: [],
        });
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        days.push({
            date,
            isCurrentMonth: true,
            events: [],
        });
    }

    // Adicionar dias do próximo mês para completar 42 células (6 semanas)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
            date,
            isCurrentMonth: false,
            events: [],
        });
    }

    return days;
}

/**
 * Agrupa eventos por data (YYYY-MM-DD)
 */
export function groupEventsByDate(events: FlyerEvent[]): Map<string, FlyerEvent[]> {
    const grouped = new Map<string, FlyerEvent[]>();

    events.forEach(event => {
        const dateKey = event.eventDate; // Já está em formato ISO
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(event);
    });

    return grouped;
}

/**
 * Calcula estatísticas de uma campanha
 */
export function calculateCampaignStats(events: FlyerEvent[]): CampaignStats {
    const totalCost = events.reduce((sum, e) => sum + e.dayCost, 0);
    const totalDays = new Set(events.map(e => e.eventDate)).size;
    const totalPeople = events.reduce((sum, e) => sum + e.numPeople, 0);
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const plannedEvents = events.filter(e => e.status === 'planned').length;

    return {
        totalCost,
        totalDays,
        totalPeople,
        avgCostPerDay: totalDays > 0 ? totalCost / totalDays : 0,
        completedEvents,
        plannedEvents,
    };
}

/**
 * Formata data para string legível (ex: "16 de Janeiro")
 */
export function formatDateBr(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return `${date.getDate()} de ${months[date.getMonth()]}`;
}

/**
 * Formata horário (HH:mm)
 */
export function formatTime(time?: string): string {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:mm
}

/**
 * Retorna cor de status
 */
export function getStatusColor(status: FlyerEvent['status']): string {
    switch (status) {
        case 'completed':
            return '#10b981'; // green
        case 'in_progress':
            return '#f59e0b'; // orange
        case 'cancelled':
            return '#ef4444'; // red
        case 'planned':
        default:
            return '#6b7280'; // gray
    }
}

/**
 * Retorna label de status em português
 */
export function getStatusLabel(status: FlyerEvent['status']): string {
    switch (status) {
        case 'completed':
            return 'Concluído';
        case 'in_progress':
            return 'Em Andamento';
        case 'cancelled':
            return 'Cancelado';
        case 'planned':
        default:
            return 'Planejado';
    }
}

/**
 * Converte Date para string ISO date (YYYY-MM-DD)
 */
export function dateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Verifica se duas datas são do mesmo dia
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}
