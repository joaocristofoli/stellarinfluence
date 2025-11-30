import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserData {
    id: string;
    email: string;
    full_name: string;
    is_admin: boolean;
    created_at: string;
}

export function UserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_users_with_roles');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (targetUser: UserData) => {
        if (targetUser.email === 'contatojoaochristofoli@gmail.com') {
            toast.error("Não é possível alterar o Super Admin");
            return;
        }

        try {
            setActionLoading(targetUser.id);

            // Use RPC to toggle admin role safely
            const { error } = await supabase.rpc('toggle_admin_role', {
                target_user_id: targetUser.id,
                enable_admin: !targetUser.is_admin
            });

            if (error) throw error;

            const action = !targetUser.is_admin ? "adicionado" : "removido";
            toast.success(`Admin ${action}: ${targetUser.email}`);

            // Refresh list
            await fetchUsers();
        } catch (error: any) {
            console.error("Error toggling admin:", error);
            toast.error(error.message || "Erro ao alterar permissões");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Gerenciamento de Usuários
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell className="font-medium">
                                    {u.full_name || "Sem nome"}
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    {u.is_admin ? (
                                        <Badge className="bg-green-500 hover:bg-green-600">
                                            <ShieldCheck className="w-3 h-3 mr-1" />
                                            Admin
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Usuário</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {u.email !== 'contatojoaochristofoli@gmail.com' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant={u.is_admin ? "destructive" : "default"}
                                                    size="sm"
                                                    disabled={actionLoading === u.id}
                                                >
                                                    {actionLoading === u.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : u.is_admin ? (
                                                        "Remover Admin"
                                                    ) : (
                                                        "Tornar Admin"
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        {u.is_admin ? "Remover acesso Admin?" : "Conceder acesso Admin?"}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {u.is_admin
                                                            ? `O usuário ${u.email} perderá acesso ao painel administrativo.`
                                                            : `O usuário ${u.email} terá acesso total ao painel administrativo.`
                                                        }
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleToggleAdmin(u)}>
                                                        Confirmar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    {u.email === 'contatojoaochristofoli@gmail.com' && (
                                        <span className="text-xs text-muted-foreground italic">
                                            Super Admin
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
