/**
 * ============================================================
 * MASKED INPUT - Universal Input with Real-Time Formatting
 * ============================================================
 * A premium input component that applies formatting masks
 * while the user types, without cursor jumping issues.
 * 
 * Types:
 * - currency: R$ 1.234,56
 * - number: 1.234.567
 * - percentage: 15,5%
 * - text: No mask (passthrough)
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    formatCurrency,
    formatNumber,
    formatPercentage,
    parseNumber,
} from '@/services/FormatterService';

// ============================================================
// TYPES
// ============================================================

type MaskType = 'currency' | 'number' | 'percentage' | 'text';

interface MaskedInputProps {
    /** Type of mask to apply */
    type?: MaskType;
    /** Current numeric value */
    value: number;
    /** Callback when value changes (receives clean number) */
    onChange: (value: number) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Is field required */
    required?: boolean;
    /** CSS class name */
    className?: string;
    /** HTML id attribute */
    id?: string;
    /** Is field disabled */
    disabled?: boolean;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Number of decimal places (for number type) */
    decimals?: number;
    /** Label for accessibility */
    'aria-label'?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function MaskedInput({
    type = 'text',
    value,
    onChange,
    placeholder,
    required,
    className,
    id,
    disabled,
    min,
    max,
    decimals = 0,
    'aria-label': ariaLabel,
}: MaskedInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorPositionRef = useRef<number>(0);

    // ============================================================
    // FORMAT DISPLAY VALUE
    // ============================================================
    const formatDisplay = useCallback((num: number): string => {
        if (num === 0 && type !== 'text') return '';

        switch (type) {
            case 'currency':
                return formatCurrency(num);
            case 'number':
                return formatNumber(num, decimals);
            case 'percentage':
                return num > 0 ? `${formatNumber(num, 1)}%` : '';
            default:
                return num.toString();
        }
    }, [type, decimals]);

    // ============================================================
    // SYNC DISPLAY WHEN VALUE CHANGES EXTERNALLY
    // ============================================================
    useEffect(() => {
        setDisplayValue(formatDisplay(value));
    }, [value, formatDisplay]);

    // ============================================================
    // HANDLE INPUT CHANGE WITH REAL-TIME MASKING
    // ============================================================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const selectionStart = e.target.selectionStart || 0;

        // Store cursor position relative to end (for restoration)
        cursorPositionRef.current = input.length - selectionStart;

        let numericValue: number;
        let formattedDisplay: string;

        switch (type) {
            case 'currency': {
                // Remove all non-digits
                const digitsOnly = input.replace(/\D/g, '');
                if (!digitsOnly) {
                    setDisplayValue('');
                    onChange(0);
                    return;
                }
                // Treat as centavos
                const centavos = parseInt(digitsOnly, 10);
                numericValue = centavos / 100;
                formattedDisplay = formatCurrency(numericValue);
                break;
            }

            case 'number': {
                // Remove all non-digits
                const digitsOnly = input.replace(/\D/g, '');
                if (!digitsOnly) {
                    setDisplayValue('');
                    onChange(0);
                    return;
                }
                numericValue = parseInt(digitsOnly, 10);
                formattedDisplay = formatNumber(numericValue, decimals);
                break;
            }

            case 'percentage': {
                // Allow digits and comma for decimals
                const cleaned = input.replace(/[^\d,]/g, '');
                if (!cleaned) {
                    setDisplayValue('');
                    onChange(0);
                    return;
                }
                // Parse with comma as decimal separator
                numericValue = parseNumber(cleaned.replace(',', '.'));
                // Clamp to 0-100
                numericValue = Math.min(100, Math.max(0, numericValue));
                formattedDisplay = cleaned.includes(',')
                    ? cleaned + '%'
                    : `${formatNumber(numericValue, 1)}%`;
                break;
            }

            default:
                numericValue = parseNumber(input);
                formattedDisplay = input;
        }

        // Apply min/max constraints
        if (min !== undefined && numericValue < min) numericValue = min;
        if (max !== undefined && numericValue > max) numericValue = max;

        setDisplayValue(formattedDisplay);
        onChange(numericValue);

        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
            if (inputRef.current) {
                const newPosition = formattedDisplay.length - cursorPositionRef.current;
                inputRef.current.setSelectionRange(newPosition, newPosition);
            }
        });
    };

    // ============================================================
    // HANDLE FOCUS - Select all for easy replacement
    // ============================================================
    const handleFocus = () => {
        setTimeout(() => {
            inputRef.current?.select();
        }, 0);
    };

    // ============================================================
    // PLACEHOLDER BASED ON TYPE
    // ============================================================
    const getPlaceholder = (): string => {
        if (placeholder) return placeholder;

        switch (type) {
            case 'currency':
                return 'R$ 0,00';
            case 'percentage':
                return '0%';
            case 'number':
                return '0';
            default:
                return '';
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <Input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={getPlaceholder()}
            required={required}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
                'text-right tabular-nums',
                type === 'currency' && 'font-medium',
                className
            )}
        />
    );
}

// ============================================================
// SPECIALIZED SHORTCUTS
// ============================================================

interface SpecializedInputProps extends Omit<MaskedInputProps, 'type'> { }

/**
 * Shortcut for currency input (R$)
 */
export function CurrencyInputNew(props: SpecializedInputProps) {
    return <MaskedInput {...props} type="currency" />;
}

/**
 * Shortcut for percentage input (0-100%)
 */
export function PercentageInput(props: SpecializedInputProps) {
    return <MaskedInput {...props} type="percentage" max={100} min={0} />;
}

/**
 * Shortcut for number input with thousand separators
 */
export function NumberInput(props: SpecializedInputProps) {
    return <MaskedInput {...props} type="number" />;
}

export default MaskedInput;
