import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTableWrapper } from "./AdminTableWrapper";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export function PricingManager() {
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTiers = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from("pricing_tiers")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setTiers(data || []);
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

    useEffect(() => {
        fetchTiers();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await (supabase as any)
                .from("pricing_tiers")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Status atualizado",
                description: `Plano ${!currentStatus ? "ativado" : "desativado"} com sucesso`,
            });

            fetchTiers();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const deleteTier = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return;

        try {
            const { error } = await (supabase as any)
                .from("pricing_tiers")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Plano excluído",
                description: "O plano foi removido com sucesso",
            });

            fetchTiers();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const formatPrice = (min: number, max: number | null) => {
        const minFormatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(min / 100);

        if (!max) return `A partir de ${minFormatted}`;

        const maxFormatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(max / 100);

        return `${minFormatted} - ${maxFormatted}`;
    };

    if (loading) {
        return (
            <AdminTableWrapper title="Gerenciar Preços" description="Configure os planos de preços">
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            </AdminTableWrapper>
        );
    }

    return (
        <AdminTableWrapper
            title="Gerenciar Preços"
            description="Configure os planos de preços da plataforma"
            action={
                <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                </Button>
            }
        >
            {tiers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Nenhum plano cadastrado</p>
                    <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Plano
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiers.map((tier) => (
                            <TableRow key={tier.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{tier.name}</div>
                                        <div className="text-sm text-muted-foreground">{tier.description}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{formatPrice(tier.price_min, tier.price_max)}</TableCell>
                                <TableCell className="capitalize">{tier.billing_period}</TableCell>
                                <TableCell>
                                    <Badge variant={tier.is_active ? "default" : "secondary"}>
                                        {tier.is_active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleActive(tier.id, tier.is_active)}
                                        >
                                            {tier.is_active ? (
                                                <ToggleRight className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                                            )}
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteTier(tier.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </AdminTableWrapper>
    );
}
