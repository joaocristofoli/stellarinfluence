import { ChevronDown, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Company } from '@/types/marketing';

interface CompanySelectorProps {
    companies: Company[];
    selectedCompany: Company | null;
    onSelectCompany: (company: Company) => void;
    onNewCompany: () => void;
    onEditCompany: () => void;
}

export function CompanySelector({
    companies,
    selectedCompany,
    onSelectCompany,
    onNewCompany,
    onEditCompany,
}: CompanySelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
                    <span className="truncate">
                        {selectedCompany?.name || 'Selecione uma empresa'}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
                {companies.map(company => (
                    <DropdownMenuItem
                        key={company.id}
                        onClick={() => onSelectCompany(company)}
                        className="cursor-pointer"
                    >
                        <div>
                            <p className="font-medium">{company.name}</p>
                            {company.city && company.state && (
                                <p className="text-xs text-muted-foreground">
                                    {company.city}, {company.state}
                                </p>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}

                {companies.length > 0 && <DropdownMenuSeparator />}

                <DropdownMenuItem onClick={onNewCompany} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Empresa
                </DropdownMenuItem>

                {selectedCompany && (
                    <DropdownMenuItem onClick={onEditCompany} className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Editar Empresa
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
