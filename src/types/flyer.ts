export interface FlyerCampaign {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    color: string; // Hex color (ex: #8b5cf6 para Aiqfome)
    startDate: string; // ISO date
    endDate: string;
    totalBudget: number;
    createdAt: string;
    updatedAt: string;
}

export interface FlyerEvent {
    id: string;
    campaignId: string;
    eventDate: string; // ISO date
    startTime?: string; // HH:mm
    endTime?: string;
    location: string;
    numPeople: number;
    hourlyRate: number;
    shiftDuration: number; // horas
    dayCost: number; // Calculado automaticamente
    notes?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface FlyerAssignment {
    id: string;
    eventId: string;
    personName: string;
    role: 'distributor' | 'supervisor';
    contact?: string;
    createdAt: string;
}

export interface FlyerManager {
    id: string;
    campaignId?: string; // Null = gestor geral do projeto
    name: string;
    role: 'coordinator' | 'director';
    email?: string;
    phone?: string;
    createdAt: string;
}

// Helper types
export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    events: FlyerEvent[];
}

export interface CampaignStats {
    totalCost: number;
    totalDays: number;
    totalPeople: number;
    avgCostPerDay: number;
    completedEvents: number;
    plannedEvents: number;
}

export interface EventConflict {
    eventId: string;
    date: string;
    reason: string;
}
