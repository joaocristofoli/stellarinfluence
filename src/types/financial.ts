// =====================================================
// FINANCIAL TYPES - Multi-conta por empresa
// =====================================================

export type TransactionType = 'inflow' | 'outflow' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
export type AccountType = 'checking' | 'savings' | 'cash' | 'digital';
export type PaymentMethod = 'pix' | 'transfer' | 'credit_card' | 'debit_card' | 'cash' | 'boleto';

/**
 * Conta financeira (bancária ou caixa)
 */
export interface FinancialAccount {
    id: string;
    companyId: string;

    // Identificação
    name: string;
    description?: string | null;

    // Dados bancários
    pixKey?: string | null;
    pixKeyType?: PixKeyType | null;
    bankName?: string | null;
    bankCode?: string | null;
    agency?: string | null;
    accountNumber?: string | null;
    accountType: AccountType;

    // Visual
    color: string;
    icon: string;

    // Saldo
    initialBalance: number;
    currentBalance: number;

    // Status
    isActive: boolean;
    isDefault: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Categoria de transação
 */
export interface TransactionCategory {
    id: string;
    companyId?: string | null; // null = global

    name: string;
    description?: string | null;
    type: 'inflow' | 'outflow' | 'both' | 'transfer';
    color: string;
    icon: string;

    isSystem: boolean;
    displayOrder: number;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Transação financeira
 */
export interface FinancialTransaction {
    id: string;
    companyId: string;

    // Tipo e status
    type: TransactionType;
    status: TransactionStatus;

    // Valor
    amount: number;

    // Contas
    sourceAccountId?: string | null;       // De onde saiu (outflow/transfer)
    destinationAccountId?: string | null;   // Para onde foi (inflow/transfer)

    // Para transferências vinculadas
    linkedTransactionId?: string | null;

    // Categoria
    categoryId?: string | null;
    categoryName?: string | null;           // Fallback

    // Detalhes
    description: string;
    notes?: string | null;

    // Beneficiário/Pagador
    beneficiaryName?: string | null;
    beneficiaryPix?: string | null;
    beneficiaryDocument?: string | null;    // CPF/CNPJ

    // Pagamento
    paymentMethod: PaymentMethod;

    // Referência
    referenceCode?: string | null;
    receiptUrl?: string | null;

    // Vinculação
    strategyId?: string | null;

    // Datas
    transactionDate: Date;
    dueDate?: Date | null;
    completedAt?: Date | null;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Filtros para busca de transações
 */
export interface TransactionFilters {
    accountId?: string;              // Filtrar por conta (origem OU destino)
    sourceAccountId?: string;        // Filtrar por conta origem específica
    destinationAccountId?: string;   // Filtrar por conta destino específica
    type?: TransactionType;
    status?: TransactionStatus;
    categoryId?: string;
    paymentMethod?: PaymentMethod;
    dateFrom?: Date;
    dateTo?: Date;
    amountMin?: number;
    amountMax?: number;
    searchTerm?: string;             // Busca em description, beneficiary, notes
    strategyId?: string;
}

/**
 * Resumo financeiro de uma conta
 */
export interface AccountSummary {
    account: FinancialAccount;
    totalInflow: number;
    totalOutflow: number;
    pendingInflow: number;
    pendingOutflow: number;
}

/**
 * Resumo financeiro geral da empresa
 */
export interface FinancialSummary {
    totalBalance: number;            // Soma de todas as contas
    totalInflow: number;             // Todas as entradas
    totalOutflow: number;            // Todas as saídas
    pendingTransactions: number;     // Quantidade pendente
    pendingAmount: number;           // Valor pendente
    accountSummaries: AccountSummary[];
}

/**
 * Tipo para criação de nova conta
 */
export type CreateAccountInput = Omit<FinancialAccount,
    'id' | 'currentBalance' | 'createdAt' | 'updatedAt'
>;

/**
 * Tipo para criação de nova transação
 */
export type CreateTransactionInput = Omit<FinancialTransaction,
    'id' | 'linkedTransactionId' | 'completedAt' | 'createdAt' | 'updatedAt'
>;

/**
 * Tipo para criação de transferência entre contas
 */
export interface CreateTransferInput {
    companyId: string;
    amount: number;
    sourceAccountId: string;
    destinationAccountId: string;
    description: string;
    notes?: string;
    transactionDate: Date;
}

/**
 * Formato de row do banco (snake_case)
 */
export interface DbFinancialAccountRow {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    pix_key: string | null;
    pix_key_type: string | null;
    bank_name: string | null;
    bank_code: string | null;
    agency: string | null;
    account_number: string | null;
    account_type: string;
    color: string;
    icon: string;
    initial_balance: number | string;
    current_balance: number | string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbTransactionCategoryRow {
    id: string;
    company_id: string | null;
    name: string;
    description: string | null;
    type: string;
    color: string;
    icon: string;
    is_system: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface DbFinancialTransactionRow {
    id: string;
    company_id: string;
    type: string;
    status: string;
    amount: number | string;
    source_account_id: string | null;
    destination_account_id: string | null;
    linked_transaction_id: string | null;
    category_id: string | null;
    category_name: string | null;
    description: string;
    notes: string | null;
    beneficiary_name: string | null;
    beneficiary_pix: string | null;
    beneficiary_document: string | null;
    payment_method: string;
    reference_code: string | null;
    receipt_url: string | null;
    strategy_id: string | null;
    transaction_date: string;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}
