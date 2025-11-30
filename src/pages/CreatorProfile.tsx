import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { LandingPagePreview } from "@/components/landing/LandingPagePreview";
import { defaultLandingTheme, LandingTheme } from "@/types/landingTheme";
import { LuxuryOverlay } from "@/components/ui/LuxuryOverlay";

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<any | null>(null);
  const [theme, setTheme] = useState<LandingTheme>(defaultLandingTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreator();
  }, [id]);

  const fetchCreator = async () => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

      let query = supabase
        .from("creators")
        .select("*");

      if (isUuid) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        // Use ilike for case-insensitive matching (e.g. /Bia matches slug "bia")
        query = query.ilike("slug", id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate("/");
        return;
      }

      setCreator(data);

      // Parse and merge theme
      if (data.landing_theme) {
        try {
          const parsedTheme = typeof data.landing_theme === 'string'
            ? JSON.parse(data.landing_theme)
            : data.landing_theme;

          // Deep copy default theme
          const mergedTheme = JSON.parse(JSON.stringify(defaultLandingTheme));

          // Override properties
          if (parsedTheme.primaryColor) mergedTheme.primaryColor = parsedTheme.primaryColor;
          if (parsedTheme.secondaryColor) mergedTheme.secondaryColor = parsedTheme.secondaryColor;
          if (parsedTheme.backgroundColor) mergedTheme.backgroundColor = parsedTheme.backgroundColor;
          if (parsedTheme.textColor) mergedTheme.textColor = parsedTheme.textColor;
          if (parsedTheme.fontFamily) mergedTheme.fontFamily = parsedTheme.fontFamily;
          if (parsedTheme.layout) mergedTheme.layout = parsedTheme.layout;
          if (parsedTheme.headerStyle) mergedTheme.headerStyle = parsedTheme.headerStyle;

          // Merge sections config if they exist
          if (parsedTheme.sections) {
            Object.keys(mergedTheme.sections).forEach(key => {
              if (parsedTheme.sections[key]) {
                mergedTheme.sections[key].enabled = parsedTheme.sections[key].enabled;
                mergedTheme.sections[key].order = parsedTheme.sections[key].order;
                if (parsedTheme.sections[key].config) {
                  mergedTheme.sections[key].config = {
                    ...mergedTheme.sections[key].config,
                    ...parsedTheme.sections[key].config
                  };
                }
              }
            });
          }

          setTheme(mergedTheme);
        } catch (e) {
          console.error("Error parsing theme:", e);
        }
      }

    } catch (error) {
      console.error("Error fetching creator:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!creator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <LuxuryOverlay />
      <Navbar simplified={true} />
      <LandingPagePreview theme={theme} creatorData={creator} />
    </div>
  );
}
