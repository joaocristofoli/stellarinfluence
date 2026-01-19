import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export interface ColumnDef<T> {
    key: keyof T | string;
    header: string;
    cell?: (row: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
    data: T[];
    columns: ColumnDef<T>[];
    searchPlaceholder?: string;
    searchKey?: keyof T;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    pageSize?: number;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchPlaceholder = "Buscar...",
    searchKey,
    onRowClick,
    actions,
    emptyStateTitle = "Nenhum item encontrado",
    emptyStateDescription = "Adicione novos itens para começar.",
    pageSize = 10,
    className,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortKey, setSortKey] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = React.useState(1);

    // Filter data by search term
    const filteredData = React.useMemo(() => {
        if (!searchTerm || !searchKey) return data;

        return data.filter((row) => {
            const value = row[searchKey];
            if (typeof value === "string") {
                return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
        });
    }, [data, searchTerm, searchKey]);

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortKey) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortKey, sortDirection]);

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const getSortIcon = (key: string) => {
        if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
        return sortDirection === "asc"
            ? <ArrowUp className="w-4 h-4 ml-1" />
            : <ArrowDown className="w-4 h-4 ml-1" />;
    };

    if (data.length === 0) {
        return (
            <EmptyState
                icon={Inbox}
                title={emptyStateTitle}
                description={emptyStateDescription}
            />
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search */}
            {searchKey && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10"
                    />
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={cn(
                                        column.sortable && "cursor-pointer select-none hover:bg-muted/80",
                                        column.className
                                    )}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className="flex items-center">
                                        {column.header}
                                        {column.sortable && getSortIcon(String(column.key))}
                                    </div>
                                </TableHead>
                            ))}
                            {actions && <TableHead className="w-[100px]">Ações</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow
                                key={index}
                                className={cn(
                                    onRowClick && "cursor-pointer hover:bg-muted/50"
                                )}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column) => (
                                    <TableCell key={String(column.key)} className={column.className}>
                                        {column.cell
                                            ? column.cell(row)
                                            : String(row[column.key] ?? "-")}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        {actions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                        {Math.min(currentPage * pageSize, sortedData.length)} de{" "}
                        {sortedData.length} itens
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
