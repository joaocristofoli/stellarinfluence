import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useFinancialAccounts,
    useFinancialTransactions,
    useTransactionCategories,
    useFinancialSummary,
    useCreateAccount,
    useCreateTransaction,
    useCreateTransfer,
    useDeleteTransaction,
} from '@/hooks/useFinancials';
import { formatCurrency } from '@/utils/formatters';
import { MarketingStrategy } from '@/types/marketing';
import {
    FinancialAccount,
    TransactionFilters,
    TransactionType,
    TransactionStatus,
    PaymentMethod,
} from '@/types/financial';
import {
    ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Download, Filter, Target,
    Building2, CreditCard, Search, ChevronDown, ArrowLeftRight, Trash2,
    Calendar, X, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialViewProps {
    strategies: MarketingStrategy[];
    estimatedTotalBudget: number;
    companyId: string;
}

export function FinancialView({ strategies, estimatedTotalBudget, companyId }: FinancialViewProps) {
    // State
    const [activeTab, setActiveTab] = useState('transactions');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [modalState, setModalState] = useState<{
        open: boolean;
        type: 'inflow' | 'outflow' | 'transfer' | 'account' | null;
    }>({ open: false, type: null });

    // Hooks
    const { data: accounts = [], isLoading: loadingAccounts } = useFinancialAccounts(companyId);
    const { data: transactions = [], isLoading: loadingTransactions } = useFinancialTransactions(companyId, filters);
    const { data: categories = [] } = useTransactionCategories(companyId);
    const { data: summary, isLoading: loadingSummary } = useFinancialSummary(companyId);

    const createAccountMutation = useCreateAccount();
    const createTransactionMutation = useCreateTransaction();
    const createTransferMutation = useCreateTransfer();
    const deleteTransactionMutation = useDeleteTransaction();

    // Filtered categories by type
    const inflowCategories = useMemo(() =>
        categories.filter(c => c.type === 'inflow' || c.type === 'both'),
        [categories]
    );
    const outflowCategories = useMemo(() =>
        categories.filter(c => c.type === 'outflow' || c.type === 'both'),
        [categories]
    );

    // Form states
    const [accountForm, setAccountForm] = useState({
        name: '',
        pixKey: '',
        bankName: '',
        initialBalance: 0,
        color: '#6366f1',
        icon: '🏦',
    });

    const [transactionForm, setTransactionForm] = useState({
        amount: 0,
        description: '',
        accountId: '',
        categoryId: '',
        beneficiaryName: '',
        beneficiaryPix: '',
        paymentMethod: 'pix' as PaymentMethod,
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
        strategyId: '',
        status: 'completed' as TransactionStatus,
    });

    const [transferForm, setTransferForm] = useState({
        amount: 0,
        sourceAccountId: '',
        destinationAccountId: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
    });

    // Handlers
    const handleCreateAccount = async () => {
        await createAccountMutation.mutateAsync({
            companyId,
            name: accountForm.name,
            pixKey: accountForm.pixKey || null,
            bankName: accountForm.bankName || null,
            color: accountForm.color,
            icon: accountForm.icon,
            initialBalance: accountForm.initialBalance,
            isActive: true,
            isDefault: accounts.length === 0,
            accountType: 'checking',
        });
        setModalState({ open: false, type: null });
        setAccountForm({ name: '', pixKey: '', bankName: '', initialBalance: 0, color: '#6366f1', icon: '🏦' });
    };

    const handleCreateTransaction = async (type: 'inflow' | 'outflow') => {
        await createTransactionMutation.mutateAsync({
            companyId,
            type,
            status: transactionForm.status,
            amount: transactionForm.amount,
            sourceAccountId: type === 'outflow' ? transactionForm.accountId : null,
            destinationAccountId: type === 'inflow' ? transactionForm.accountId : null,
            categoryId: transactionForm.categoryId || null,
            description: transactionForm.description,
            notes: transactionForm.notes || null,
            beneficiaryName: transactionForm.beneficiaryName || null,
            beneficiaryPix: transactionForm.beneficiaryPix || null,
            paymentMethod: transactionForm.paymentMethod,
            strategyId: transactionForm.strategyId || null,
            transactionDate: new Date(transactionForm.transactionDate),
        });
        setModalState({ open: false, type: null });
        resetTransactionForm();
    };

    const handleCreateTransfer = async () => {
        await createTransferMutation.mutateAsync({
            companyId,
            amount: transferForm.amount,
            sourceAccountId: transferForm.sourceAccountId,
            destinationAccountId: transferForm.destinationAccountId,
            description: transferForm.description || 'Transferência entre contas',
            transactionDate: new Date(transferForm.transactionDate),
        });
        setModalState({ open: false, type: null });
        setTransferForm({ amount: 0, sourceAccountId: '', destinationAccountId: '', description: '', transactionDate: new Date().toISOString().split('T')[0] });
    };

    const handleDeleteTransaction = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            await deleteTransactionMutation.mutateAsync({ id, companyId });
        }
    };

    const resetTransactionForm = () => {
        setTransactionForm({
            amount: 0,
            description: '',
            accountId: '',
            categoryId: '',
            beneficiaryName: '',
            beneficiaryPix: '',
            paymentMethod: 'pix',
            transactionDate: new Date().toISOString().split('T')[0],
            notes: '',
            strategyId: '',
        });
    };

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    // Loading state
    if (loadingAccounts || loadingSummary) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* === ACCOUNTS OVERVIEW === */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Contas</h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalState({ open: true, type: 'account' })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conta
                    </Button>
                </div>

                {accounts.length === 0 ? (
                    <Card className="p-8 text-center border-dashed">
                        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h4 className="font-semibold mb-2">Nenhuma conta cadastrada</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Crie sua primeira conta para começar a registrar transações.
                        </p>
                        <Button onClick={() => setModalState({ open: true, type: 'account' })}>
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Primeira Conta
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Total Balance Card */}
                        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-xl text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Saldo Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{formatCurrency(summary?.totalBalance || 0)}</div>
                                <p className="text-xs text-emerald-400 mt-1">
                                    {accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Individual Accounts */}
                        {accounts.map((account) => (
                            <Card
                                key={account.id}
                                className={cn(
                                    "relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                                    filters.accountId === account.id && "ring-2 ring-primary"
                                )}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    accountId: prev.accountId === account.id ? undefined : account.id
                                }))}
                            >
                                <div
                                    className="absolute top-0 left-0 w-1 h-full"
                                    style={{ backgroundColor: account.color }}
                                />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <span>{account.icon}</span>
                                        {account.name}
                                        {account.isDefault && (
                                            <Badge variant="secondary" className="text-[10px] ml-auto">Padrão</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        account.currentBalance >= 0 ? "text-foreground" : "text-red-600"
                                    )}>
                                        {formatCurrency(account.currentBalance)}
                                    </div>
                                    {account.pixKey && (
                                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                                            PIX: {account.pixKey}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* === QUICK STATS === */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                                Total Entradas
                            </div>
                            <div className="text-xl font-bold text-emerald-600">
                                {formatCurrency(summary.totalInflow)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <ArrowDownCircle className="w-4 h-4 text-red-500" />
                                Total Saídas
                            </div>
                            <div className="text-xl font-bold text-red-600">
                                {formatCurrency(summary.totalOutflow)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Target className="w-4 h-4 text-blue-500" />
                                Orçamento Estratégias
                            </div>
                            <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(estimatedTotalBudget)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                Pendentes
                            </div>
                            <div className="text-xl font-bold text-amber-600">
                                {summary.pendingTransactions} ({formatCurrency(summary.pendingAmount)})
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* === ACTION BUTTONS === */}
            <div className="flex flex-wrap gap-3">
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setModalState({ open: true, type: 'inflow' })}
                    disabled={accounts.length === 0}
                >
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Registrar Entrada
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => setModalState({ open: true, type: 'outflow' })}
                    disabled={accounts.length === 0}
                >
                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                    Registrar Saída
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setModalState({ open: true, type: 'transfer' })}
                    disabled={accounts.length < 2}
                >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Transferir entre Contas
                </Button>
            </div>

            {/* === FILTERS === */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Filtros</span>
                        {hasActiveFilters && (
                            <Badge variant="secondary">{Object.values(filters).filter(Boolean).length} ativos</Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="w-4 h-4 mr-1" />
                                Limpar
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t">
                                {/* Account Filter */}
                                <div>
                                    <Label className="text-xs">Conta</Label>
                                    <Select
                                        value={filters.accountId || '__all__'}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, accountId: value === '__all__' ? undefined : value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Todas</SelectItem>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.icon} {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <Label className="text-xs">Tipo</Label>
                                    <Select
                                        value={filters.type || '__all__'}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === '__all__' ? undefined : value as TransactionType }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Todos</SelectItem>
                                            <SelectItem value="inflow">Entradas</SelectItem>
                                            <SelectItem value="outflow">Saídas</SelectItem>
                                            <SelectItem value="transfer">Transferências</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <Label className="text-xs">Status</Label>
                                    <Select
                                        value={filters.status || '__all__'}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === '__all__' ? undefined : value as TransactionStatus }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Todos</SelectItem>
                                            <SelectItem value="completed">Completado</SelectItem>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <Label className="text-xs">Categoria</Label>
                                    <Select
                                        value={filters.categoryId || '__all__'}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, categoryId: value === '__all__' ? undefined : value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Todas</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date From */}
                                <div>
                                    <Label className="text-xs">Data Início</Label>
                                    <Input
                                        type="date"
                                        value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            dateFrom: e.target.value ? new Date(e.target.value) : undefined
                                        }))}
                                    />
                                </div>

                                {/* Date To */}
                                <div>
                                    <Label className="text-xs">Data Fim</Label>
                                    <Input
                                        type="date"
                                        value={filters.dateTo?.toISOString().split('T')[0] || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            dateTo: e.target.value ? new Date(e.target.value) : undefined
                                        }))}
                                    />
                                </div>

                                {/* Search */}
                                <div className="col-span-2">
                                    <Label className="text-xs">Buscar</Label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Descrição, beneficiário..."
                                            className="pl-9"
                                            value={filters.searchTerm || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined }))}
                                        />
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div>
                                    <Label className="text-xs">Valor Mínimo</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.amountMin || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            amountMin: e.target.value ? parseFloat(e.target.value) : undefined
                                        }))}
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs">Valor Máximo</Label>
                                    <Input
                                        type="number"
                                        placeholder="∞"
                                        value={filters.amountMax || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            amountMax: e.target.value ? parseFloat(e.target.value) : undefined
                                        }))}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* === TRANSACTIONS LIST === */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Conta</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingTransactions ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {hasActiveFilters ? 'Nenhuma transação encontrada com os filtros aplicados.' : 'Nenhuma transação registrada.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => {
                                const sourceAccount = accounts.find(a => a.id === t.sourceAccountId);
                                const destAccount = accounts.find(a => a.id === t.destinationAccountId);
                                const category = categories.find(c => c.id === t.categoryId);

                                return (
                                    <TableRow key={t.id} className="group hover:bg-muted/50">
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {format(t.transactionDate, 'dd/MM/yy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm">{t.description}</div>
                                            {t.beneficiaryPix && (
                                                <div className="text-[10px] text-muted-foreground/80 mt-0.5 font-mono bg-gray-100 px-1 py-0.5 rounded w-fit">
                                                    PIX: {t.beneficiaryPix}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {t.type === 'transfer' ? (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span style={{ color: sourceAccount?.color }}>{sourceAccount?.icon}</span>
                                                    <span>→</span>
                                                    <span style={{ color: destAccount?.color }}>{destAccount?.icon}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span style={{ color: (destAccount || sourceAccount)?.color }}>
                                                        {(destAccount || sourceAccount)?.icon}
                                                    </span>
                                                    <span className="truncate max-w-[100px]">
                                                        {(destAccount || sourceAccount)?.name}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal"
                                                style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                                            >
                                                {category?.icon} {category?.name || t.categoryName || 'Geral'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={t.status === 'completed' ? 'default' : t.status === 'cancelled' ? 'destructive' : 'outline'}
                                                className={cn(
                                                    t.status === 'completed' && "bg-green-100 text-green-700 hover:bg-green-100"
                                                )}
                                            >
                                                {t.status === 'completed' ? 'Realizado' : t.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-bold tabular-nums",
                                            t.type === 'inflow' ? "text-emerald-600" :
                                                t.type === 'outflow' ? "text-red-600" : "text-blue-600"
                                        )}>
                                            {t.type === 'inflow' ? '+' : t.type === 'outflow' ? '-' : '↔'}
                                            {formatCurrency(t.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteTransaction(t.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* === MODALS === */}

            {/* Create Account Modal */}
            <Dialog open={modalState.open && modalState.type === 'account'} onOpenChange={(open) => !open && setModalState({ open: false, type: null })}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nova Conta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nome da Conta *</Label>
                            <Input
                                placeholder="Ex: Conta Corrente Itaú"
                                value={accountForm.name}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Chave PIX</Label>
                            <Input
                                placeholder="CPF, CNPJ, email, telefone..."
                                value={accountForm.pixKey}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, pixKey: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Banco</Label>
                            <Input
                                placeholder="Ex: Itaú, Bradesco, Nubank..."
                                value={accountForm.bankName}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, bankName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Saldo Inicial</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={accountForm.initialBalance}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Cor</Label>
                                <Input
                                    type="color"
                                    value={accountForm.color}
                                    onChange={(e) => setAccountForm(prev => ({ ...prev, color: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Ícone</Label>
                                <Select
                                    value={accountForm.icon}
                                    onValueChange={(value) => setAccountForm(prev => ({ ...prev, icon: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="🏦">🏦 Banco</SelectItem>
                                        <SelectItem value="💳">💳 Cartão</SelectItem>
                                        <SelectItem value="💵">💵 Dinheiro</SelectItem>
                                        <SelectItem value="💰">💰 Cofre</SelectItem>
                                        <SelectItem value="📱">📱 Digital</SelectItem>
                                        <SelectItem value="🏪">🏪 Caixa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalState({ open: false, type: null })}>Cancelar</Button>
                        <Button onClick={handleCreateAccount} disabled={!accountForm.name || createAccountMutation.isPending}>
                            {createAccountMutation.isPending ? 'Criando...' : 'Criar Conta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Transaction Modal (Inflow/Outflow) */}
            <Dialog
                open={modalState.open && (modalState.type === 'inflow' || modalState.type === 'outflow')}
                onOpenChange={(open) => !open && setModalState({ open: false, type: null })}
            >
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {modalState.type === 'inflow' ? '💰 Nova Entrada' : '💸 Nova Saída'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Valor *</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={transactionForm.amount || ''}
                                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                            <div>
                                <Label>Data *</Label>
                                <Input
                                    type="date"
                                    value={transactionForm.transactionDate}
                                    onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <Label className="text-sm">Status:</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={transactionForm.status === 'completed' ? 'default' : 'outline'}
                                    className={transactionForm.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => setTransactionForm(prev => ({ ...prev, status: 'completed' }))}
                                >
                                    ✅ Completado
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={transactionForm.status === 'pending' ? 'default' : 'outline'}
                                    className={transactionForm.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                    onClick={() => setTransactionForm(prev => ({ ...prev, status: 'pending' }))}
                                >
                                    ⏳ Pendente
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>Descrição *</Label>
                            <Input
                                placeholder="Ex: Pagamento Influencer Maria"
                                value={transactionForm.description}
                                onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>{modalState.type === 'inflow' ? 'Conta de Destino' : 'Conta de Origem'} *</Label>
                            <Select
                                value={transactionForm.accountId}
                                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, accountId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.icon} {acc.name} ({formatCurrency(acc.currentBalance)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Categoria</Label>
                            <Select
                                value={transactionForm.categoryId}
                                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, categoryId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(modalState.type === 'inflow' ? inflowCategories : outflowCategories).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {modalState.type === 'outflow' && (
                            <>
                                <div>
                                    <Label>Nome do Beneficiário</Label>
                                    <Input
                                        placeholder="Quem recebeu o pagamento"
                                        value={transactionForm.beneficiaryName}
                                        onChange={(e) => setTransactionForm(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Chave PIX do Beneficiário</Label>
                                    <Input
                                        placeholder="Chave PIX utilizada"
                                        value={transactionForm.beneficiaryPix}
                                        onChange={(e) => setTransactionForm(prev => ({ ...prev, beneficiaryPix: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <Label>Método de Pagamento</Label>
                            <Select
                                value={transactionForm.paymentMethod}
                                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, paymentMethod: value as PaymentMethod }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="transfer">Transferência</SelectItem>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Vincular a Estratégia (Opcional)</Label>
                            <Select
                                value={transactionForm.strategyId || '__none__'}
                                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, strategyId: value === '__none__' ? '' : value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhuma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Nenhuma</SelectItem>
                                    {strategies.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Observações</Label>
                            <Input
                                placeholder="Notas adicionais..."
                                value={transactionForm.notes}
                                onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalState({ open: false, type: null })}>Cancelar</Button>
                        <Button
                            onClick={() => handleCreateTransaction(modalState.type as 'inflow' | 'outflow')}
                            disabled={!transactionForm.amount || !transactionForm.description || !transactionForm.accountId || createTransactionMutation.isPending}
                            className={modalState.type === 'inflow' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            variant={modalState.type === 'outflow' ? 'destructive' : 'default'}
                        >
                            {createTransactionMutation.isPending ? 'Salvando...' : modalState.type === 'inflow' ? 'Registrar Entrada' : 'Registrar Saída'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Transfer Modal */}
            <Dialog
                open={modalState.open && modalState.type === 'transfer'}
                onOpenChange={(open) => !open && setModalState({ open: false, type: null })}
            >
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>↔️ Transferência entre Contas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Valor *</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={transferForm.amount || ''}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        <div>
                            <Label>De (Conta de Origem) *</Label>
                            <Select
                                value={transferForm.sourceAccountId}
                                onValueChange={(value) => setTransferForm(prev => ({ ...prev, sourceAccountId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta de origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.id !== transferForm.destinationAccountId).map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.icon} {acc.name} ({formatCurrency(acc.currentBalance)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Para (Conta de Destino) *</Label>
                            <Select
                                value={transferForm.destinationAccountId}
                                onValueChange={(value) => setTransferForm(prev => ({ ...prev, destinationAccountId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta de destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.id !== transferForm.sourceAccountId).map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.icon} {acc.name} ({formatCurrency(acc.currentBalance)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Data</Label>
                            <Input
                                type="date"
                                value={transferForm.transactionDate}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>Descrição</Label>
                            <Input
                                placeholder="Ex: Transferência para caixa"
                                value={transferForm.description}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalState({ open: false, type: null })}>Cancelar</Button>
                        <Button
                            onClick={handleCreateTransfer}
                            disabled={
                                !transferForm.amount ||
                                !transferForm.sourceAccountId ||
                                !transferForm.destinationAccountId ||
                                createTransferMutation.isPending
                            }
                        >
                            {createTransferMutation.isPending ? 'Transferindo...' : 'Transferir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
