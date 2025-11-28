import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { creators } from "@/data/creators";
import { ArrowLeft, Instagram, Youtube, Music, TrendingUp, Eye, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function CreatorProfile() {
  const { id } = useParams();
  const creator = creators.find((c) => c.id === id);

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Criador não encontrado</h1>
          <Link to="/">
            <button className="px-6 py-3 bg-accent text-accent-foreground rounded-full">
              Voltar ao Início
            </button>
          </Link>
        </div>
      </div>
    );
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
                  src={creator.image}
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

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {creator.bio}
              </p>

              {/* Social Links */}
              <div className="flex gap-4 mb-12">
                {creator.platforms.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://instagram.com/${creator.platforms.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="font-medium">{creator.platforms.instagram}</span>
                  </motion.a>
                )}
                {creator.platforms.youtube && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://youtube.com/@${creator.platforms.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Youtube className="w-5 h-5" />
                    <span className="font-medium">YouTube</span>
                  </motion.a>
                )}
                {creator.platforms.tiktok && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://tiktok.com/@${creator.platforms.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-accent hover:text-accent-foreground smooth-transition"
                  >
                    <Music className="w-5 h-5" />
                    <span className="font-medium">TikTok</span>
                  </motion.a>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-black text-accent mb-2">
                    {creator.followers}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Seguidores</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-black text-accent mb-2">
                    {creator.engagement}
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
            Estatísticas <span className="text-gradient">Detalhadas</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <div className="text-4xl font-black mb-2">{creator.stats.totalReach}</div>
              <div className="text-muted-foreground">Alcance Total Mensal</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <div className="text-4xl font-black mb-2">{creator.stats.avgViews}</div>
              <div className="text-muted-foreground">Média de Views por Post</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <div className="text-4xl font-black mb-2">{creator.stats.campaigns}+</div>
              <div className="text-muted-foreground">Campanhas Realizadas</div>
            </motion.div>
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
