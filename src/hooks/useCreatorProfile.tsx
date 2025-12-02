import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Creator = {
    id: string;
    user_id?: string;
    name: string;
    slug: string;
    category: string;
    bio: string;
    image_url: string;
    total_followers: string | number;
    engagement_rate: string;
    stories_views: string;
    // Social URLs
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    twitter_url?: string;
    kwai_url?: string;
    // Active Flags
    instagram_active?: boolean;
    youtube_active?: boolean;
    tiktok_active?: boolean;
    twitter_active?: boolean;
    kwai_active?: boolean;
    // Follower Counts
    instagram_followers?: string | number;
    youtube_subscribers?: string | number;
    tiktok_followers?: string | number;
    twitter_followers?: string | number;
    kwai_followers?: string | number;
    // Theme
    landing_theme?: any;
    gallery_urls?: string[];
    phone?: string;
    primary_platform?: string;
};

export function useCreatorProfile() {
    const { user } = useAuth();
    const [creator, setCreator] = useState<Creator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCreatorProfile = async () => {
            console.log("🔍 useCreatorProfile: Starting fetch, user:", user?.id);

            if (!user) {
                console.log("🔍 useCreatorProfile: No user, setting loading=false");
                setLoading(false);
                return;
            }

            setLoading(true);
            console.log("🔍 useCreatorProfile: Fetching creator for user_id:", user.id);

            try {
                // First, try to find creator by user_id
                const { data, error: fetchError } = await supabase
                    .from("creators")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (fetchError) {
                    console.error("🔍 useCreatorProfile: Fetch error:", fetchError);
                    throw fetchError;
                }

                console.log("🔍 useCreatorProfile: Found creator:", data ? data.name : "null");
                setCreator(data as unknown as Creator);
            } catch (err: any) {
                console.error("🔍 useCreatorProfile: Error:", err.message);
                setError(err.message);
            } finally {
                console.log("🔍 useCreatorProfile: Setting loading=false");
                setLoading(false);
            }
        };

        fetchCreatorProfile();
    }, [user]);

    const updateProfile = async (updates: Partial<Creator>) => {
        if (!creator) return { error: "No creator profile found" };

        try {
            const { data, error: updateError } = await supabase
                .from("creators")
                .update(updates as any)
                .eq("id", creator.id)
                .select()
                .single();

            if (updateError) throw updateError;

            setCreator(data as unknown as Creator);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const linkUserToCreator = async (creatorId: string) => {
        if (!user) return { error: "Not authenticated" };

        try {
            const { data, error: linkError } = await supabase
                .from("creators")
                .update({ user_id: user.id } as any)
                .eq("id", creatorId)
                .select()
                .single();

            if (linkError) throw linkError;

            setCreator(data as unknown as Creator);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const refetchProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("creators")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;
            setCreator(data as unknown as Creator);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        creator,
        loading,
        error,
        updateProfile,
        linkUserToCreator,
        refetch: refetchProfile,
    };
}
