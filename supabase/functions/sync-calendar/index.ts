// Supabase Edge Function: sync-calendar
// Handles CalDAV integration with Apple Calendar, Google Calendar, and Outlook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarSettings {
    caldav_url: string;
    username: string;
    app_password: string;
    calendar_name: string;
    sync_strategies: boolean;
    sync_tasks: boolean;
    sync_reminders: boolean;
    reminder_hours_before: number;
}

interface SyncRequest {
    action: 'test' | 'sync_all' | 'sync_item';
    user_id?: string;
    settings?: Partial<CalendarSettings>;
    item?: {
        type: 'strategy' | 'task';
        id: string;
        operation: 'create' | 'update' | 'delete';
    };
}

// CalDAV XML Templates
const PROPFIND_CALENDAR = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname />
    <cs:getctag />
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`;

function generateVEvent(event: {
    uid: string;
    summary: string;
    description: string;
    dtstart: Date;
    dtend: Date;
    reminderMinutes?: number;
}): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Stellar Influence Studio//Marketing Planner//EN
BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.dtstart)}
DTEND:${formatDate(event.dtend)}
SUMMARY:${event.summary}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`;

    if (event.reminderMinutes) {
        ics += `
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT${event.reminderMinutes}M
DESCRIPTION:Lembrete: ${event.summary}
END:VALARM`;
    }

    ics += `
END:VEVENT
END:VCALENDAR`;

    return ics;
}

async function testCalDAVConnection(settings: Partial<CalendarSettings>): Promise<{ success: boolean; error?: string }> {
    try {
        const { caldav_url, username, app_password } = settings;

        if (!caldav_url || !username || !app_password) {
            return { success: false, error: 'Credenciais incompletas' };
        }

        const auth = btoa(`${username}:${app_password}`);

        // Try PROPFIND request to test connection
        const response = await fetch(caldav_url, {
            method: 'PROPFIND',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/xml',
                'Depth': '0',
            },
            body: PROPFIND_CALENDAR,
        });

        if (response.status === 207) {
            return { success: true };
        } else if (response.status === 401) {
            return { success: false, error: 'Credenciais inválidas' };
        } else {
            return { success: false, error: `Erro HTTP ${response.status}` };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erro de conexão' };
    }
}

async function syncAllItems(
    supabase: any,
    userId: string,
    settings: CalendarSettings
): Promise<{ success: boolean; synced_count: number; error?: string }> {
    try {
        let syncedCount = 0;
        const auth = btoa(`${settings.username}:${settings.app_password}`);

        // Get strategies to sync
        if (settings.sync_strategies) {
            const { data: strategies, error } = await supabase
                .from('strategies')
                .select('*, companies(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            for (const strategy of strategies || []) {
                // Parse whenToDo to create date
                const eventDate = parseWhenToDo(strategy.when_to_do);

                const event = {
                    uid: `strategy-${strategy.id}@stellar-influence.com`,
                    summary: `📋 ${strategy.name}`,
                    description: `Empresa: ${strategy.companies?.name || 'N/A'}\nCanal: ${strategy.channel_type}\nOrçamento: R$ ${strategy.budget}\n\n${strategy.description || ''}`,
                    dtstart: eventDate,
                    dtend: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
                    reminderMinutes: settings.sync_reminders ? settings.reminder_hours_before * 60 : undefined,
                };

                const ics = generateVEvent(event);

                // PUT event to CalDAV
                const eventUrl = `${settings.caldav_url}/${settings.calendar_name}/${event.uid}.ics`;

                await fetch(eventUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'text/calendar; charset=utf-8',
                    },
                    body: ics,
                });

                syncedCount++;
            }
        }

        // Get tasks to sync
        if (settings.sync_tasks) {
            const { data: tasks, error } = await supabase
                .from('strategy_tasks')
                .select('*, strategies(name)')
                .eq('completed', false);

            if (error) throw error;

            for (const task of tasks || []) {
                const eventDate = task.due_date ? new Date(task.due_date) : new Date();

                const event = {
                    uid: `task-${task.id}@stellar-influence.com`,
                    summary: `✅ ${task.title}`,
                    description: `Estratégia: ${task.strategies?.name || 'N/A'}\nPrioridade: ${task.priority || 'normal'}`,
                    dtstart: eventDate,
                    dtend: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 min duration
                    reminderMinutes: settings.sync_reminders ? settings.reminder_hours_before * 60 : undefined,
                };

                const ics = generateVEvent(event);
                const eventUrl = `${settings.caldav_url}/${settings.calendar_name}/${event.uid}.ics`;

                await fetch(eventUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'text/calendar; charset=utf-8',
                    },
                    body: ics,
                });

                syncedCount++;
            }
        }

        // Update last sync timestamp
        await supabase
            .from('admin_calendar_settings')
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: 'success',
                last_sync_error: null,
            })
            .eq('user_id', userId);

        return { success: true, synced_count: syncedCount };
    } catch (error: any) {
        // Log error
        await supabase
            .from('admin_calendar_settings')
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: 'error',
                last_sync_error: error.message,
            })
            .eq('user_id', userId);

        return { success: false, synced_count: 0, error: error.message };
    }
}

function parseWhenToDo(whenToDo: string): Date {
    // Try to parse common date formats from the whenToDo field
    // This is a simple parser, can be enhanced
    const now = new Date();

    if (!whenToDo) return now;

    // Try direct date parsing
    const parsed = new Date(whenToDo);
    if (!isNaN(parsed.getTime())) return parsed;

    // Return current date + 7 days as fallback
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const body: SyncRequest = await req.json();
        const { action, user_id, settings, item } = body;

        let result;

        switch (action) {
            case 'test':
                result = await testCalDAVConnection(settings || {});
                break;

            case 'sync_all':
                if (!user_id) {
                    throw new Error('user_id is required for sync_all');
                }

                // Get user's calendar settings
                const { data: userSettings, error } = await supabaseClient
                    .from('admin_calendar_settings')
                    .select('*')
                    .eq('user_id', user_id)
                    .single();

                if (error || !userSettings) {
                    throw new Error('Calendar settings not found');
                }

                if (!userSettings.enabled) {
                    throw new Error('Calendar sync is disabled');
                }

                result = await syncAllItems(supabaseClient, user_id, userSettings as CalendarSettings);
                break;

            case 'sync_item':
                // TODO: Implement single item sync
                result = { success: true, message: 'Item sync not implemented yet' };
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
