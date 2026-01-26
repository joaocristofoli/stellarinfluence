// CreatorsGrid.tsx

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Instagram, Youtube, Twitter, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "@/utils/formatters";
import { Creator } from "@/types/creator";

// Enhanced Card with custom image support
function CreatorCard({ creator, index, scrollYProgress }: { creator: Creator; index: number; scrollYProgress: any }) {
  const navigate = useNavigate();
  const row = Math.floor(index / 3);
  const yOffset = useTransform(scrollYProgress, [0, 1], [50 + row * 30, -(50 + row * 30)]);

  // Resolve Image Logic
  const homeImage = creator.admin_metadata?.home_image || creator.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7";
  const homeImagePos = creator.admin_metadata?.home_image_pos || 'center center';

  return (
    <motion.div
      style={{ y: yOffset }}
      initial={{ opacity: 0, rotateY: -10, z: -50 }} // Less dramatic initial state for speed perception
      whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6, // Faster entrance
        delay: index * 0.05, // Tighter stagger
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{
        scale: 1.02, // Subtler hover
        y: -5,
        transition: { duration: 0.2 },
      }}
      onClick={() => navigate(`/creator/${creator.slug}`)}
    >
      <Card className="glass-premium border-white/10 overflow-hidden group cursor-pointer h-full hover:border-accent/50 transition-colors duration-300">
        <div className="relative h-96 overflow-hidden bg-black/50">
          <motion.img
            src={homeImage}
            alt={creator.name}
            className="w-full h-full object-cover"
            style={{ objectPosition: homeImagePos }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Badge */}
          <motion.div
            className="absolute top-4 right-4 px-3 py-1 glass-premium rounded-full text-xs font-medium text-white border border-white/20 shadow-lg"
          >
            {creator.category}
          </motion.div>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{creator.name}</h3>

          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
            {/* Use total_followers or detailed logic */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-accent">{creator.total_followers || '0'}</span>
              seguidores
            </div>
            {creator.engagement_rate && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-accent">{creator.engagement_rate}</span>
                engajamento
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {creator.instagram_active && <PlatformIcon icon={Instagram} color="text-pink-400" />}
            {creator.youtube_active && <PlatformIcon icon={Youtube} color="text-red-400" />}
            {creator.tiktok_active && <PlatformIcon icon={Music} color="text-cyan-400" />}
            {creator.twitter_active && <PlatformIcon icon={Twitter} color="text-blue-400" />}
            {creator.kwai_active && <PlatformIcon icon={() => (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-400">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            )} color="text-orange-400" />}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

const PlatformIcon = ({ icon: Icon, color }: { icon: any, color: string }) => (
  <div className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
    <Icon className={`w-4 h-4 ${color}`} />
  </div>
);

export function CreatorsGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('approval_status', 'approved');

      if (error) throw error;

      if (data) {
        // Client-side filtering for 'featured' logic
        // We prioritize those explicitly marked as featured
        let featuredList = data.filter((c: any) => c.admin_metadata?.featured === true);

        // Fallback: If no featured creators, show top 6 by followers (parsed)
        // (Skipping parsing complexity here for speed, just taking 6 random if empty or stick to manual)
        if (featuredList.length === 0) {
          featuredList = data.slice(0, 6);
        }

        setCreators(featuredList as Creator[]);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-32 text-center text-white/50">Carregando...</div>;
  if (creators.length === 0) return null;

  return (
    <motion.section
      id="creators"
      ref={sectionRef}
      style={{ opacity }}
      className="relative py-24 sm:py-32 bg-black overflow-hidden"
    >
      <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-accent to-purple-400 bg-clip-text text-transparent">
              Nossos Criadores
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Seleção exclusiva de talentos verificados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {creators.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
