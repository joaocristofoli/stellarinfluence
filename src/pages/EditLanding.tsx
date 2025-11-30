import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LandingPageEditor } from "@/components/landing/LandingPageEditor";
import { LandingTheme, defaultLandingTheme } from "@/types/landingTheme";
import { Loader2 } from "lucide-react";

export default function EditLanding() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { toast } = useToast();
    const [theme, setTheme] = useState<LandingTheme | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth");
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!authLoading && user && !isAdmin) {
            navigate("/");
        }
    }, [user, authLoading, isAdmin, navigate]);

    const [creatorData, setCreatorData] = useState<any>(null);

    useEffect(() => {
        if (id && user && isAdmin) {
            fetchCreatorData();
        }
    }, [id, user, isAdmin]);

    const fetchCreatorData = async () => {
        try {
            const { data, error } = await supabase
                .from("creators")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            setCreatorData(data);

            // Start with default theme
            let existingTheme = { ...defaultLandingTheme };

            if (data?.landing_theme) {
                try {
                    // Parse if string
                    const parsedTheme = typeof data.landing_theme === 'string'
                        ? JSON.parse(data.landing_theme)
                        : data.landing_theme;

                    // Start with a DEEP COPY of default theme
                    existingTheme = JSON.parse(JSON.stringify(defaultLandingTheme));

                    // Override only colors/fonts/layout if they exist in parsed theme
                    if (parsedTheme.primaryColor) existingTheme.primaryColor = parsedTheme.primaryColor;
                    if (parsedTheme.secondaryColor) existingTheme.secondaryColor = parsedTheme.secondaryColor;
                    if (parsedTheme.backgroundColor) existingTheme.backgroundColor = parsedTheme.backgroundColor;
                    if (parsedTheme.textColor) existingTheme.textColor = parsedTheme.textColor;
                    if (parsedTheme.fontFamily) existingTheme.fontFamily = parsedTheme.fontFamily;
                    if (parsedTheme.layout) existingTheme.layout = parsedTheme.layout;

                    // Merge sections carefully if needed, or just rely on default structure + config overrides
                    // For now, we keep default sections structure to ensure new features appear, 
                    // but we might want to load saved section configs in the future.
                    // If the user saved specific text/images, we need to load them.
                    if (parsedTheme.sections) {
                        // Merge saved section configs into default sections
                        Object.keys(existingTheme.sections).forEach(key => {
                            if (parsedTheme.sections[key]) {
                                existingTheme.sections[key] = {
                                    ...existingTheme.sections[key],
                                    ...parsedTheme.sections[key],
                                    config: {
                                        ...existingTheme.sections[key].config,
                                        ...parsedTheme.sections[key].config
                                    }
                                };
                            }
                        });
                    }

                } catch (parseError) {
                    console.warn('Failed to parse landing_theme, using default:', parseError);
                }
            }

            setTheme(existingTheme as LandingTheme);
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive",
            });
            setTheme(defaultLandingTheme);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (newTheme: LandingTheme) => {
        try {
            const { error } = await supabase
                .from("creators")
                .update({ landing_theme: newTheme as unknown as any })
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Tema salvo!",
                description: "As alterações foram salvas com sucesso.",
            });

            setTheme(newTheme);
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!user || !isAdmin || !theme) {
        return null;
    }

    return <LandingPageEditor theme={theme} creatorId={id!} creatorData={creatorData} onSave={handleSave} />;
}
