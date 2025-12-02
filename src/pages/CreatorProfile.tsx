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
          if (parsedTheme.backgroundImage) mergedTheme.backgroundImage = parsedTheme.backgroundImage;

          // Background Image
          console.log('Creator ID:', (data as any).id);
          console.log('DB background_image_url:', (data as any).background_image_url);
          console.log('Parsed theme backgroundImage:', parsedTheme.backgroundImage);

          if ((data as any).background_image_url) {
            mergedTheme.backgroundImage = (data as any).background_image_url;
            // If image exists and opacity is default (1), reduce it to show the image
            // We check against the default value or if it wasn't set in the parsed theme
            if (parsedTheme.backgroundOpacity === undefined || parsedTheme.backgroundOpacity === 1) {
              mergedTheme.backgroundOpacity = 0.5;
            }
          }
          console.log('Final mergedTheme backgroundImage:', mergedTheme.backgroundImage);
          console.log('Final mergedTheme backgroundOpacity:', mergedTheme.backgroundOpacity);

          // Animation & Background Settings
          // Check if properties exist in the theme JSON first, otherwise fallback to defaults
          // But here we want to prioritize what's in the creator record if we decide to store them as top-level columns later.
          // For now, they are likely inside landing_theme JSON if saved via CreatorForm.

          // However, CreatorForm saves them into landing_theme JSON.
          // So the loop above that merges parsedTheme should have already handled it IF those properties were in parsedTheme.
          // Let's double check if we are merging them.

          if (parsedTheme.enableAnimatedBackground !== undefined) mergedTheme.enableAnimatedBackground = parsedTheme.enableAnimatedBackground;
          if (parsedTheme.backgroundBlur !== undefined) mergedTheme.backgroundBlur = parsedTheme.backgroundBlur;
          if (parsedTheme.backgroundOpacity !== undefined) mergedTheme.backgroundOpacity = parsedTheme.backgroundOpacity;

          // Sync Bio to About Section
          if (data.bio) {
            mergedTheme.sections.about.config.content = data.bio;
          }

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
