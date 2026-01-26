import { ProfileType } from './profileTypes';

// Example tiers
export const INFLUENCER_TIERS = ['nano', 'micro', 'macro', 'mega', 'celebrity'] as const;

export type CreatorFormData = {
    // Basic
    name: string;
    slug: string;
    category: string;
    bio: string;
    image_url: string;
    background_image_url: string;
    phone: string;

    // Type & Audience
    profile_type: ProfileType | '';

    // Relationships
    agency_id?: string;
    parent_creator_id?: string;

    // Outdoor/BTL Specifics
    location?: string;
    dimensions?: string;
    traffic?: string;
    format?: string; // BTL

    // New Outdoor Fields (Premium Agency)
    outdoor_face?: string;
    outdoor_lighting?: boolean;
    min_period?: string;
    gps_coordinates?: string;

    // Admin Metadata (Generic bag for extreme flexibility)
    company?: string;
    program_name?: string;
    reach?: string;

    // Financial & Legal
    legal_name?: string;
    document_id?: string;
    pix_key?: string;
    pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    bank_name?: string;
    bank_agency?: string;
    bank_account?: string;
    address_street?: string;
    address_number?: string;
    address_zip?: string;
    contract_status?: 'none' | 'draft' | 'sent' | 'signed';

    // Social Media
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    twitter_url: string;
    kwai_url: string;

    instagram_active: boolean;
    youtube_active: boolean;
    tiktok_active: boolean;
    twitter_active: boolean;
    kwai_active: boolean;

    // Metrics (Display values, usually strings during input)
    instagram_followers: string;
    tiktok_followers: string;
    youtube_subscribers: string;
    twitter_followers: string;
    kwai_followers: string;
    engagement_rate: string;
    stories_views: string;

    // Media
    gallery_urls: string[];

    // Landing Theme
    primaryColor: string;
    secondaryColor: string;
    layout: string;
    primary_platform: string;

    // Admin & Pricing Metadata
    admin_metadata: {
        // Demographics
        age: string;
        sexual_orientation: string;
        male_audience_percent: string;
        female_audience_percent: string;
        audience_age_ranges: string;
        ideology: string;
        promoted_betting: boolean;

        // Pricing
        price_story: string;
        price_reels: string;
        price_feed_post: string;
        price_carousel: string;
        price_tiktok_simple: string;
        price_tiktok_produced: string;
        price_youtube_mention: string;
        price_youtube_dedicated: string;
        price_package_basic: string;
        price_package_premium: string;
        pricing_notes: string;

        custom_prices: { label: string; price: string }[];

        // Homepage Specifics
        featured: boolean;
        home_image: string;
        home_image_pos: string; // e.g., "center top"
    };

    // Legacy/Unused potential fields (keeping for safety or removal)
    music_preferences: string[];
    content_genres: string[];
};

export const initialFormData: CreatorFormData = {
    name: '',
    slug: '',
    category: '',
    bio: '',
    image_url: '',
    background_image_url: '',
    phone: '',

    profile_type: 'influencer',

    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    twitter_url: '',
    kwai_url: '',

    instagram_active: false,
    youtube_active: false,
    tiktok_active: false,
    twitter_active: false,
    kwai_active: false,

    instagram_followers: '',
    tiktok_followers: '',
    youtube_subscribers: '',
    twitter_followers: '',
    kwai_followers: '',
    engagement_rate: '',
    stories_views: '',

    gallery_urls: [],

    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    layout: 'default',
    primary_platform: '',

    // Financial Defaults
    legal_name: '',
    document_id: '',
    pix_key: '',
    pix_key_type: 'cpf',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    address_street: '',
    address_number: '',
    address_zip: '',
    contract_status: 'none',

    admin_metadata: {
        age: '',
        sexual_orientation: '',
        male_audience_percent: '',
        female_audience_percent: '',
        audience_age_ranges: '',
        ideology: '',
        promoted_betting: false,
        price_story: '',
        price_reels: '',
        price_feed_post: '',
        price_carousel: '',
        price_tiktok_simple: '',
        price_tiktok_produced: '',
        price_youtube_mention: '',
        price_youtube_dedicated: '',
        price_package_basic: '',
        price_package_premium: '',
        pricing_notes: '',
        custom_prices: [],
        featured: false,
        home_image: '',
        home_image_pos: 'center center',
    },

    music_preferences: [],
    content_genres: [],
};

