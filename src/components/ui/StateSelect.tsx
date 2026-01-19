import { forwardRef } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StateSelectProps {
    value?: string | null;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Lista completa de estados brasileiros com sigla e nome
 * Ordenada alfabeticamente pela sigla
 */
const BRAZILIAN_STATES = [
    { value: 'AC', label: 'AC - Acre' },
    { value: 'AL', label: 'AL - Alagoas' },
    { value: 'AP', label: 'AP - Amapá' },
    { value: 'AM', label: 'AM - Amazonas' },
    { value: 'BA', label: 'BA - Bahia' },
    { value: 'CE', label: 'CE - Ceará' },
    { value: 'DF', label: 'DF - Distrito Federal' },
    { value: 'ES', label: 'ES - Espírito Santo' },
    { value: 'GO', label: 'GO - Goiás' },
    { value: 'MA', label: 'MA - Maranhão' },
    { value: 'MT', label: 'MT - Mato Grosso' },
    { value: 'MS', label: 'MS - Mato Grosso do Sul' },
    { value: 'MG', label: 'MG - Minas Gerais' },
    { value: 'PA', label: 'PA - Pará' },
    { value: 'PB', label: 'PB - Paraíba' },
    { value: 'PR', label: 'PR - Paraná' },
    { value: 'PE', label: 'PE - Pernambuco' },
    { value: 'PI', label: 'PI - Piauí' },
    { value: 'RJ', label: 'RJ - Rio de Janeiro' },
    { value: 'RN', label: 'RN - Rio Grande do Norte' },
    { value: 'RS', label: 'RS - Rio Grande do Sul' },
    { value: 'RO', label: 'RO - Rondônia' },
    { value: 'RR', label: 'RR - Roraima' },
    { value: 'SC', label: 'SC - Santa Catarina' },
    { value: 'SP', label: 'SP - São Paulo' },
    { value: 'SE', label: 'SE - Sergipe' },
    { value: 'TO', label: 'TO - Tocantins' },
] as const;

/**
 * StateSelect - Dropdown para seleção de estados brasileiros
 * 
 * @example
 * <StateSelect 
 *   value={formData.state} 
 *   onChange={(state) => setFormData({...formData, state})} 
 * />
 */
export const StateSelect = forwardRef<HTMLButtonElement, StateSelectProps>(
    ({ value, onChange, placeholder = 'Selecione o estado', disabled, className }, ref) => {
        const handleValueChange = (newValue: string) => {
            if (onChange) {
                onChange(newValue);
            }
        };

        return (
            <Select
                value={value || undefined}
                onValueChange={handleValueChange}
                disabled={disabled}
            >
                <SelectTrigger ref={ref} className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                        <SelectItem
                            key={state.value}
                            value={state.value}
                        >
                            {state.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
);

StateSelect.displayName = 'StateSelect';

/**
 * Retorna o nome completo do estado a partir da sigla
 */
export const getStateName = (uf: string): string | undefined => {
    const state = BRAZILIAN_STATES.find(s => s.value === uf.toUpperCase());
    return state?.label.split(' - ')[1];
};

/**
 * Valida se uma sigla é um estado brasileiro válido
 */
export const isValidState = (uf: string): boolean => {
    return BRAZILIAN_STATES.some(s => s.value === uf.toUpperCase());
};

export { BRAZILIAN_STATES };
