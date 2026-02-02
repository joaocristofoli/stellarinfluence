-- =====================================================
-- FINANCIAL ACCOUNTS SYSTEM
-- Multi-conta por empresa com tracking de origem/destino
-- Created: 2026-02-02
-- =====================================================

-- =====================================================
-- ENUM: Tipo de transação
-- =====================================================
DO $$ BEGIN
    CREATE TYPE public.transaction_type AS ENUM ('inflow', 'outflow', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- ENUM: Status da transação
-- =====================================================
DO $$ BEGIN
    CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLE: financial_accounts (Contas por empresa)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Identificação
    name TEXT NOT NULL,                    -- "Conta Corrente Itaú", "Caixa", "PayPal"
    description TEXT,
    
    -- Identificadores bancários
    pix_key TEXT,                          -- Chave PIX principal (CPF, CNPJ, email, telefone, aleatória)
    pix_key_type TEXT,                     -- 'cpf', 'cnpj', 'email', 'phone', 'random'
    bank_name TEXT,                        -- Nome do banco
    bank_code TEXT,                        -- Código do banco (001, 341, etc)
    agency TEXT,                           -- Agência
    account_number TEXT,                   -- Número da conta
    account_type TEXT DEFAULT 'checking',  -- 'checking', 'savings', 'cash', 'digital'
    
    -- Visual
    color TEXT DEFAULT '#6366f1',          -- Cor para identificação visual
    icon TEXT DEFAULT '🏦',                -- Emoji/ícone
    
    -- Saldo
    initial_balance DECIMAL(15,2) DEFAULT 0,  -- Saldo inicial quando conta foi criada
    current_balance DECIMAL(15,2) DEFAULT 0,  -- Saldo atual (calculado via trigger)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,      -- Conta padrão para novos lançamentos
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_financial_accounts_company ON public.financial_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_pix ON public.financial_accounts(pix_key);

-- =====================================================
-- TABLE: transaction_categories (Categorias customizáveis)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,  -- NULL = categoria global
    
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'both',     -- 'inflow', 'outflow', 'both', 'transfer'
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT '📁',
    
    is_system BOOLEAN DEFAULT false,       -- Categorias padrão do sistema
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: financial_transactions (Movimentações)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Tipo e status
    type public.transaction_type NOT NULL,
    status public.transaction_status NOT NULL DEFAULT 'completed',
    
    -- Valor
    amount DECIMAL(15,2) NOT NULL,
    
    -- Contas envolvidas
    source_account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,  -- De onde saiu
    destination_account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,  -- Para onde foi
    
    -- Para transferências, vincula as duas transações
    linked_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
    
    -- Categoria
    category_id UUID REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    category_name TEXT,                    -- Fallback se categoria for deletada
    
    -- Detalhes
    description TEXT NOT NULL,
    notes TEXT,
    
    -- Identificação do beneficiário/pagador
    beneficiary_name TEXT,                 -- Nome de quem recebeu/pagou
    beneficiary_pix TEXT,                  -- Chave PIX do beneficiário
    beneficiary_document TEXT,             -- CPF/CNPJ
    
    -- Método de pagamento
    payment_method TEXT DEFAULT 'pix',     -- 'pix', 'transfer', 'credit_card', 'debit_card', 'cash', 'boleto'
    
    -- Referência
    reference_code TEXT,                   -- Código de referência externo
    receipt_url TEXT,                      -- URL do comprovante
    
    -- Vinculação com estratégia (opcional)
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    
    -- Datas
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,                         -- Data de vencimento (para pendentes)
    completed_at TIMESTAMPTZ,              -- Quando foi efetivada
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_company ON public.financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.financial_transactions(source_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_destination ON public.financial_transactions(destination_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_strategy ON public.financial_transactions(strategy_id);

-- =====================================================
-- TRIGGER: Atualizar saldo da conta após transação
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma nova transação COMPLETADA
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        -- Debita da conta origem (se houver)
        IF NEW.source_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.source_account_id;
        END IF;
        
        -- Credita na conta destino (se houver)
        IF NEW.destination_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.destination_account_id;
        END IF;
    END IF;
    
    -- Se status mudou para COMPLETED
    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        IF NEW.source_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.source_account_id;
        END IF;
        
        IF NEW.destination_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.destination_account_id;
        END IF;
    END IF;
    
    -- Se status mudou DE COMPLETED para outro (estorno)
    IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
        IF NEW.source_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.source_account_id;
        END IF;
        
        IF NEW.destination_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.destination_account_id;
        END IF;
    END IF;
    
    -- Se transação foi deletada e estava completada
    IF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
        IF OLD.source_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance + OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.source_account_id;
        END IF;
        
        IF OLD.destination_account_id IS NOT NULL THEN
            UPDATE public.financial_accounts 
            SET current_balance = current_balance - OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.destination_account_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_account_balance ON public.financial_transactions;
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_account_balance();

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================
DROP TRIGGER IF EXISTS set_updated_at_financial_accounts ON public.financial_accounts;
CREATE TRIGGER set_updated_at_financial_accounts
    BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_financial_transactions ON public.financial_transactions;
CREATE TRIGGER set_updated_at_financial_transactions
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_transaction_categories ON public.transaction_categories;
CREATE TRIGGER set_updated_at_transaction_categories
    BEFORE UPDATE ON public.transaction_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- RLS: Row Level Security
-- =====================================================
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

-- Accounts: Mesma política de companies (aberta por enquanto)
DROP POLICY IF EXISTS "Anyone view accounts" ON public.financial_accounts;
CREATE POLICY "Anyone view accounts" ON public.financial_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone manage accounts" ON public.financial_accounts;
CREATE POLICY "Anyone manage accounts" ON public.financial_accounts FOR ALL USING (true);

-- Transactions: Mesma política
DROP POLICY IF EXISTS "Anyone view transactions" ON public.financial_transactions;
CREATE POLICY "Anyone view transactions" ON public.financial_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone manage transactions" ON public.financial_transactions;
CREATE POLICY "Anyone manage transactions" ON public.financial_transactions FOR ALL USING (true);

-- Categories: Mesma política
DROP POLICY IF EXISTS "Anyone view categories" ON public.transaction_categories;
CREATE POLICY "Anyone view categories" ON public.transaction_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone manage categories" ON public.transaction_categories;
CREATE POLICY "Anyone manage categories" ON public.transaction_categories FOR ALL USING (true);

-- =====================================================
-- SEED: Categorias padrão do sistema
-- =====================================================
INSERT INTO public.transaction_categories (name, description, type, color, icon, is_system, display_order)
VALUES
    ('Aporte', 'Depósito/aporte do cliente ou sócio', 'inflow', '#22c55e', '💰', true, 1),
    ('Receita de Campanha', 'Pagamento recebido por campanha', 'inflow', '#10b981', '📈', true, 2),
    ('Reembolso', 'Devolução de valor', 'inflow', '#14b8a6', '↩️', true, 3),
    ('Transferência Recebida', 'Transferência entre contas (entrada)', 'transfer', '#6366f1', '📥', true, 4),
    
    ('Pagamento Influencer', 'Pagamento para influenciador/criador', 'outflow', '#f97316', '🎤', true, 10),
    ('Mídia Paga', 'Anúncios, impulsionamento, tráfego', 'outflow', '#3b82f6', '📣', true, 11),
    ('Produção', 'Produção de conteúdo, fotos, vídeos', 'outflow', '#8b5cf6', '🎬', true, 12),
    ('Ferramentas', 'Softwares, assinaturas, plataformas', 'outflow', '#ec4899', '🛠️', true, 13),
    ('Taxa Bancária', 'Taxas, IOF, tarifas', 'outflow', '#ef4444', '🏦', true, 14),
    ('Impostos', 'IR, ISS, notas fiscais', 'outflow', '#dc2626', '📋', true, 15),
    ('Comissão Agência', 'Fee da agência sobre campanha', 'outflow', '#f59e0b', '💼', true, 16),
    ('Outros', 'Despesas diversas', 'outflow', '#6b7280', '📁', true, 17),
    ('Transferência Enviada', 'Transferência entre contas (saída)', 'transfer', '#6366f1', '📤', true, 18),
    ('Saque', 'Retirada de dinheiro', 'outflow', '#991b1b', '💸', true, 19)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE public.financial_accounts IS 'Contas bancárias/caixas por empresa cliente';
COMMENT ON TABLE public.financial_transactions IS 'Movimentações financeiras com origem e destino';
COMMENT ON TABLE public.transaction_categories IS 'Categorias de transação (sistema + customizadas)';
COMMENT ON COLUMN public.financial_transactions.type IS 'inflow=entrada, outflow=saída, transfer=entre contas';
COMMENT ON COLUMN public.financial_transactions.source_account_id IS 'Conta de onde o dinheiro SAIU';
COMMENT ON COLUMN public.financial_transactions.destination_account_id IS 'Conta para onde o dinheiro FOI';
