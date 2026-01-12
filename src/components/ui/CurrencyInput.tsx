import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    id?: string;
}

/**
 * Brazilian Real (R$) currency input with formatting.
 * - Displays formatted value with thousands separator and decimals
 * - Allows typing only numbers
 * - Allows clearing to empty (will become 0 on blur)
 * - Stores numeric value internally
 */
export function CurrencyInput({
    value,
    onChange,
    placeholder = 'R$ 0,00',
    required,
    className,
    id,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Format number to Brazilian Real display format
    const formatCurrency = (num: number): string => {
        if (num === 0) return '';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(num);
    };

    // Parse display value back to number
    const parseValue = (str: string): number => {
        // Remove currency symbol and non-numeric chars except comma/dot
        const cleaned = str.replace(/[^\d,]/g, '');
        if (!cleaned) return 0;

        // Replace comma with dot for parsing
        const normalized = cleaned.replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Update display when value changes from outside
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formatCurrency(value));
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        // Show raw number value for editing
        if (value === 0) {
            setDisplayValue('');
        } else {
            setDisplayValue(value.toFixed(2).replace('.', ','));
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        const parsed = parseValue(displayValue);
        onChange(parsed);
        setDisplayValue(formatCurrency(parsed));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Allow empty input
        if (input === '') {
            setDisplayValue('');
            return;
        }

        // Remove non-numeric except comma (Brazilian decimal separator)
        const cleaned = input.replace(/[^\d,]/g, '');

        // Only allow one comma
        const parts = cleaned.split(',');
        if (parts.length > 2) return;

        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) return;

        setDisplayValue(cleaned);
    };

    return (
        <Input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            className={cn('text-right', className)}
        />
    );
}
