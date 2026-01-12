import { supabase } from '@/integrations/supabase/client';
import { MarketingStrategy, Company } from '@/types/marketing';

export interface SharedPlanData {
    id: string;
    companyData: Company;
    strategiesData: MarketingStrategy[];
    createdAt: Date;
    expiresAt: Date;
    views: number;
}

/**
 * Creates a shareable link for a marketing plan.
 * The link expires after 24 hours.
 * @returns The share ID (UUID) that can be used to build the URL
 */
export async function createShareableLink(
    company: Company,
    strategies: MarketingStrategy[]
): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // @ts-ignore - Table will exist after migration is applied
    const { data, error } = await supabase
        .from('shared_plans')
        .insert({
            company_id: company.id,
            company_data: company,
            strategies_data: strategies,
            expires_at: expiresAt.toISOString(),
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Fetches a shared plan by ID.
 * Returns null if not found or expired.
 */
export async function getSharedPlan(id: string): Promise<SharedPlanData | null> {
    // @ts-ignore - Table will exist after migration is applied
    const { data, error } = await supabase
        .from('shared_plans')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
        return null; // Expired
    }

    // Increment view count
    // @ts-ignore - Table will exist after migration is applied
    await supabase
        .from('shared_plans')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);

    return {
        id: data.id,
        companyData: data.company_data as Company,
        strategiesData: data.strategies_data as MarketingStrategy[],
        createdAt: new Date(data.created_at),
        expiresAt,
        views: data.views || 0,
    };
}

/**
 * Generates the full shareable URL for a plan.
 */
export function getShareableUrl(shareId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/view/plan/${shareId}`;
}

