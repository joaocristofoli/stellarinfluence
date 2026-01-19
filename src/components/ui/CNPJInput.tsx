import { forwardRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CNPJInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string | null;
    onChange?: (value: string) => void;
    className?: string;
}

/**
 * Formata um CNPJ com a máscara XX.XXX.XXX/XXXX-XX
 * Aceita apenas números e formata automaticamente.
 */
const formatCNPJ = (value: string): string => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');

    // Limita a 14 dígitos
    const limited = digits.slice(0, 14);

    // Aplica máscara progressivamente
    if (limited.length <= 2) {
        return limited;
    }
    if (limited.length <= 5) {
        return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    }
    if (limited.length <= 8) {
        return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    }
    if (limited.length <= 12) {
        return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    }
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
};

/**
 * Extrai apenas os dígitos de um CNPJ formatado
 */
const extractDigits = (value: string): string => {
    return value.replace(/\D/g, '');
};

/**
 * Valida se um CNPJ tem o formato correto (14 dígitos)
 * Nota: Não valida os dígitos verificadores
 */
const isValidCNPJFormat = (value: string): boolean => {
    const digits = extractDigits(value);
    return digits.length === 14;
};

/**
 * CNPJInput - Input com máscara automática para CNPJ brasileiro
 * 
 * @example
 * <CNPJInput 
 *   value={formData.cnpj} 
 *   onChange={(cnpj) => setFormData({...formData, cnpj})} 
 * />
 */
export const CNPJInput = forwardRef<HTMLInputElement, CNPJInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        // Estado interno para o valor formatado
        const [displayValue, setDisplayValue] = useState(() =>
            value ? formatCNPJ(value) : ''
        );

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            const formatted = formatCNPJ(inputValue);

            setDisplayValue(formatted);

            // Envia o valor sem formatação para o parent
            if (onChange) {
                onChange(extractDigits(formatted));
            }
        }, [onChange]);

        // Sincroniza com valor externo
        const handleBlur = useCallback(() => {
            if (value) {
                setDisplayValue(formatCNPJ(value));
            }
        }, [value]);

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="00.000.000/0000-00"
                maxLength={18} // XX.XXX.XXX/XXXX-XX
                className={cn(
                    'font-mono tracking-wide',
                    className
                )}
                {...props}
            />
        );
    }
);

CNPJInput.displayName = 'CNPJInput';

export { formatCNPJ, extractDigits, isValidCNPJFormat };
