import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    FinancialAccount,
    FinancialTransaction,
    TransactionCategory,
    TransactionFilters,
    FinancialSummary,
    CreateAccountInput,
    CreateTransactionInput,
    CreateTransferInput,
    DbFinancialAccountRow,
    DbFinancialTransactionRow,
    DbTransactionCategoryRow,
    TransactionType,
    TransactionStatus,
    PaymentMethod,
    AccountType,
    PixKeyType,
} from '@/types/financial';

// =====================================================
// MAPPERS: DB -> Frontend
// =====================================================

const mapDbToAccount = (row: DbFinancialAccountRow): FinancialAccount => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description,
    pixKey: row.pix_key,
    pixKeyType: row.pix_key_type as PixKeyType | null,
    bankName: row.bank_name,
    bankCode: row.bank_code,
    agency: row.agency,
    accountNumber: row.account_number,
    accountType: row.account_type as AccountType,
    color: row.color,
    icon: row.icon,
    initialBalance: Number(row.initial_balance),
    currentBalance: Number(row.current_balance),
    isActive: row.is_active,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

const mapDbToTransaction = (row: DbFinancialTransactionRow): FinancialTransaction => ({
    id: row.id,
    companyId: row.company_id,
    type: row.type as TransactionType,
    status: row.status as TransactionStatus,
    amount: Number(row.amount),
    sourceAccountId: row.source_account_id,
    destinationAccountId: row.destination_account_id,
    linkedTransactionId: row.linked_transaction_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
    notes: row.notes,
    beneficiaryName: row.beneficiary_name,
    beneficiaryPix: row.beneficiary_pix,
    beneficiaryDocument: row.beneficiary_document,
    paymentMethod: row.payment_method as PaymentMethod,
    referenceCode: row.reference_code,
    receiptUrl: row.receipt_url,
    strategyId: row.strategy_id,
    transactionDate: new Date(`${row.transaction_date}T12:00:00`),
    dueDate: row.due_date ? new Date(`${row.due_date}T12:00:00`) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

const mapDbToCategory = (row: DbTransactionCategoryRow): TransactionCategory => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description,
    type: row.type as 'inflow' | 'outflow' | 'both' | 'transfer',
    color: row.color,
    icon: row.icon,
    isSystem: row.is_system,
    displayOrder: row.display_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
});

// =====================================================
// HOOKS: ACCOUNTS
// =====================================================

