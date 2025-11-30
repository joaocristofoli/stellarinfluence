// Creator Form State Types
export const PROFILE_TYPES = ['nano', 'micro', 'macro', 'mega', 'celebrity'] as const;
export const GENDER_OPTIONS = ['male', 'female', 'non-binary', 'other', 'not-disclosed'] as const;
export const POLITICAL_OPTIONS = ['left', 'center-left', 'center', 'center-right', 'right', 'neutral', 'not-disclosed'] as const;
export const TARGET_GENDER_OPTIONS = ['male', 'female', 'all', 'diverse'] as const;

export const MUSIC_GENRES = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Sertanejo', 'Funk',
    'Reggae', 'Jazz', 'Classical', 'MPB', 'Gospel', 'K-Pop', 'Indie'
];

export const CONTENT_GENRES = [
    'Lifestyle', 'Travel', 'Fitness', 'Fashion', 'Beauty', 'Tech',
    'Gaming', 'Food', 'DIY', 'Education', 'Business', 'Finance',
    'Comedy', 'Music', 'Sports', 'Photography', 'Art', 'Pets'
];

export type CreatorFormData = {
    // Basic
    name: string;
    slug: string;
    category: string;
    bio: string;
    image_url: string;

    // Demographics
    age: number | null;
    gender: typeof GENDER_OPTIONS[number] | '';
    location_city: string;
    location_state: string;
    location_country: string;

    // Psychographics
    political_leaning: typeof POLITICAL_OPTIONS[number] | '';
    music_preferences: string[];
    content_genres: string[];

    // Profile Type & Audience
    profile_type: typeof PROFILE_TYPES[number] | '';
    target_audience_description: string;
    target_age_min: number | null;
    target_age_max: number | null;
    target_gender: typeof TARGET_GENDER_OPTIONS[number] | '';

    // Social Media
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    twitter_url: string;
    linkedin_url: string;
    twitch_url: string;
    facebook_url: string;
    pinterest_url: string;

    instagram_active: boolean;
    youtube_active: boolean;
    tiktok_active: boolean;
    twitter_active: boolean;
    linkedin_active: boolean;
    twitch_active: boolean;
    facebook_active: boolean;
    pinterest_active: boolean;

    // Homepage
    featured_on_homepage: boolean;
    homepage_display_order: number;

    // Landing Theme
    primaryColor: string;
    secondaryColor: string;
    layout: string;
};

export const initialFormData: CreatorFormData = {
    name: '',
    slug: '',
    category: '',
    bio: '',
    image_url: '',

    age: null,
    gender: '',
    location_city: '',
    location_state: '',
    location_country: 'Brazil',

    political_leaning: '',
    music_preferences: [],
    content_genres: [],

    profile_type: '',
    target_audience_description: '',
    target_age_min: null,
    target_age_max: null,
    target_gender: '',

    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    twitter_url: '',
    linkedin_url: '',
    twitch_url: '',
    facebook_url: '',
    pinterest_url: '',

    instagram_active: false,
    youtube_active: false,
    tiktok_active: false,
    twitter_active: false,
    linkedin_active: false,
    twitch_active: false,
    facebook_active: false,
    pinterest_active: false,

    featured_on_homepage: false,
    homepage_display_order: 999,

    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    layout: 'default',
};
