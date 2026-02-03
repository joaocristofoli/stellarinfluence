import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormattedNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    id?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
}

/**
 * Input para números inteiros com formatação de milhar (1.000.000).
 * Retorna o valor numérico limpo no onChange.
 */
export function FormattedNumberInput({
    value,
    onChange,
    placeholder,
    required,
    className,
    id,
    disabled,
    min,
    max,
}: FormattedNumberInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Formata número com separadores de milhar (pt-BR)
    const formatNumber = (num: number): string => {
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('pt-BR', {
            maximumFractionDigits: 0
        }).format(num);
    };

    // Atualiza display quando value muda externamente
    useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(formatNumber(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Remove tudo que não é dígito
        const digitsOnly = input.replace(/\D/g, '');

        if (!digitsOnly) {
            setDisplayValue('');
            onChange(0);
            return;
        }

        let num = parseInt(digitsOnly, 10);

        if (max !== undefined && num > max) num = max;
        if (min !== undefined && num < min) num = min;

        setDisplayValue(formatNumber(num));
        onChange(num);
    };

    return (
        <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={cn('text-right tabular-nums', className)}
        />
    );
}
