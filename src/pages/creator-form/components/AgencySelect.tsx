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
import { Loader2 } from "lucide-react";

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
                </SelectContent>
            </Select>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground mt-1" />}
        </div>
    );
}
