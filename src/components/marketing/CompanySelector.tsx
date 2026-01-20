import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Plus, Settings, Building2, Check, Search, Command as CommandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Company } from '@/types/marketing';
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
    const [open, setOpen] = useState(false);

    // Dynamic theming: Inject company brand colors into root styles
    useEffect(() => {
        const root = document.documentElement;
        if (selectedCompany?.primaryColor) {
            root.style.setProperty('--company-primary', selectedCompany.primaryColor);
        } else {
            root.style.removeProperty('--company-primary'); // Fallback to default
        }

        if (selectedCompany?.secondaryColor) {
            root.style.setProperty('--company-secondary', selectedCompany.secondaryColor);
        } else {
            root.style.removeProperty('--company-secondary');
        }
    }, [selectedCompany]);

    // Keyboard Shortcut (Cmd+K to open - optional, but requested "Command Center" feel)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-14 pl-2 pr-4 gap-3 min-w-[260px] justify-between border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all group relative overflow-hidden"
                >
                    {/* Glow effect based on company color */}
                    {selectedCompany?.primaryColor && (
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                            style={{ backgroundColor: selectedCompany.primaryColor }}
                        />
                    )}

                    <div className="flex items-center gap-3 z-10 w-full">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shadow-inner relative overflow-hidden",
                            !selectedCompany?.logoUrl && "bg-gradient-to-br from-gray-800 to-gray-900"
                        )}>
                            {selectedCompany?.logoUrl ? (
                                <img
                                    src={selectedCompany.logoUrl}
                                    alt={selectedCompany.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Building2 className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            )}
                        </div>

                        <div className="flex flex-col items-start truncate text-left flex-1">
                            <span className="font-bold text-sm truncate w-full tracking-tight">
                                {selectedCompany?.name || 'Selecione Organização'}
                            </span>
                            <div className="flex items-center gap-2 w-full">
                                <span className={cn(
                                    "text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground",
                                    selectedCompany?.type === 'agency' && "text-purple-400 bg-purple-500/10",
                                    selectedCompany?.type === 'client' && "text-blue-400 bg-blue-500/10"
                                )}>
                                    {selectedCompany?.type === 'agency' ? 'Matriz' : selectedCompany?.type === 'client' ? 'Cliente' : 'Workspace'}
                                </span>
                                {selectedCompany?.city && (
                                    <span className="text-[10px] text-muted-foreground truncate opacity-60">
                                        • {selectedCompany.city}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-0.5 border border-white/10 rounded px-1">
                            <CommandIcon className="w-2 h-2" />K
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 border-white/10 bg-black/80 backdrop-blur-2xl text-foreground shadow-2xl" align="start">
                <Command className="bg-transparent">
                    <div className="flex items-center border-b border-white/10 px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput placeholder="Buscar organização..." className="h-12 bg-transparent focus:ring-0 text-sm placeholder:text-muted-foreground" />
                    </div>
                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            Nenhuma organização encontrada.
                        </CommandEmpty>

                        <CommandGroup heading="Minhas Organizações" className="px-1 text-muted-foreground">
                            {companies.map(company => (
                                <CommandItem
                                    key={company.id}
                                    value={company.name}
                                    onSelect={() => {
                                        onSelectCompany(company);
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-md aria-selected:bg-white/10 cursor-pointer group"
                                >
                                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-aria-selected:border-white/20 transition-colors">
                                        {company.logoUrl ? (
                                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <span className="text-xs font-bold text-muted-foreground">{company.name.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium text-foreground group-aria-selected:text-white">{company.name}</span>
                                        <span className="text-[10px] text-muted-foreground/70">{company.city || 'Local não definido'}</span>
                                    </div>
                                    {selectedCompany?.id === company.id && (
                                        <Check className="w-4 h-4 text-accent" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-white/10 my-1" />
                        <CommandGroup className="px-1">
                            <CommandItem onSelect={() => { onNewCompany(); setOpen(false); }} className="gap-2 aria-selected:bg-accent/20 aria-selected:text-accent cursor-pointer">
                                <Plus className="w-4 h-4" /> Criar Nova Organização
                            </CommandItem>
                            {selectedCompany && (
                                <CommandItem onSelect={() => { onEditCompany(); setOpen(false); }} className="gap-2 aria-selected:bg-white/10 cursor-pointer text-muted-foreground">
                                    <Settings className="w-4 h-4" /> Configurar {selectedCompany.name}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
