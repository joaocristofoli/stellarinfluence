import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { creator, loading: creatorLoading, refetch } = useCreatorProfile();
    const { toast } = useToast();
    const [isLocked, setIsLocked] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'locked' | 'verify' | 'change_email'>('locked');
    const [newEmail, setNewEmail] = useState("");

    useEffect(() => {
        if (creator && !creatorLoading) {
            const createdAt = new Date(creator.created_at || new Date());
            const daysSinceCreation = differenceInDays(new Date(), createdAt);

            // Grace period is 5 days
            if (daysSinceCreation > 5 && !creator.email_verified) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        }
    }, [creator, creatorLoading]);

    const handleSendOtp = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: user.email,
            });
            if (error) throw error;
            toast({
                title: "Código enviado!",
                description: "Verifique seu e-mail para pegar o código de 6 dígitos.",
            });
            setStep('verify');
        } catch (error: any) {
            toast({
                title: "Erro ao enviar código",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!user?.email || !otp) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: user.email,
                token: otp,
                type: 'email',
            });
            if (error) throw error;

            // Update database
            const { error: dbError } = await supabase
                .from('creators')
                .update({ email_verified: true })
                .eq('id', creator?.id);

            if (dbError) throw dbError;

            toast({
                title: "E-mail verificado!",
                description: "Obrigado por confirmar sua conta.",
            });

            await refetch();
            setIsLocked(false);
        } catch (error: any) {
            toast({
                title: "Código inválido",
                description: "Verifique se digitou corretamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;

            toast({
                title: "Verifique seu novo e-mail",
                description: "Enviamos um link de confirmação para o novo endereço.",
            });

            // We can't auto-verify here, they must click the link in the new email
            // After they click, they should come back and login/verify
            setStep('locked');
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (creatorLoading) return null; // Or a spinner

    if (isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full border-orange-500/50 shadow-[0_0_30px_rgba(255,107,53,0.1)]">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                        </div>
                        <CardTitle>Confirmação Necessária</CardTitle>
                        <CardDescription>
                            Seu período de teste de 5 dias acabou. Para continuar usando a plataforma, por favor confirme seu e-mail.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 'locked' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg text-center text-sm">
                                    E-mail atual: <span className="font-mono text-foreground">{user?.email}</span>
                                </div>
                                <Button onClick={handleSendOtp} className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-2" /> Enviar Código de Verificação</>}
                                </Button>
                                <Button variant="outline" onClick={() => setStep('change_email')} className="w-full">
                                    Trocar E-mail
                                </Button>
                            </div>
                        )}

                        {step === 'verify' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Digite o código de 6 dígitos"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="text-center text-lg tracking-widest"
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-center text-muted-foreground">Enviado para {user?.email}</p>
                                </div>
                                <Button onClick={handleVerifyOtp} className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Confirmar</>}
                                </Button>
                                <Button variant="ghost" onClick={() => setStep('locked')} className="w-full" disabled={loading}>
                                    Voltar
                                </Button>
                            </div>
                        )}

                        {step === 'change_email' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Novo e-mail"
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleChangeEmail} className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar E-mail"}
                                </Button>
                                <Button variant="ghost" onClick={() => setStep('locked')} className="w-full" disabled={loading}>
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