export function useFinancialAccounts(companyId: string | null) {
    return useQuery({
        queryKey: ['financial-accounts', companyId],
        queryFn: async () => {
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('financial_accounts')
                .select('*')
                .eq('company_id', companyId)
                .order('is_default', { ascending: false })
                .order('name', { ascending: true });

            if (error) throw error;
            return (data as unknown as DbFinancialAccountRow[]).map(mapDbToAccount);
        },
        enabled: !!companyId,
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (account: CreateAccountInput) => {
            const { data, error } = await supabase
                .from('financial_accounts')
                .insert({
                    company_id: account.companyId,
                    name: account.name,
                    description: account.description,
                    pix_key: account.pixKey,
                    pix_key_type: account.pixKeyType,
                    bank_name: account.bankName,
                    bank_code: account.bankCode,
                    agency: account.agency,
                    account_number: account.accountNumber,
                    account_type: account.accountType,
                    color: account.color,
                    icon: account.icon,
                    initial_balance: account.initialBalance,
                    current_balance: account.initialBalance, // Começa igual ao inicial
                    is_active: account.isActive,
                    is_default: account.isDefault,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToAccount(data as unknown as DbFinancialAccountRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...account }: Partial<FinancialAccount> & { id: string; companyId: string }) => {
            const { data, error } = await supabase
                .from('financial_accounts')
                .update({
                    name: account.name,
                    description: account.description,
                    pix_key: account.pixKey,
                    pix_key_type: account.pixKeyType,
                    bank_name: account.bankName,
                    bank_code: account.bankCode,
                    agency: account.agency,
                    account_number: account.accountNumber,
                    account_type: account.accountType,
                    color: account.color,
                    icon: account.icon,
                    is_active: account.isActive,
                    is_default: account.isDefault,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToAccount(data as unknown as DbFinancialAccountRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const { error } = await supabase
                .from('financial_accounts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { companyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

// =====================================================
// HOOKS: TRANSACTIONS
// =====================================================

export function useFinancialTransactions(companyId: string | null, filters?: TransactionFilters) {
    return useQuery({
        queryKey: ['financial-transactions', companyId, filters],
        queryFn: async () => {
            if (!companyId) return [];

            let query = supabase
                .from('financial_transactions')
                .select('*')
                .eq('company_id', companyId);

            // Aplicar filtros
            if (filters) {
                // Filtro por conta (origem OU destino)
                if (filters.accountId) {
                    query = query.or(`source_account_id.eq.${filters.accountId},destination_account_id.eq.${filters.accountId}`);
                }

                // Filtros específicos por conta
                if (filters.sourceAccountId) {
                    query = query.eq('source_account_id', filters.sourceAccountId);
                }
                if (filters.destinationAccountId) {
                    query = query.eq('destination_account_id', filters.destinationAccountId);
                }

                // Tipo e status
                if (filters.type) {
                    query = query.eq('type', filters.type);
                }
                if (filters.status) {
                    query = query.eq('status', filters.status);
                }

                // Categoria e método
                if (filters.categoryId) {
                    query = query.eq('category_id', filters.categoryId);
                }
                if (filters.paymentMethod) {
                    query = query.eq('payment_method', filters.paymentMethod);
                }

                // Datas
                if (filters.dateFrom) {
                    query = query.gte('transaction_date', filters.dateFrom.toISOString().split('T')[0]);
                }
                if (filters.dateTo) {
                    query = query.lte('transaction_date', filters.dateTo.toISOString().split('T')[0]);
                }

                // Valores
                if (filters.amountMin !== undefined) {
                    query = query.gte('amount', filters.amountMin);
                }
                if (filters.amountMax !== undefined) {
                    query = query.lte('amount', filters.amountMax);
                }

                // Busca textual
                if (filters.searchTerm) {
                    query = query.or(`description.ilike.%${filters.searchTerm}%,beneficiary_name.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%`);
                }

                // Vinculação com estratégia
                if (filters.strategyId) {
                    query = query.eq('strategy_id', filters.strategyId);
                }
            }

            const { data, error } = await query.order('transaction_date', { ascending: false });

            if (error) throw error;
            return (data as unknown as DbFinancialTransactionRow[]).map(mapDbToTransaction);
        },
        enabled: !!companyId,
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: CreateTransactionInput) => {
            const { data, error } = await supabase
                .from('financial_transactions')
                .insert({
                    company_id: transaction.companyId,
                    type: transaction.type,
                    status: transaction.status,
                    amount: transaction.amount,
                    source_account_id: transaction.sourceAccountId,
                    destination_account_id: transaction.destinationAccountId,
                    category_id: transaction.categoryId,
                    category_name: transaction.categoryName,
                    description: transaction.description,
                    notes: transaction.notes,
                    beneficiary_name: transaction.beneficiaryName,
                    beneficiary_pix: transaction.beneficiaryPix,
                    beneficiary_document: transaction.beneficiaryDocument,
                    payment_method: transaction.paymentMethod,
                    reference_code: transaction.referenceCode,
                    receipt_url: transaction.receiptUrl,
                    strategy_id: transaction.strategyId,
                    transaction_date: transaction.transactionDate.toISOString().split('T')[0],
                    due_date: transaction.dueDate?.toISOString().split('T')[0] || null,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToTransaction(data as unknown as DbFinancialTransactionRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions', data.companyId] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

/**
 * Cria uma transferência entre contas (gera 2 transações vinculadas)
 */
export function useCreateTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transfer: CreateTransferInput) => {
            // 1. Criar transação de SAÍDA
            const { data: outflowData, error: outflowError } = await supabase
                .from('financial_transactions')
                .insert({
                    company_id: transfer.companyId,
                    type: 'transfer',
                    status: 'completed',
                    amount: transfer.amount,
                    source_account_id: transfer.sourceAccountId,
                    destination_account_id: null,
                    description: transfer.description,
                    notes: transfer.notes,
                    payment_method: 'transfer',
                    transaction_date: transfer.transactionDate.toISOString().split('T')[0],
                })
                .select()
                .single();

            if (outflowError) throw outflowError;

            // 2. Criar transação de ENTRADA vinculada
            const { data: inflowData, error: inflowError } = await supabase
                .from('financial_transactions')
                .insert({
                    company_id: transfer.companyId,
                    type: 'transfer',
                    status: 'completed',
                    amount: transfer.amount,
                    source_account_id: null,
                    destination_account_id: transfer.destinationAccountId,
                    linked_transaction_id: outflowData.id,
                    description: transfer.description,
                    notes: transfer.notes,
                    payment_method: 'transfer',
                    transaction_date: transfer.transactionDate.toISOString().split('T')[0],
                })
                .select()
                .single();

            if (inflowError) throw inflowError;

            // 3. Atualizar a primeira transação com o link
            await supabase
                .from('financial_transactions')
                .update({ linked_transaction_id: inflowData.id })
                .eq('id', outflowData.id);

            return {
                outflow: mapDbToTransaction(outflowData as unknown as DbFinancialTransactionRow),
                inflow: mapDbToTransaction(inflowData as unknown as DbFinancialTransactionRow),
            };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions', variables.companyId] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', variables.companyId] });
        },
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...transaction }: Partial<FinancialTransaction> & { id: string; companyId: string }) => {
            const { data, error } = await supabase
                .from('financial_transactions')
                .update({
                    type: transaction.type,
                    status: transaction.status,
                    amount: transaction.amount,
                    source_account_id: transaction.sourceAccountId,
                    destination_account_id: transaction.destinationAccountId,
                    category_id: transaction.categoryId,
                    category_name: transaction.categoryName,
                    description: transaction.description,
                    notes: transaction.notes,
                    beneficiary_name: transaction.beneficiaryName,
                    beneficiary_pix: transaction.beneficiaryPix,
                    beneficiary_document: transaction.beneficiaryDocument,
                    payment_method: transaction.paymentMethod,
                    reference_code: transaction.referenceCode,
                    receipt_url: transaction.receiptUrl,
                    strategy_id: transaction.strategyId,
                    transaction_date: transaction.transactionDate?.toISOString().split('T')[0],
                    due_date: transaction.dueDate?.toISOString().split('T')[0] || null,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapDbToTransaction(data as unknown as DbFinancialTransactionRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions', data.companyId] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
            const { error } = await supabase
                .from('financial_transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { companyId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions', data.companyId] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts', data.companyId] });
        },
    });
}

// =====================================================
// HOOKS: CATEGORIES
// =====================================================

export function useTransactionCategories(companyId: string | null) {
    return useQuery({
        queryKey: ['transaction-categories', companyId],
        queryFn: async () => {
            // Busca categorias globais (company_id IS NULL) + da empresa
            let query = supabase
                .from('transaction_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (companyId) {
                query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
            } else {
                query = query.is('company_id', null);
            }

            const { data, error } = await query;

            if (error) throw error;
            return (data as unknown as DbTransactionCategoryRow[]).map(mapDbToCategory);
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (category: Omit<TransactionCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data, error } = await supabase
                .from('transaction_categories')
                .insert({
                    company_id: category.companyId,
                    name: category.name,
                    description: category.description,
                    type: category.type,
                    color: category.color,
                    icon: category.icon,
                    is_system: false,
                    display_order: category.displayOrder,
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToCategory(data as unknown as DbTransactionCategoryRow);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['transaction-categories', data.companyId] });
        },
    });
}

// =====================================================
// HOOKS: SUMMARY / STATS
// =====================================================

export function useFinancialSummary(companyId: string | null): {
    data: FinancialSummary | undefined;
    isLoading: boolean;
} {
    const { data: accounts, isLoading: loadingAccounts } = useFinancialAccounts(companyId);
    const { data: transactions, isLoading: loadingTransactions } = useFinancialTransactions(companyId);

    if (loadingAccounts || loadingTransactions || !accounts || !transactions) {
        return { data: undefined, isLoading: true };
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');

    const totalInflow = completedTransactions
        .filter(t => t.type === 'inflow' || (t.type === 'transfer' && t.destinationAccountId))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = completedTransactions
        .filter(t => t.type === 'outflow' || (t.type === 'transfer' && t.sourceAccountId))
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

    const accountSummaries = accounts.map(account => {
        const accountTransactions = transactions.filter(
            t => t.sourceAccountId === account.id || t.destinationAccountId === account.id
        );

        const inflow = accountTransactions
            .filter(t => t.status === 'completed' && t.destinationAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const outflow = accountTransactions
            .filter(t => t.status === 'completed' && t.sourceAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const pendingIn = accountTransactions
            .filter(t => t.status === 'pending' && t.destinationAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const pendingOut = accountTransactions
            .filter(t => t.status === 'pending' && t.sourceAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            account,
            totalInflow: inflow,
            totalOutflow: outflow,
            pendingInflow: pendingIn,
            pendingOutflow: pendingOut,
        };
    });

    return {
        data: {
            totalBalance,
            totalInflow,
            totalOutflow,
            pendingTransactions: pendingTransactions.length,
            pendingAmount,
            accountSummaries,
        },
        isLoading: false,
    };
}
