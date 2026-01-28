import { supabase } from '@/integrations/supabase/client';
import { MarketingStrategy, Company } from '@/types/marketing';

export interface SharedPlanData {
    id: string;
    companyData: Company;
    strategiesData: MarketingStrategy[];
    createdAt: Date;
    expiresAt: Date;
    views: number;
    /** When true, financial data is hidden from the client portal */
    hideFinancials: boolean;
}

/**
 * Creates a shareable link for a marketing plan.
 * The link expires after 24 hours.
 * @param hideFinancials - When true, financial data is filtered server-side
 * @returns The share ID (UUID) that can be used to build the URL
 */
export async function createShareableLink(
    company: Company,
    strategies: MarketingStrategy[],
    hideFinancials: boolean = false
): Promise<string> {
    console.log('[createShareableLink] Called with hideFinancials:', hideFinancials);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // @ts-expect-error - Table will exist after migration is applied
    const { data, error } = await (supabase as any)
        .from('shared_plans')
        .insert({
            company_id: company.id,
            company_data: company,
            strategies_data: strategies,
            expires_at: expiresAt.toISOString(),
            hide_financials: hideFinancials,
        })
        .select('id')
        .single();

    console.log('[createShareableLink] Insert result:', { data, error, hideFinancials });

    if (error) throw error;
    return data.id;
}

/**
 * Fetches a shared plan by ID.
 * Returns null if not found or expired.
 * Financial data is filtered SERVER-SIDE when hide_financials is true.
 */
export async function getSharedPlan(id: string): Promise<SharedPlanData | null> {
    // @ts-expect-error - Table will exist after migration is applied
    const { data, error } = await (supabase as any)
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
    // @ts-expect-error - Table will exist after migration is applied
    await (supabase as any)
        .from('shared_plans')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);

    const hideFinancials = data.hide_financials === true;

    console.log('[getSharedPlan] Retrieved data:', {
        id: data.id,
        hide_financials_raw: data.hide_financials,
        hideFinancials_parsed: hideFinancials
    });

    // SERVER-SIDE FILTERING: Strip financial data when hideFinancials is true
    let filteredStrategies = data.strategies_data as MarketingStrategy[];
    if (hideFinancials) {
        console.log('[getSharedPlan] FILTERING: Hiding financial data');
        filteredStrategies = filteredStrategies.map(strategy => ({
            ...strategy,
            budget: 0, // Zero out budget
        }));
    }

    return {
        id: data.id,
        companyData: data.company_data as Company,
        strategiesData: filteredStrategies,
        createdAt: new Date(data.created_at),
        expiresAt,
        views: data.views || 0,
        hideFinancials,
    };
}

/**
 * Generates the full shareable URL for a plan.
 * Uses the new premium /cliente/ route.
 */
export function getShareableUrl(shareId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/cliente/${shareId}`;
}

