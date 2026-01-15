import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlyerCampaign, FlyerEvent, FlyerAssignment, FlyerManager } from '@/types/flyer';

// ============================================================================
// MAPPER FUNCTIONS (DB snake_case → TS camelCase)
// ============================================================================

const mapDbToCampaign = (row: any): FlyerCampaign => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description,
    color: row.color,
    startDate: row.start_date,
    endDate: row.end_date,
    totalBudget: parseFloat(row.total_budget || '0'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const mapDbToEvent = (row: any): FlyerEvent => ({
    id: row.id,
    campaignId: row.campaign_id,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    numPeople: row.num_people,
    hourlyRate: parseFloat(row.hourly_rate),
    shiftDuration: parseFloat(row.shift_duration),
    dayCost: parseFloat(row.day_cost),
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const mapDbToAssignment = (row: any): FlyerAssignment => ({
    id: row.id,
    eventId: row.event_id,
    personName: row.person_name,
    role: row.role,
    contact: row.contact,
    createdAt: row.created_at,
});

const mapDbToManager = (row: any): FlyerManager => ({
    id: row.id,
    campaignId: row.campaign_id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
});

// ============================================================================
// CAMPAIGNS
// ============================================================================

export function useFlyerCampaigns(companyId: string | null) {
    return useQuery({
        queryKey: ['flyer-campaigns', companyId],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('flyer_campaigns')
                .select('*')
                .eq('company_id', companyId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            return data.map(mapDbToCampaign);
        },
        enabled: !!companyId,
    });
}

export function useCreateFlyerCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (campaign: Omit<FlyerCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('flyer_campaigns')
                .insert({
                    company_id: campaign.companyId,
                    name: campaign.name,
                    description: campaign.description,
                    color: campaign.color,
                    start_date: campaign.startDate,
                    end_date: campaign.endDate,
                    total_budget: campaign.totalBudget,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCampaign(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-campaigns', data.companyId] });
        },
    });
}

export function useUpdateFlyerCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...campaign }: Partial<FlyerCampaign> & { id: string }) => {
            const { data, error } = await supabase
                .from('flyer_campaigns')
                .update({
                    name: campaign.name,
                    description: campaign.description,
                    color: campaign.color,
                    start_date: campaign.startDate,
                    end_date: campaign.endDate,
                    total_budget: campaign.totalBudget,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToCampaign(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-campaigns', data.companyId] });
        },
    });
}

export function useDeleteFlyerCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const { error } = await supabase
                .from('flyer_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id, companyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-campaigns', data.companyId] });
            queryClient.invalidateQueries({ queryKey: ['flyer-events'] });
        },
    });
}

// ============================================================================
// EVENTS
// ============================================================================

export function useFlyerEvents(campaignId: string | null) {
    return useQuery({
        queryKey: ['flyer-events', campaignId],
        queryFn: async () => {
            if (!campaignId) return [];

            const { data, error } = await supabase
                .from('flyer_events')
                .select('*')
                .eq('campaign_id', campaignId)
                .order('event_date', { ascending: true });

            if (error) throw error;
            return data.map(mapDbToEvent);
        },
        enabled: !!campaignId,
    });
}

export function useCreateFlyerEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: Omit<FlyerEvent, 'id' | 'dayCost' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('flyer_events')
                .insert({
                    campaign_id: event.campaignId,
                    event_date: event.eventDate,
                    start_time: event.startTime,
                    end_time: event.endTime,
                    location: event.location,
                    num_people: event.numPeople,
                    hourly_rate: event.hourlyRate,
                    shift_duration: event.shiftDuration,
                    notes: event.notes,
                    status: event.status,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToEvent(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-events', data.campaignId] });
        },
    });
}

export function useUpdateFlyerEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...event }: Partial<FlyerEvent> & { id: string }) => {
            const { data, error } = await supabase
                .from('flyer_events')
                .update({
                    event_date: event.eventDate,
                    start_time: event.startTime,
                    end_time: event.endTime,
                    location: event.location,
                    num_people: event.numPeople,
                    hourly_rate: event.hourlyRate,
                    shift_duration: event.shiftDuration,
                    notes: event.notes,
                    status: event.status,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToEvent(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-events', data.campaignId] });
        },
    });
}

export function useDeleteFlyerEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, campaignId }: { id: string; campaignId: string }) => {
            const { error } = await supabase
                .from('flyer_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id, campaignId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-events', data.campaignId] });
            queryClient.invalidateQueries({ queryKey: ['flyer-assignments'] });
        },
    });
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export function useFlyerAssignments(eventId: string | null) {
    return useQuery({
        queryKey: ['flyer-assignments', eventId],
        queryFn: async () => {
            if (!eventId) return [];

            const { data, error } = await supabase
                .from('flyer_assignments')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data.map(mapDbToAssignment);
        },
        enabled: !!eventId,
    });
}

export function useCreateFlyerAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assignment: Omit<FlyerAssignment, 'id' | 'createdAt'>) => {
            const { data, error } = await supabase
                .from('flyer_assignments')
                .insert({
                    event_id: assignment.eventId,
                    person_name: assignment.personName,
                    role: assignment.role,
                    contact: assignment.contact,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToAssignment(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-assignments', data.eventId] });
        },
    });
}

export function useDeleteFlyerAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
            const { error } = await supabase
                .from('flyer_assignments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id, eventId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-assignments', data.eventId] });
        },
    });
}

// ============================================================================
// MANAGERS
// ============================================================================

export function useFlyerManagers(campaignId: string | null) {
    return useQuery({
        queryKey: ['flyer-managers', campaignId],
        queryFn: async () => {
            if (!campaignId) return [];

            const { data, error } = await supabase
                .from('flyer_managers')
                .select('*')
                .eq('campaign_id', campaignId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data.map(mapDbToManager);
        },
        enabled: !!campaignId,
    });
}

export function useCreateFlyerManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (manager: Omit<FlyerManager, 'id' | 'createdAt'>) => {
            const { data, error } = await supabase
                .from('flyer_managers')
                .insert({
                    campaign_id: manager.campaignId,
                    name: manager.name,
                    role: manager.role,
                    email: manager.email,
                    phone: manager.phone,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToManager(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-managers', data.campaignId] });
        },
    });
}

export function useDeleteFlyerManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, campaignId }: { id: string; campaignId: string | undefined }) => {
            const { error } = await supabase
                .from('flyer_managers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id, campaignId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['flyer-managers', data.campaignId] });
        },
    });
}
