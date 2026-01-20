/**
 * Creator - Represents a content creator/influencer in the platform
 * 
 * @description
 * This type is used across the admin panel, public profiles, and marketing planner.
 * The `deleted_at` field supports soft delete pattern for undo functionality.
 */
export interface Creator {
    id: string;
    name: string;
    slug: string;
    profile_type?: string;
    category: string;
    /** Aggregate string representation (e.g., "1.5M", "500K") */
    total_followers: string;
    /** Engagement rate as string (e.g., "5.2%") - use parseEngagementRate() for numeric */
    engagement_rate?: string;
    image_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    twitter_url?: string;
    kwai_url?: string;
    instagram_active: boolean;
    youtube_active: boolean;
    tiktok_active: boolean;
    twitter_active: boolean;
    kwai_active: boolean;
    instagram_followers?: string;
    youtube_subscribers?: string;
    tiktok_followers?: string;
    twitter_followers?: string;
    kwai_followers?: string;
    stories_views?: string;
    gallery_urls?: string;
    phone?: string;
    primary_platform?: string;
    primaryColor?: string;
    secondaryColor?: string;
    layout?: string;
    /** Soft delete timestamp - null means active, Date means deleted */
    deleted_at?: string | null;
    user_id?: string;
    created_at?: string;
    updated_at?: string;

    // Approval Workflow
    approval_status?: 'pending' | 'approved' | 'rejected';
    approved_by?: string;
    approved_at?: string;

    // Relationships
    agency_id?: string;
    parent_creator_id?: string;

    // Location (for filtering)
    city?: string;
    state?: string;

    // Outdoor/BTL specific
    location?: string;
    dimensions?: string;
    traffic?: string;
    format?: string;
    outdoor_face?: string;
    outdoor_lighting?: boolean;
    min_period?: string;
    gps_coordinates?: string;
}

/**
 * Helper to check if a creator is soft-deleted
 */
export const isCreatorDeleted = (creator: Creator): boolean => {
    return creator.deleted_at !== null && creator.deleted_at !== undefined;
};
