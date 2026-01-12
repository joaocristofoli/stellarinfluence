import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Calendar,
    Bell,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Settings2,
    ExternalLink,
    Shield,
    Clock
} from 'lucide-react';

interface CalendarSettings {
    id?: string;
    provider: 'apple' | 'google' | 'outlook';
    caldav_url: string;
    username: string;
    app_password: string;
    calendar_name: string;
    sync_strategies: boolean;
    sync_tasks: boolean;
    sync_reminders: boolean;
    reminder_hours_before: number;
    enabled: boolean;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_error: string | null;
}

const defaultSettings: CalendarSettings = {
    provider: 'apple',
    caldav_url: 'https://caldav.icloud.com',
    username: '',
    app_password: '',
    calendar_name: 'Stellar Marketing',
    sync_strategies: true,
    sync_tasks: true,
    sync_reminders: true,
    reminder_hours_before: 24,
    enabled: false,
    last_sync_at: null,
    last_sync_status: null,
    last_sync_error: null,
};

export function CalendarIntegration() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (user) loadSettings();
    }, [user]);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_calendar_settings')
                .select('*')
                .eq('user_id', user?.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                setSettings(data as CalendarSettings);
            }
        } catch (error) {
            console.error('Error loading calendar settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!user) return;

        try {
            setSaving(true);

            const payload = {
                user_id: user.id,
                ...settings,
            };

            const { error } = await supabase
                .from('admin_calendar_settings')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) throw error;

            toast.success('Configurações salvas!');
            await loadSettings();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(error.message || 'Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const testConnection = async () => {
        if (!settings.username || !settings.app_password) {
            toast.error('Preencha email e App Password primeiro');
            return;
        }

        try {
            setTesting(true);

            // Call edge function to test CalDAV connection
            const { data, error } = await supabase.functions.invoke('sync-calendar', {
                body: {
                    action: 'test',
                    settings: {
                        caldav_url: settings.caldav_url,
                        username: settings.username,
                        app_password: settings.app_password,
                    }
                }
            });

            if (error) throw error;

            if (data?.success) {
                toast.success('Conexão bem sucedida! ✅');
            } else {
                toast.error(data?.error || 'Falha na conexão');
            }
        } catch (error: any) {
            console.error('Connection test failed:', error);
            toast.error('Erro ao testar conexão: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setTesting(false);
        }
    };

    const syncNow = async () => {
        try {
            setSyncing(true);

            const { data, error } = await supabase.functions.invoke('sync-calendar', {
                body: {
                    action: 'sync_all',
                    user_id: user?.id,
                }
            });

            if (error) throw error;

            if (data?.success) {
                toast.success(`Sincronização concluída! ${data.synced_count || 0} itens sincronizados.`);
                await loadSettings();
            } else {
                toast.error(data?.error || 'Falha na sincronização');
            }
        } catch (error: any) {
            console.error('Sync failed:', error);
            toast.error('Erro na sincronização');
        } finally {
            setSyncing(false);
        }
    };

    const providerInfo = {
        apple: {
            name: 'Apple Calendar (iCloud)',
            icon: '🍎',
            url: 'https://caldav.icloud.com',
            helpUrl: 'https://support.apple.com/en-us/HT204397',
            helpText: 'Gere um App-Specific Password em appleid.apple.com'
        },
        google: {
            name: 'Google Calendar',
            icon: '📅',
            url: 'https://www.googleapis.com/caldav/v2',
            helpUrl: 'https://support.google.com/accounts/answer/185833',
            helpText: 'Use uma senha de app do Google'
        },
        outlook: {
            name: 'Microsoft Outlook',
            icon: '📧',
            url: 'https://outlook.office365.com/caldav',
            helpUrl: 'https://support.microsoft.com/en-us/account-billing',
            helpText: 'Use uma senha de app do Microsoft'
        }
    };

    const currentProvider = providerInfo[settings.provider];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        Integração com Calendário
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Sincronize suas estratégias e tarefas automaticamente
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                    />
                    <span className="text-sm font-medium">
                        {settings.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>

            {/* Status Card */}
            {settings.last_sync_at && (
                <Card className={settings.last_sync_status === 'success' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {settings.last_sync_status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <div>
                                    <p className="font-medium">
                                        {settings.last_sync_status === 'success' ? 'Última sincronização bem sucedida' : 'Erro na última sincronização'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(settings.last_sync_at).toLocaleString('pt-BR')}
                                    </p>
                                    {settings.last_sync_error && (
                                        <p className="text-sm text-red-500 mt-1">{settings.last_sync_error}</p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={syncNow}
                                disabled={syncing || !settings.enabled}
                            >
                                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="ml-2">Sincronizar Agora</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="w-5 h-5" />
                            Configuração do Provedor
                        </CardTitle>
                        <CardDescription>
                            Configure a conexão com seu calendário
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Provedor</Label>
                            <Select
                                value={settings.provider}
                                onValueChange={(value: 'apple' | 'google' | 'outlook') =>
                                    setSettings({
                                        ...settings,
                                        provider: value,
                                        caldav_url: providerInfo[value].url
                                    })
                                }
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="apple">🍎 Apple Calendar (iCloud)</SelectItem>
                                    <SelectItem value="google">📅 Google Calendar</SelectItem>
                                    <SelectItem value="outlook">📧 Microsoft Outlook</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Email / Usuário</Label>
                            <Input
                                type="email"
                                value={settings.username}
                                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                                placeholder="seu@email.com"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label>App-Specific Password</Label>
                                <a
                                    href={currentProvider.helpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                                >
                                    Como criar? <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <Input
                                type="password"
                                value={settings.app_password}
                                onChange={(e) => setSettings({ ...settings, app_password: e.target.value })}
                                placeholder="xxxx-xxxx-xxxx-xxxx"
                                className="mt-1.5"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentProvider.helpText}
                            </p>
                        </div>

                        <div>
                            <Label>Nome do Calendário</Label>
                            <Input
                                value={settings.calendar_name}
                                onChange={(e) => setSettings({ ...settings, calendar_name: e.target.value })}
                                placeholder="Stellar Marketing"
                                className="mt-1.5"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Um calendário com este nome será criado automaticamente
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={testConnection}
                            disabled={testing}
                            className="w-full"
                        >
                            {testing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Shield className="w-4 h-4 mr-2" />
                            )}
                            Testar Conexão
                        </Button>
                    </CardContent>
                </Card>

                {/* Sync Options */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Opções de Sincronização
                        </CardTitle>
                        <CardDescription>
                            Escolha o que será sincronizado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <div>
                                    <Label>Estratégias de Marketing</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Criar eventos para cada estratégia
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.sync_strategies}
                                onCheckedChange={(checked) => setSettings({ ...settings, sync_strategies: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <div>
                                    <Label>Sub-tarefas</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Sincronizar tarefas individuais
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.sync_tasks}
                                onCheckedChange={(checked) => setSettings({ ...settings, sync_tasks: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <Label>Lembretes</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Receber notificações antes do evento
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.sync_reminders}
                                onCheckedChange={(checked) => setSettings({ ...settings, sync_reminders: checked })}
                            />
                        </div>

                        {settings.sync_reminders && (
                            <div className="pl-8 border-l-2 border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <Label>Lembrar {settings.reminder_hours_before}h antes</Label>
                                </div>
                                <Slider
                                    value={[settings.reminder_hours_before]}
                                    onValueChange={([value]) => setSettings({ ...settings, reminder_hours_before: value })}
                                    min={1}
                                    max={72}
                                    step={1}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>1 hora</span>
                                    <span>72 horas</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={loadSettings}>
                    Cancelar
                </Button>
                <Button onClick={saveSettings} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}
