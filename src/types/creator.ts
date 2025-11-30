// src/types/creator.ts

export interface Creator {
    id: string;
    name: string;
    slug: string;
    category: string;
    total_followers: string; // aggregate string representation
    // engagement_rate is optional because some creators may not have it yet
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
}
