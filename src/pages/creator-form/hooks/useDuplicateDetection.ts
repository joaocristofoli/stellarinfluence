import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDuplicateDetection() {
    const [isChecking, setIsChecking] = useState(false);
    const [duplicates, setDuplicates] = useState<any[]>([]);

    const checkDuplicate = async (instagramUrl: string, currentId?: string) => {
        if (!instagramUrl) return [];

        setIsChecking(true);
        try {
            // Extract handle roughly
            const handle = instagramUrl.split('/').pop()?.replace('@', '') || '';
            if (handle.length < 3) return [];

            const { data, error } = await supabase
                .from('creators')
                .select('id, name, instagram_url, user_id, approval_status')
                .ilike('instagram_url', `%${handle}%`);

            if (error) throw error;

            // Filter out self
            const found = data?.filter(c => c.id !== currentId) || [];
            setDuplicates(found);
            return found;
        } catch (error) {
            console.error('Error checking duplicates:', error);
            return [];
        } finally {
            setIsChecking(false);
        }
    };

    return {
        isChecking,
        duplicates,
        checkDuplicate,
        clearDuplicates: () => setDuplicates([])
    };
}
