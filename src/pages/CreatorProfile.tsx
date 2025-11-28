import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Youtube, Music, Twitter, ArrowLeft, Loader2, TrendingUp, Eye, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type Creator = {
  id: string;
  name: string;
  slug: string;
  category: string;
  bio: string | null;
  image_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  instagram_active: boolean;
  youtube_active: boolean;
  tiktok_active: boolean;
  twitter_active: boolean;
  instagram_followers: number;
  youtube_followers: number;
  tiktok_followers: number;
  twitter_followers: number;
  total_followers: string;
  engagement_rate: string;
  landing_theme: any;
};

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreator();
  }, [id]);

  const fetchCreator = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate("/");
        return;
      }

      setCreator(data);
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-accent hover:gap-4 smooth-transition mb-8">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden glass">
                <img
                  src={creator.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-glow" />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-4">
                <h1 className="text-5xl md:text-6xl font-black mb-3">{creator.name}</h1>
                <p className="text-2xl text-accent font-semibold">{creator.category}</p>
              </div>

              {creator.bio && (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {creator.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex gap-4 mb-12 flex-wrap">
                {creator.instagram_active && creator.instagram_url && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={creator.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="font-medium">Instagram</span>
                  </motion.a>
                )}
                {creator.youtube_active && creator.youtube_url && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={creator.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Youtube className="w-5 h-5" />
                    <span className="font-medium">YouTube</span>
                  </motion.a>
                )}
                {creator.tiktok_active && creator.tiktok_url && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={creator.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Music className="w-5 h-5" />
                    <span className="font-medium">TikTok</span>
                  </motion.a>
                )}
                {creator.twitter_active && creator.twitter_url && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={creator.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="font-medium">Twitter</span>
                  </motion.a>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-black text-accent mb-2">
                    {creator.total_followers}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Seguidores</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-black text-accent mb-2">
                    {creator.engagement_rate}
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Engajamento</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12 text-center"
          >
            Estatísticas <span className="text-gradient">por Plataforma</span>
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {creator.instagram_active && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-3xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Instagram className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-black mb-2">{creator.instagram_followers.toLocaleString()}</div>
                <div className="text-muted-foreground">Seguidores no Instagram</div>
              </motion.div>
            )}

            {creator.youtube_active && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass rounded-3xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Youtube className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-black mb-2">{creator.youtube_followers.toLocaleString()}</div>
                <div className="text-muted-foreground">Inscritos no YouTube</div>
              </motion.div>
            )}

            {creator.tiktok_active && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="glass rounded-3xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-black mb-2">{creator.tiktok_followers.toLocaleString()}</div>
                <div className="text-muted-foreground">Seguidores no TikTok</div>
              </motion.div>
            )}

            {creator.twitter_active && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="glass rounded-3xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Twitter className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-black mb-2">{creator.twitter_followers.toLocaleString()}</div>
                <div className="text-muted-foreground">Seguidores no Twitter</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold mb-6">
              Interessado em uma <span className="text-gradient">Parceria</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato para discutir oportunidades de colaboração com {creator.name}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-accent text-accent-foreground rounded-full font-semibold text-lg smooth-transition hover:shadow-[0_0_40px_rgba(255,107,53,0.6)]"
            >
              Fale Conosco
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
