import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsSection } from "@/components/StatsSection";
import { CreatorsGrid } from "@/components/CreatorsGrid";
import { BookingForm } from "@/components/BookingForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TechBackground } from "@/components/ui/TechBackground";
import { LuxuryOverlay } from "@/components/ui/LuxuryOverlay";
import { SkipLink } from "@/components/ui/SkipLink";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <SkipLink href="#main-content" />
      <LuxuryOverlay />
      <TechBackground overlay />
      <Navbar />
      <main id="main-content">
        <Hero />
        <StatsSection />
        <CreatorsGrid />

        {/* Pricing CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-background to-accent/5">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Planos para Todas as <span className="text-gradient">Necessidades</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Escolha o plano ideal para sua marca  e comece a criar campanhas incríveis com nossos influenciadores
              </p>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white"
                onClick={() => navigate("/pricing")}
              >
                Ver Planos & Preços
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section id="booking-form" className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Vamos Trabalhar <span className="text-gradient">Juntos?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Preencha o formulário abaixo e nossa equipe entrará em contato para discutir sua próxima campanha
              </p>
            </motion.div>
            <BookingForm />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
