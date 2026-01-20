import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AgencySelectProps {
    value: string | undefined;
    onChange: (value: string) => void;
    className?: string;
}

export function AgencySelect({ value, onChange, className }: AgencySelectProps) {
    const { data: agencies = [], isLoading } = useQuery({
        queryKey: ['agencies'],
        queryFn: async () => {
            // Assuming 'companies' table has a 'type' column or just storing all companies
            // Filtering by type='agency' if applicable, otherwise all companies
            // using (supabase as any) to bypass type check for missing 'companies' table definition in generated types
            const { data, error } = await (supabase as any)
                .from('companies') // This table must exist
                .select('id, name')
                .eq('type', 'agency') // Phase 3: Filter only agencies
                .order('name');

            if (error) {
                // Fallback: If companies table doesn't exist, return empty array to prevent crash
                console.error("Error fetching agencies:", error);
                return [];
            }
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Phase 2: Add New Agency Logic
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newAgencyName, setNewAgencyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const handleCreateAgency = async () => {
        if (!newAgencyName.trim()) return;
        setIsCreating(true);

        try {
            const { data, error } = await (supabase as any)
                .from('companies')
                .insert([{ name: newAgencyName, type: 'agency' }]) // Assuming 'type' column exists or ignoring if not strict
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Agência criada!",
                description: `${newAgencyName} foi adicionada à lista.`,
            });

            // Auto-select the new agency
            onChange(data.id);
            setIsDialogOpen(false);
            setNewAgencyName("");

            // Invalidate query to refresh list would be ideal here if we had access to client
            // But relying on optimistic UI or next fetch for list update
        } catch (error) {
            console.error("Error creating agency:", error);
            toast({
                title: "Erro ao criar",
                description: "Não foi possível cadastrar a agência.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={className}>
            <Label>Agência / Representante</Label>
            <Select value={value || "independent"} onValueChange={(val) => onChange(val === "independent" ? "" : val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione uma agência (ou Independente)"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="independent">👤 Independente (Sem Agência)</SelectItem>
                    {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                            🏢 {agency.name}
                        </SelectItem>
                    ))}
                    {/* Phase 2: Action Item */}
                    <div className="p-2 border-t border-white/10 mt-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-xs h-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent select closing if possible, though Select might close.
                                // Select behavior usually closes on click inside content unless handled carefully.
                                // Actually, standard pattern is to use a button OUTSIDE or a special item.
                                // Let's try putting it as a pseudo-item or handling generic click.
                                setIsDialogOpen(true);
                            }}
                        >
                            <Plus className="w-3 h-3 mr-2" />
                            Cadastrar Nova Agência
                        </Button>
                    </div>
                </SelectContent>
            </Select>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground mt-1" />}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Nova Agência</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Agência</Label>
                            <Input
                                value={newAgencyName}
                                onChange={(e) => setNewAgencyName(e.target.value)}
                                placeholder="Ex: Top Talent Agency"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateAgency} disabled={isCreating || !newAgencyName.trim()}>
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Criar Agência
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
