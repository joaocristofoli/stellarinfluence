import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinancials } from '@/hooks/useFinancials';
import { TransactionModal } from './TransactionModal';
import { formatCurrency } from '@/utils/formatters';
import { MarketingStrategy, MarketingTransaction, TransactionType } from '@/types/marketing';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Download, Filter, Target, Edit2, Puzzle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FinancialViewProps {
    strategies: MarketingStrategy[];
    estimatedTotalBudget: number;
}

export function FinancialView({ strategies, estimatedTotalBudget }: FinancialViewProps) {
    const { transactions, stats, addTransaction, removeTransaction, settings, setMonthlyBudget } = useFinancials();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<TransactionType>('inflow');

    const handleOpenModal = (type: TransactionType) => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleAddTransaction = (data: any) => {
        addTransaction(data);
    };

    const handleDelete = (id: string) => {
        const password = prompt("Digite a senha de administrador para excluir:");
        if (password === 'admin123') {
            removeTransaction(id);
        } else if (password !== null) {
            alert("Senha incorreta!");
        }
    };

    // Calculate "Budget Gap" (Estimated vs Real Balance)
    // Actually, "Estimated Budget" is what we PLAN to spend.
    // "Balance" is what we HAVE.
    // Gap = Estimated - Balance (meaning we need more money).
    const budgetGap = Math.max(0, estimatedTotalBudget - stats.balance);
    // Or maybe "Estimated Remaining" = Estimated - Spent.
    const estimatedRemaining = estimatedTotalBudget - stats.totalOutflow;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Stats */}
            <div className="space-y-4">
                {/* Top Row: High Level - Agreed | Inflow | Balance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* AGREED BUDGET (Editable) */}
                    <Card
                        className="bg-blue-50/50 border-blue-100 hover:border-blue-300 transition-colors cursor-pointer group relative overflow-hidden"
                        onClick={() => {
                            const newValue = prompt("Definir Orçamento Acordado (R$):", settings.monthlyBudget.toString());
                            if (newValue && !isNaN(parseFloat(newValue))) {
                                setMonthlyBudget(parseFloat(newValue));
                            }
                        }}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-600" /> Orçamento Acordado</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900">{formatCurrency(settings.monthlyBudget)}</div>
                            <p className="text-xs text-blue-600/80 mt-1">Meta definida com cliente</p>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
                        </CardContent>
                    </Card>

                    {/* INFLOW */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> Total Recebido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalInflow)}</div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-muted-foreground">Aportes Confirmados</p>
                                {settings.monthlyBudget > 0 && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                                        {Math.round((stats.totalInflow / settings.monthlyBudget) * 100)}% da Meta
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* BALANCE */}
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-xl text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Saldo em Caixa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatCurrency(stats.balance)}</div>
                            <p className="text-xs text-emerald-400 mt-1">Disponível para uso</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row: Operational - Allocated | Spent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ALLOCATED (Strategies) */}
                    <Card className="border-dashed border-gray-300 bg-gray-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Puzzle className="w-4 h-4" /> Alocado em Estratégias
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-700">{formatCurrency(estimatedTotalBudget)}</div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-muted-foreground">Soma dos orçamentos de cards</p>
                                {settings.monthlyBudget > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${estimatedTotalBudget > settings.monthlyBudget ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {Math.round((estimatedTotalBudget / settings.monthlyBudget) * 100)}% do Acordado
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* OUTFLOW */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <ArrowDownCircle className="w-4 h-4 text-red-500" /> Total Gasto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutflow)}</div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-muted-foreground">Pagamentos Efetuados</p>
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                    {Math.round((stats.totalOutflow / (estimatedTotalBudget || 1)) * 100)}% do Alocado
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Transaction List (Left 2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">Extrato Financeiro</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <Filter className="w-4 h-4 mr-2" /> Filtrar
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> Exportar
                            </Button>
                        </div>
                    </div>

                    <Card className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Nenhuma transação registrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((t) => (
                                            <TableRow key={t.id} className="group hover:bg-muted/50">
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(t.date), "dd/MM/yy")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-sm">{t.description}</div>
                                                    {t.strategyId && (
                                                        <span className="text-[10px] text-blue-500 flex items-center gap-1">
                                                            ⚡ Vinculado a Estratégia
                                                        </span>
                                                    )}
                                                    {t.pixKey && t.type === 'outflow' && (
                                                        <div className="text-[10px] text-muted-foreground/80 mt-0.5 font-mono bg-gray-100 px-1 py-0.5 rounded w-fit">
                                                            PIX: {t.pixKey}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-[10px] font-normal">{t.category || 'Geral'}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={t.status === 'completed' ? 'default' : 'outline'} className={
                                                        t.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
                                                    }>
                                                        {t.status === 'completed' ? 'Realizado' : 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-bold tabular-nums",
                                                    t.type === 'inflow' ? "text-emerald-600" : "text-red-600"
                                                )}>
                                                    {t.type === 'inflow' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(t.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Actions Panel (Right 1/3) */}
                <div className="space-y-4">
                    <Card className="bg-gradient-to-b from-card to-secondary/20 border shadow-sm p-6 space-y-6">
                        <div>
                            <h4 className="font-bold text-lg mb-1">Ações Rápidas</h4>
                            <p className="text-sm text-muted-foreground">Gerencie o fluxo de caixa do projeto.</p>
                        </div>

                        <div className="grid gap-3">
                            <Button
                                size="lg"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 shadow-lg transition-all hover:scale-[1.02]"
                                onClick={() => handleOpenModal('inflow')}
                            >
                                <ArrowUpCircle className="w-5 h-5 mr-3" />
                                Registrar Entrada
                            </Button>

                            <Button
                                size="lg"
                                variant="destructive"
                                className="w-full shadow-red-900/20 shadow-lg transition-all hover:scale-[1.02]"
                                onClick={() => handleOpenModal('outflow')}
                            >
                                <ArrowDownCircle className="w-5 h-5 mr-3" />
                                Registrar Pagamento
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Dica Financeira</h5>
                            <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                Sempre mantenha os comprovantes de Pix salvos. Você pode vincular um pagamento diretamente a uma estratégia para abater do saldo individual dela.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <TransactionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={handleAddTransaction}
                initialType={modalType}
                strategies={strategies}
            />
        </div>
    );
}
