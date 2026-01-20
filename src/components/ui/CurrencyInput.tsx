import { useState, useEffect, useRef, useCallback } from 'react';
import { GlassInput } from '@/components/ui/glass-input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    id?: string;
    disabled?: boolean;
}

/**
 * Brazilian Real (R$) currency input with REAL-TIME formatting.
 * - Formata enquanto o usuário digita
 * - Mostra R$ e separadores de milhar em tempo real
 * - Converte automaticamente centavos (123 = R$ 1,23)
 */
export function CurrencyInput({
    value,
    onChange,
    placeholder = 'R$ 0,00',
    required,
    className,
    id,
    disabled,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Formata número para moeda brasileira
    const formatCurrency = useCallback((cents: number): string => {
        if (cents === 0) return '';
        const reais = cents / 100;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(reais);
    }, []);

    // Atualiza display quando value muda externamente
    useEffect(() => {
        // Converte valor (que está em reais) para centavos para exibição
        const cents = Math.round(value * 100);
        setDisplayValue(formatCurrency(cents));
    }, [value, formatCurrency]);

    // Handler de mudança com formatação em tempo real
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Remove tudo exceto dígitos
        const digitsOnly = input.replace(/\D/g, '');

        // Se vazio, zera
        if (!digitsOnly) {
            setDisplayValue('');
            onChange(0);
            return;
        }

        // Converte para número (centavos)
        const cents = parseInt(digitsOnly, 10);

        // Limita a 10 bilhões (para evitar overflow)
        if (cents > 10000000000) return;

        // Formata e atualiza display
        const formatted = formatCurrency(cents);
        setDisplayValue(formatted);

        // Converte centavos para reais e notifica pai
        const reais = cents / 100;
        onChange(reais);
    };

    // Limpa formatação no foco para melhor UX (opcional - mantém formatado)
    const handleFocus = () => {
        // Mantém formatado, apenas seleciona tudo para facilitar substituição
        if (inputRef.current) {
            setTimeout(() => {
                inputRef.current?.select();
            }, 0);
        }
    };

    return (
        <GlassInput
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={cn('text-right tabular-nums', className)}
            icon={<span className="text-xs font-semibold text-muted-foreground mr-1">R$</span>}
        />
    );
}
