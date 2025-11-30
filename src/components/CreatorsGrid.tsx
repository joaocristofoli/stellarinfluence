import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Instagram, Youtube, Twitter, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  instagram_followers: number;
  engagement_rate: string;
  instagram_active?: boolean;
  youtube_active?: boolean;
  tiktok_active?: boolean;
  twitter_active?: boolean;
  kwai_url?: string | null;
  kwai_active?: boolean;
}

// Extracted component to safely use hooks
function CreatorCard({ creator, index, scrollYProgress }: { creator: Creator; index: number; scrollYProgress: any }) {
  const navigate = useNavigate();
  // Calcular a posição para parallax baseado no índice
  const row = Math.floor(index / 3);
  const yOffset = useTransform(scrollYProgress, [0, 1], [50 + row * 30, -(50 + row * 30)]);

  return (
    <motion.div
      style={{ y: yOffset }}
      initial={{ opacity: 0, rotateY: -45, z: -100 }}
      whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        type: "spring",
        stiffness: 80,
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        z: 50,
        transition: { duration: 0.3 },
      }}
      onClick={() => navigate(`/creator/${creator.slug}`)}
    >
      <Card className="glass-premium border-white/10 overflow-hidden group cursor-pointer h-full hover:border-accent/30 transition-colors duration-500">
        {/* Image with Parallax */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={creator.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"}
            alt={creator.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Floating Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="absolute top-4 right-4 px-3 py-1 glass-premium rounded-full text-xs font-medium text-white border border-white/20"
          >
            {creator.category}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{creator.name}</h3>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
            {creator.instagram_followers > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-accent">{creator.instagram_followers.toLocaleString()}</span>
                seguidores
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-accent">{creator.engagement_rate || 'N/A'}</span>
              engajamento
            </div>
          </div>

          {/* Social Platforms */}
          <div className="flex gap-2">
            {creator.instagram_url && creator.instagram_active && (
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="p-2 glass rounded-lg"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
              </motion.div>
            )}
            {creator.youtube_url && creator.youtube_active && (
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="p-2 glass rounded-lg"
              >
                <Youtube className="w-4 h-4 text-red-400" />
              </motion.div>
            )}
            {creator.tiktok_url && creator.tiktok_active && (
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="p-2 glass rounded-lg"
              >
                <Music className="w-4 h-4 text-cyan-400" />
              </motion.div>
            )}
            {creator.twitter_url && creator.twitter_active && (
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="p-2 glass rounded-lg"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
              </motion.div>
            )}
            {creator.kwai_url && creator.kwai_active && (
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="p-2 glass rounded-lg"
              >
                {/* Kwai Icon (Custom SVG or Placeholder) */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </motion.div>
            )}
          </div>
        </div>

        {/* Animated Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background:
              "linear-gradient(45deg, transparent, rgba(255,107,53,0.3), transparent)",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Card>
    </motion.div>
  );
}

export function CreatorsGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax com múltiplas velocidades
  const y1 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  // Opacity fade in/out
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Scale effect
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .limit(6);

      if (error) throw error;
      if (data) setCreators(data);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-white/50">Carregando criadores...</div>;
  }

  return (
    <motion.section
      id="creators"
      ref={sectionRef}
      style={{ opacity }}
      className="relative py-24 sm:py-32 bg-black overflow-hidden"
    >
      {/* Animated Background Blobs - Different Speeds */}
      <motion.div
        style={{ y: y1, scale }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-accent/20 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute -bottom-40 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title with Stagger */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white via-accent to-purple-400 bg-clip-text text-transparent">
              Nossos Criadores
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            Conheça os talentos que impulsionam marcas globais
          </motion.p>
        </motion.div>

        {/* Creator Cards Grid with Stagger and 3D */}
        {/* Mobile: Horizontal Scroll with Snap */}
        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
          {creators.map((creator, i) => (
            <div key={creator.id} className="min-w-[280px] snap-center">
              <CreatorCard creator={creator} index={i} scrollYProgress={scrollYProgress} />
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {creators.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </motion.section>
  );
}
