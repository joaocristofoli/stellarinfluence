import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export function BookingForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        company_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        campaign_brief: "",
        budget_range: "",
        preferred_timeline: "",
        target_audience: "",
        campaign_goals: "",
        preferred_platforms: [] as string[],
    });

    const budgetRanges = [
        "R$ 500 - R$ 1.500",
        "R$ 1.500 - R$ 5.000",
        "R$ 5.000 - R$ 10.000",
        "R$ 10.000 - R$ 20.000",
        "R$ 20.000 - R$ 50.000",
        "R$ 50.000+",
    ];

    const platforms = [
        { id: "instagram", label: "Instagram" },
        { id: "youtube", label: "YouTube" },
        { id: "tiktok", label: "TikTok" },
        { id: "twitter", label: "Twitter/X" },
    ];

    const togglePlatform = (platformId: string) => {
        setFormData(prev => ({
            ...prev,
            preferred_platforms: prev.preferred_platforms.includes(platformId)
                ? prev.preferred_platforms.filter(p => p !== platformId)
                : [...prev.preferred_platforms, platformId],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await (supabase as any).from("bookings").insert([
                {
                    company_name: formData.company_name,
                    contact_name: formData.contact_name,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone || null,
                    campaign_brief: formData.campaign_brief,
                    budget_range: formData.budget_range,
                    preferred_timeline: formData.preferred_timeline || null,
                    target_audience: formData.target_audience || null,
                    campaign_goals: formData.campaign_goals || null,
                    preferred_platforms: formData.preferred_platforms,
                    status: "pending",
                },
            ]);

            if (error) throw error;

            setSubmitted(true);
            toast({
                title: "Solicitação enviada!",
                description: "Entraremos em contato em breve.",
            });

            // Reset form
            setFormData({
                company_name: "",
                contact_name: "",
                contact_email: "",
                contact_phone: "",
                campaign_brief: "",
                budget_range: "",
                preferred_timeline: "",
                target_audience: "",
                campaign_goals: "",
                preferred_platforms: [],
            });
        } catch (error: any) {
            toast({
                title: "Erro ao enviar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Solicitação Recebida!</h3>
                <p className="text-muted-foreground mb-6">
                    Nossa equipe irá analisar sua solicitação e entrar em contato em breve.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                    Enviar Nova Solicitação
                </Button>
            </motion.div>
        );
    }

    return (
        <Card className="glass border-border/50">
            <CardHeader>
                <CardTitle className="text-2xl">Solicite uma Colaboração</CardTitle>
                <CardDescription>
                    Preencha o formulário abaixo e nossa equipe entrará em contato para discutir sua campanha
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Informações da Empresa</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Nome da Empresa *</Label>
                                <Input
                                    id="company_name"
                                    required
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Sua Empresa Ltda"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_name">Nome do Contato *</Label>
                                <Input
                                    id="contact_name"
                                    required
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="João Silva"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Email *</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    required
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    placeholder="contato@empresa.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Telefone</Label>
                                <Input
                                    id="contact_phone"
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="space-y-4 border-t border-border pt-6">
                        <h3 className="font-semibold text-lg">Detalhes da Campanha</h3>

                        <div className="space-y-2">
                            <Label htmlFor="campaign_brief">Briefing da Campanha *</Label>
                            <Textarea
                                id="campaign_brief"
                                required
                                rows={4}
                                value={formData.campaign_brief}
                                onChange={(e) => setFormData({ ...formData, campaign_brief: e.target.value })}
                                placeholder="Descreva sua campanha, objetivos, público-alvo, mensagem principal..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget_range">Orçamento *</Label>
                                <Select
                                    value={formData.budget_range}
                                    onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a faixa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {budgetRanges.map((range) => (
                                            <SelectItem key={range} value={range}>
                                                {range}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preferred_timeline">Prazo Desejado</Label>
                                <Input
                                    id="preferred_timeline"
                                    value={formData.preferred_timeline}
                                    onChange={(e) => setFormData({ ...formData, preferred_timeline: e.target.value })}
                                    placeholder="Ex: 2 semanas, 1 mês"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target_audience">Público-Alvo</Label>
                            <Input
                                id="target_audience"
                                value={formData.target_audience}
                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                placeholder="Ex: Mulheres 25-35 anos, interessadas em fitness"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaign_goals">Objetivos da Campanha</Label>
                            <Textarea
                                id="campaign_goals"
                                rows={3}
                                value={formData.campaign_goals}
                                onChange={(e) => setFormData({ ...formData, campaign_goals: e.target.value })}
                                placeholder="Ex: Aumentar awareness, gerar vendas, engajamento..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Plataformas Preferidas</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {platforms.map((platform) => (
                                    <div key={platform.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={platform.id}
                                            checked={formData.preferred_platforms.includes(platform.id)}
                                            onCheckedChange={() => togglePlatform(platform.id)}
                                        />
                                        <Label
                                            htmlFor={platform.id}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {platform.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-white"
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                Enviar Solicitação
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
