import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CPFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
}

/**
 * FMT-002: Input de CPF com máscara automática
 * Formato: 000.000.000-00
 */
export function CPFInput({ value, onChange, className, ...props }: CPFInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Formatar valor para exibição
    useEffect(() => {
        setDisplayValue(formatCPF(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        // Limita a 11 dígitos
        const limited = raw.slice(0, 11);
        onChange(limited);
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="000.000.000-00"
            className={cn(className)}
        />
    );
}

/**
 * Formata CPF para exibição
 * 000.000.000-00
 */
export function formatCPF(raw: string): string {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Valida se um CPF é válido (algoritmo oficial)
 */
export function isValidCPF(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '');

    if (digits.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.charAt(10))) return false;

    return true;
}
