import { useState, useEffect } from 'react';
import { MarketingTransaction } from '@/types/marketing';

// Simple ID generator if crypto.randomUUID is not available (dev envs)
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Mock Data for demonstration

// Mock Data for demonstration
const INITIAL_TRANSACTIONS: MarketingTransaction[] = [
    {
        id: '1',
        companyId: 'default',
        type: 'inflow',
        amount: 15000,
        date: new Date('2024-02-01'),
        description: 'Aporte Inicial - Fevereiro',
        category: 'Deposit',
        status: 'completed',
        createdAt: new Date(),
        paymentMethod: 'transfer'
    },
    {
        id: '2',
        companyId: 'default',
        type: 'outflow',
        amount: 2500,
        date: new Date('2024-02-05'),
        description: 'Pagamento Influencer Larissa',
        category: 'Influencer',
        status: 'completed',
        createdAt: new Date(),
        paymentMethod: 'pix',
        pixKey: 'larissa@pix.com'
    }
];

export function useFinancials() {
    // In a real app, this would use Supabase
    const [transactions, setTransactions] = useState<MarketingTransaction[]>(() => {
        const saved = localStorage.getItem('marketing_transactions');
        if (saved) {
            try {
                return JSON.parse(saved, (key, value) => {
                    if (key === 'date' || key === 'createdAt') return new Date(value);
                    return value;
                });
            } catch (e) { return INITIAL_TRANSACTIONS; }
        }
        return INITIAL_TRANSACTIONS;
    });

    const [settings, setSettings] = useState<{ monthlyBudget: number }>(() => {
        const saved = localStorage.getItem('marketing_financial_settings');
        return saved ? JSON.parse(saved) : { monthlyBudget: 0 };
    });

    useEffect(() => {
        localStorage.setItem('marketing_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('marketing_financial_settings', JSON.stringify(settings));
    }, [settings]);

    const setMonthlyBudget = (amount: number) => {
        setSettings(prev => ({ ...prev, monthlyBudget: amount }));
    };

    const addTransaction = (t: Omit<MarketingTransaction, 'id' | 'createdAt' | 'status'>) => {
        const newTrans: MarketingTransaction = {
            ...t,
            id: generateId(),
            createdAt: new Date(),
            status: 'completed' // Auto-complete for now
        };
        setTransactions(prev => [newTrans, ...prev]);
        return newTrans;
    };

    const removeTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = (id: string, updates: Partial<MarketingTransaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    // Derived Stats
    const totalInflow = transactions.filter(t => t.type === 'inflow').reduce((acc, t) => acc + t.amount, 0);
    const totalOutflow = transactions.filter(t => t.type === 'outflow').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalInflow - totalOutflow;

    return {
        transactions,
        addTransaction,
        removeTransaction,
        updateTransaction,
        settings,
        setMonthlyBudget,
        stats: {
            totalInflow,
            totalOutflow,
            balance
        }
    };
}
