import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PricingTier = {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_min: number;
    price_max: number | null;
    billing_period: string;
    features: string[];
    is_active: boolean;
    display_order: number;
};

export default function Pricing() {
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // Temporarily disabled until database migrations are applied
        // fetchPricingTiers();
        setLoading(false);
    }, []);

    const fetchPricingTiers = async () => {
        try {
            // Using any to bypass type checking since pricing_tiers table is new
            const { data, error } = await (supabase as any)
                .from("pricing_tiers")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            setTiers((data || []) as PricingTier[]);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar preços",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (min: number, max: number | null) => {
        const minFormatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
        }).format(min / 100);

        if (!max) {
            return `A partir de ${minFormatted}`;
        }

        const maxFormatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
        }).format(max / 100);

        return `${minFormatted} - ${maxFormatted}`;
    };

    const getBillingText = (period: string) => {
        switch (period) {
            case "monthly":
                return "por mês";
            case "per_campaign":
                return "por campanha";
            default:
                return "personalizado";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            <span className="text-gradient">Planos & Preços</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            Escolha o plano perfeito para sua marca e comece a criar campanhas incríveis com nossos influenciadores
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {loading ? (
                            // Loading skeletons
                            [...Array(3)].map((_, i) => (
                                <Card key={i} className="glass animate-pulse">
                                    <CardHeader className="space-y-4">
                                        <div className="h-6 bg-muted rounded w-1/2" />
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="h-8 bg-muted rounded w-2/3" />
                                        {[...Array(5)].map((_, j) => (
                                            <div key={j} className="h-4 bg-muted rounded" />
                                        ))}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            tiers.map((tier, index) => {
                                const isPopular = tier.slug === "professional";

                                return (
                                    <motion.div
                                        key={tier.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="relative"
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                                <div className="glass px-4 py-2 rounded-full border border-accent/50 bg-accent/10 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-accent" />
                                                    <span className="text-sm font-semibold text-accent">Mais Popular</span>
                                                </div>
                                            </div>
                                        )}

                                        <Card
                                            className={`glass h-full flex flex-col ${isPopular
                                                ? "border-accent/50 shadow-[0_0_30px_rgba(var(--accent)/0.3)]"
                                                : "border-border/50"
                                                } hover:border-accent/50 transition-all duration-300`}
                                        >
                                            <CardHeader>
                                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                                <CardDescription className="text-muted-foreground mt-2">
                                                    {tier.description}
                                                </CardDescription>
                                                <div className="mt-4">
                                                    <div className="text-3xl md:text-4xl font-bold text-gradient">
                                                        {formatPrice(tier.price_min, tier.price_max)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {getBillingText(tier.billing_period)}
                                                    </p>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="flex-1 flex flex-col">
                                                <ul className="space-y-3 mb-8 flex-1">
                                                    {tier.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <Button
                                                    className={
                                                        isPopular
                                                            ? "w-full bg-accent hover:bg-accent/90 text-white"
                                                            : "w-full"
                                                    }
                                                    variant={isPopular ? "default" : "outline"}
                                                    onClick={() => {
                                                        // Scroll to booking form (we'll add this later)
                                                        const bookingSection = document.getElementById("booking-form");
                                                        bookingSection?.scrollIntoView({ behavior: "smooth" });
                                                    }}
                                                >
                                                    {tier.slug === "enterprise" ? "Falar com Vendas" : "Começar Agora"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-gradient-to-b from-background to-accent/5">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Pronto para começar?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Entre em contato conosco e descubra como podemos levar sua marca ao próximo nível
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                                Solicitar Orçamento
                            </Button>
                            <Button size="lg" variant="outline">
                                Ver Cases de Sucesso
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
