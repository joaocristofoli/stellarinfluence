import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionType } from '@/types/marketing';
import { MarketingStrategy } from '@/types/marketing';
import { formatCurrency } from '@/utils/formatters';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { parseFormattedNumber } from '@/utils/formatNumbers';

interface TransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    initialType?: TransactionType;
    strategies?: MarketingStrategy[]; // To link payments
}

export function TransactionModal({ open, onOpenChange, onSubmit, initialType = 'outflow', strategies = [] }: TransactionModalProps) {
    const [type, setType] = useState<TransactionType>(initialType);
    const [amountStr, setAmountStr] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>('none');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [pixKey, setPixKey] = useState('');

    const handleSubmit = () => {
        const amount = parseFormattedNumber(amountStr);
        if (!amount || !description) return;

        onSubmit({
            type,
            amount,
            description,
            category,
            date,
            strategyId: selectedStrategyId === 'none' ? undefined : selectedStrategyId,
            paymentMethod,
            pixKey: type === 'outflow' && paymentMethod === 'pix' ? pixKey : undefined
        });

        // Reset and close
        setAmountStr('');
        setDescription('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {type === 'inflow' ? (
                            <><ArrowUpCircle className="text-emerald-500 w-6 h-6" /> Registrar Entrada</>
                        ) : (
                            <><ArrowDownCircle className="text-red-500 w-6 h-6" /> Registrar Saída</>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Type Toggle */}
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setType('inflow')}
                            className={cn(
                                "flex-1 text-sm font-medium py-1.5 rounded-md transition-all",
                                type === 'inflow' ? "bg-emerald-500 text-white shadow" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Entrada
                        </button>
                        <button
                            onClick={() => setType('outflow')}
                            className={cn(
                                "flex-1 text-sm font-medium py-1.5 rounded-md transition-all",
                                type === 'outflow' ? "bg-red-500 text-white shadow" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Saída
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                                placeholder="0,00"
                                className="text-lg font-bold"
                                value={amountStr}
                                onChange={(e) => setAmountStr(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                            placeholder={type === 'inflow' ? "Ex: Aporte Inicial" : "Ex: Pagamento Influencer"}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {type === 'outflow' && (
                        <>
                            <div className="space-y-2">
                                <Label>Vincular Estratégia (Opcional)</Label>
                                <Select value={selectedStrategyId} onValueChange={setSelectedStrategyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sem vínculo</SelectItem>
                                        {strategies.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name} ({formatCurrency(s.budget)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Método</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pix">Pix</SelectItem>
                                            <SelectItem value="transfer">Transferência</SelectItem>
                                            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                            <SelectItem value="cash">Dinheiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {paymentMethod === 'pix' && (
                                    <div className="space-y-2">
                                        <Label>Chave Pix / Destino</Label>
                                        <Input
                                            placeholder="CPF/Email/Chave"
                                            value={pixKey}
                                            onChange={(e) => setPixKey(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} className={type === 'inflow' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}>
                        {type === 'inflow' ? "Confirmar Entrada" : "Confirmar Saída"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
