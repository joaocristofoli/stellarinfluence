import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Music } from "lucide-react";

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

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

export function CreatorCard({ creator, index }: CreatorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Link to={`/creator/${creator.slug}`}>
        <div className="glass rounded-3xl overflow-hidden smooth-transition hover:shadow-[0_20px_60px_-15px_rgba(255,107,53,0.3)]">
          {/* Image */}
          <div className="relative h-80 overflow-hidden">
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
              src={creator.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            
            {/* Social Icons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {creator.instagram_active && (
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
              )}
              {creator.youtube_active && (
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
              )}
              {creator.tiktok_active && (
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-2xl font-bold mb-1">{creator.name}</h3>
              <p className="text-accent font-medium">{creator.category}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-muted-foreground">Seguidores</div>
                <div className="font-bold text-lg">{creator.total_followers}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Engajamento</div>
                <div className="font-bold text-lg text-accent">{creator.engagement_rate}</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
