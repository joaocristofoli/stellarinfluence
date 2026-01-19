import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Soft Delete Configuration
 */
export interface SoftDeleteConfig {
    /** Table name in Supabase */
    tableName: string;
    /** Field that marks deletion (default: 'deleted_at') */
    deletedAtField?: string;
    /** Time in ms before permanent deletion (default: 5000) */
    undoTimeout?: number;
    /** Success message for toast */
    successMessage?: string;
    /** Undo message for toast */
    undoMessage?: string;
}

/**
 * Result of a soft delete operation
 */
export interface SoftDeleteResult {
    /** ID of the deleted item */
    id: string;
    /** Whether the deletion is pending (can be undone) */
    isPending: boolean;
    /** Timestamp of deletion */
    deletedAt: Date;
    /** Backup of the original data */
    backup: Record<string, unknown>;
}

/**
 * Hook for managing soft delete operations with undo capability
 * 
 * @description
 * Implements a soft delete pattern where items are marked as deleted
 * rather than immediately removed. Users have a configurable time window
 * to undo the deletion before it becomes permanent.
 * 
 * @example
 * ```tsx
 * const { softDelete, restore, pendingDeletions, checkLinkedData } = useSoftDelete({
 *   tableName: 'creators',
 *   successMessage: 'Criador removido',
 *   undoTimeout: 5000,
 * });
 * 
 * // Delete with undo capability
 * await softDelete(creatorId);
 * ```
 */
export function useSoftDelete(config: SoftDeleteConfig) {
    const {
        tableName,
        deletedAtField = 'deleted_at',
        undoTimeout = 5000,
        successMessage = 'Item removido',
        undoMessage = 'Desfazer',
    } = config;

    const { toast } = useToast();
    const [pendingDeletions, setPendingDeletions] = useState<Map<string, SoftDeleteResult>>(new Map());

    /**
     * Check if an item has linked data in other tables
     * Prevents cascade issues by checking foreign key relationships
     * 
     * @param id - The ID of the item to check
     * @param linkedTables - Array of { table, field } to check
     * @returns Array of table names where linked data exists
     */
    const checkLinkedData = useCallback(async (
        id: string,
        linkedTables: Array<{ table: string; field: string }>
    ): Promise<string[]> => {
        const linkedIn: string[] = [];

        for (const { table, field } of linkedTables) {
            try {
                // Check for direct field match
                const { data } = await (supabase as any)
                    .from(table)
                    .select('id')
                    .eq(field, id)
                    .limit(1);

                if (data && data.length > 0) {
                    linkedIn.push(table);
                    continue;
                }

                // Check for array contains (for fields like linkedCreatorIds)
                const { data: arrayData } = await (supabase as any)
                    .from(table)
                    .select('id')
                    .contains(field, [id])
                    .limit(1);

                if (arrayData && arrayData.length > 0) {
                    linkedIn.push(table);
                }
            } catch {
                // Ignore errors for tables that don't have the field
            }
        }

        return linkedIn;
    }, []);

    /**
     * Perform a soft delete with undo capability
     * 
     * @param id - The ID of the item to delete
     * @returns Promise resolving to success boolean
     */
    const softDelete = useCallback(async (id: string): Promise<boolean> => {
        try {
            // First, backup the data
            const { data: backup, error: fetchError } = await (supabase as any)
                .from(tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !backup) {
                throw new Error('Não foi possível fazer backup do item');
            }

            // Mark as deleted (soft delete)
            const deletedAt = new Date();
            const { error: updateError } = await (supabase as any)
                .from(tableName)
                .update({ [deletedAtField]: deletedAt.toISOString() })
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            // Store pending deletion
            const result: SoftDeleteResult = {
                id,
                isPending: true,
                deletedAt,
                backup,
            };

            setPendingDeletions(prev => {
                const newMap = new Map(prev);
                newMap.set(id, result);
                return newMap;
            });

            // Show toast with undo action
            const toastInstance = toast({
                title: successMessage,
                description: `Clique em "${undoMessage}" para restaurar`,
                action: (
                    <button
                        onClick={() => restore(id)}
                        className="ml-auto bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        {undoMessage}
                    </button>
                ),
                duration: undoTimeout,
            });

            // Schedule permanent deletion after timeout
            setTimeout(async () => {
                const current = pendingDeletions.get(id);
                if (current?.isPending) {
                    // Perform permanent deletion
                    await (supabase as any)
                        .from(tableName)
                        .delete()
                        .eq('id', id);

                    setPendingDeletions(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(id);
                        return newMap;
                    });
                }
            }, undoTimeout);

            return true;
        } catch (error: any) {
            toast({
                title: 'Erro ao remover',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [tableName, deletedAtField, undoTimeout, successMessage, undoMessage, toast, pendingDeletions]);

    /**
     * Restore a soft-deleted item
     * 
     * @param id - The ID of the item to restore
     * @returns Promise resolving to success boolean
     */
    const restore = useCallback(async (id: string): Promise<boolean> => {
        try {
            const pending = pendingDeletions.get(id);
            if (!pending) {
                throw new Error('Item não encontrado para restauração');
            }

            // Clear the deleted_at field
            const { error } = await (supabase as any)
                .from(tableName)
                .update({ [deletedAtField]: null })
                .eq('id', id);

            if (error) throw error;

            // Remove from pending
            setPendingDeletions(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });

            toast({
                title: 'Item restaurado',
                description: 'A exclusão foi desfeita com sucesso',
            });

            return true;
        } catch (error: any) {
            toast({
                title: 'Erro ao restaurar',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [tableName, deletedAtField, pendingDeletions, toast]);

    /**
     * Force permanent deletion (bypasses soft delete)
     * 
     * @param id - The ID of the item to permanently delete
     * @returns Promise resolving to success boolean
     */
    const permanentDelete = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPendingDeletions(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });

            return true;
        } catch (error: any) {
            toast({
                title: 'Erro ao excluir permanentemente',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [tableName, toast]);

    return {
        softDelete,
        restore,
        permanentDelete,
        checkLinkedData,
        pendingDeletions,
        isPending: (id: string) => pendingDeletions.get(id)?.isPending ?? false,
    };
}

export default useSoftDelete;
