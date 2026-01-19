import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for real-time synchronization of creators data
 * 
 * @description
 * Subscribes to Postgres changes on the creators table and automatically
 * invalidates the React Query cache when changes occur. This ensures
 * that all components showing creator data stay in sync across browser tabs
 * and users.
 * 
 * @example
 * ```tsx
 * // In your component or parent
 * useCreatorsRealtime();
 * 
 * // Or with a callback for custom handling
 * useCreatorsRealtime((payload) => {
 *   console.log('Creator changed:', payload);
 * });
 * ```
 * 
 * @param onCreatorChange - Optional callback for custom change handling
 */
export function useCreatorsRealtime(
    onCreatorChange?: (payload: {
        eventType: 'INSERT' | 'UPDATE' | 'DELETE';
        new: any;
        old: any;
    }) => void
) {
    const queryClient = useQueryClient();

    const handleChange = useCallback((payload: any) => {
        // Log in development only
        if (import.meta.env.DEV) {
            console.log('🔄 Realtime: Creator change detected', payload.eventType);
        }

        // Invalidate React Query cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['creators'] });

        // Call custom handler if provided
        onCreatorChange?.(payload);
    }, [queryClient, onCreatorChange]);

    useEffect(() => {
        // Create channel for creators table changes
        const channel = supabase
            .channel('creators_realtime_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'creators',
                },
                handleChange
            )
            .subscribe((status) => {
                if (import.meta.env.DEV) {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Realtime: Connected to creators channel');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Realtime: Failed to connect to creators channel');
                    }
                }
            });

        // Cleanup on unmount
        return () => {
            if (import.meta.env.DEV) {
                console.log('🔌 Realtime: Disconnecting from creators channel');
            }
            supabase.removeChannel(channel);
        };
    }, [handleChange]);
}

export default useCreatorsRealtime;
