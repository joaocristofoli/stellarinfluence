import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
}

/**
 * FMT-001: Input de telefone com máscara automática
 * Formato: (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo)
 */
export function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Formatar valor para exibição
    useEffect(() => {
        setDisplayValue(formatPhone(value));
    }, [value]);

    const formatPhone = (raw: string): string => {
        // Remove tudo que não é número
        const digits = raw.replace(/\D/g, '');

        if (digits.length === 0) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) {
            // Telefone fixo: (00) 0000-0000
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        // Celular: (00) 00000-0000
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        // Limita a 11 dígitos (DDD + 9 dígitos)
        const limited = raw.slice(0, 11);
        onChange(limited);
    };

    return (
        <Input
            {...props}
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className={cn(className)}
        />
    );
}

/**
 * Função utilitária para formatar telefone fora do componente
 */
export function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits})`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
