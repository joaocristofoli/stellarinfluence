import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChannelType,
    channelTypeLabels,
    channelTypeIcons,
} from '@/types/marketing';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickAddStrategyProps {
    date: Date;
    companyId: string;
    onSave: (data: {
        name: string;
        channelType: ChannelType;
        budget: number;
        startDate: Date;
        companyId: string;
        // MAJ-005 fix: Campos opcionais para dados completos
        responsible?: string;
        description?: string;
        howToDo?: string;
        whenToDo?: string;
        whyToDo?: string;
        connections?: string[];
        status?: 'planned' | 'in_progress' | 'completed';
        endDate?: Date | null;
        campaignId?: string | null;
        linkedCreatorIds?: string[];
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const quickChannelTypes: ChannelType[] = [
    'influencer',
    'paid_traffic',
    'social_media',
    'radio',
    'flyers',
    'events',
];

export function QuickAddStrategy({
    date,
    companyId,
    onSave,
    onCancel,
    isLoading = false,
}: QuickAddStrategyProps) {
    const [name, setName] = useState('');
    const [channel, setChannel] = useState<ChannelType>('influencer');
    const [budget, setBudget] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // MAJ-005 fix: Incluir todos os campos obrigatórios com valores default
        onSave({
            name: name.trim(),
            channelType: channel,
            budget,
            startDate: date,
            companyId,
            // Campos obrigatórios com valores default
            responsible: 'A definir',
            description: `Ação rápida adicionada via calendário em ${date.toLocaleDateString('pt-BR')}`,
            howToDo: '',
            whenToDo: '',
            whyToDo: '',
            connections: [],
            status: 'planned',
            endDate: null,
            campaignId: null,
            linkedCreatorIds: [],
        });
    };

    const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-1"
        >
            <form
                onSubmit={handleSubmit}
                className="p-3 bg-card border rounded-lg shadow-xl space-y-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-medium">➕ Adicionar em {formattedDate}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={onCancel}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                <Input
                    placeholder="Nome da ação..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                />

                <div className="flex gap-2">
                    <Select value={channel} onValueChange={(v: ChannelType) => setChannel(v)}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {quickChannelTypes.map(type => (
                                <SelectItem key={type} value={type} className="text-xs">
                                    {channelTypeIcons[type]} {channelTypeLabels[type]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <CurrencyInput
                        value={budget}
                        onChange={setBudget}
                        placeholder="R$ 0"
                        className="h-8 text-xs w-24"
                    />
                </div>

                <div className="flex gap-2 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="flex-1 h-7 text-xs gradient-primary"
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            'Adicionar'
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}
