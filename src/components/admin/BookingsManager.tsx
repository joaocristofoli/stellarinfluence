import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTableWrapper } from "./AdminTableWrapper";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, Mail } from "lucide-react";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Booking = {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    campaign_brief: string;
    budget_min: number | null;
    budget_range: string | null;
    budget_max: number | null;
    timeline_start: string | null;
    timeline_end: string | null;
    status: string;
    created_at: string;
};

export function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toast } = useToast();

    const fetchBookings = async () => {
        try {
            let query = (supabase as any).from("bookings").select("*").order("created_at", { ascending: false });

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar reservas",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await (supabase as any)
                .from("bookings")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Status atualizado",
                description: `Reserva marcada como ${getStatusLabel(newStatus)}`,
            });

            fetchBookings();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "Pendente",
            reviewing: "Em Análise",
            accepted: "Aceita",
            rejected: "Rejeitada",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, "default" | "secondary" | "destructive"> = {
            pending: "secondary",
            reviewing: "default",
            accepted: "default",
            rejected: "destructive",
        };
        return colors[status] || "default";
    };

    const formatBudget = (booking: Booking) => {
        if (booking.budget_range) return booking.budget_range;

        const min = booking.budget_min;
        const max = booking.budget_max;
        if (!min && !max) return "Não especificado";

        const minFormatted = min
            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(min / 100)
            : "";
        const maxFormatted = max
            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(max / 100)
            : "";

        if (min && max) return `${minFormatted} - ${maxFormatted}`;
        if (min) return `A partir de ${minFormatted}`;
        return `Até ${maxFormatted}`;
    };

    if (loading) {
        return (
            <AdminTableWrapper title="Gerenciar Reservas" description="Solicitações de colaboração">
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            </AdminTableWrapper>
        );
    }

    return (
        <AdminTableWrapper
            title="Solicitações de Colaboração"
            description="Gerencie todas as solicitações recebidas"
            action={
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="reviewing">Em Análise</SelectItem>
                        <SelectItem value="accepted">Aceita</SelectItem>
                        <SelectItem value="rejected">Rejeitada</SelectItem>
                    </SelectContent>
                </Select>
            }
        >
            {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-8 rounded-full mb-6 ring-1 ring-accent/20 shadow-[0_0_50px_-10px_hsla(var(--accent)/0.3)] backdrop-blur-sm">
                        <Mail className="w-16 h-16 text-accent" />
                    </div>
                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 mb-3 tracking-tight">
                        Caixa de Entrada Vazia
                    </h3>
                    <p className="max-w-md mb-8 text-lg text-muted-foreground font-light leading-relaxed">
                        Nenhuma solicitação de colaboração pendente.<br />
                        Tudo tranquilo por aqui.
                    </p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Orçamento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="font-medium">{booking.company_name}</div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="text-sm">{booking.contact_name}</div>
                                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatBudget(booking)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusColor(booking.status)}>
                                        {getStatusLabel(booking.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(booking.created_at).toLocaleDateString("pt-BR")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <TooltipProvider>
                                        <div className="flex items-center justify-end gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Ver detalhes</TooltipContent>
                                            </Tooltip>
                                            {booking.status === "pending" && (
                                                <>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => updateStatus(booking.id, "accepted")}
                                                            >
                                                                <Check className="w-4 h-4 text-green-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Aprovar</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => updateStatus(booking.id, "rejected")}
                                                            >
                                                                <X className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Rejeitar</TooltipContent>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <Mail className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Enviar e-mail</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </AdminTableWrapper>
    );
}
