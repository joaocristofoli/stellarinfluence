import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CreatorCard } from "./CreatorCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Creator = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  instagram_active: boolean;
  youtube_active: boolean;
  tiktok_active: boolean;
  twitter_active: boolean;
  total_followers: string;
  engagement_rate: string;
};

export function CreatorsGrid() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="creators" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </section>
    );
  }

  return (
    <section id="creators" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="mb-6">
            Nossos
            <br />
            <span className="text-gradient">Criadores</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça os talentos que estão moldando o futuro do marketing digital
          </p>
        </motion.div>

        {creators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum criador cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator, index) => (
              <CreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
