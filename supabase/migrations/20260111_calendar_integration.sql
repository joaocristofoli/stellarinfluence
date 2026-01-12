-- =========================================================
-- APPLE CALENDAR INTEGRATION - Database Schema
-- =========================================================

-- Table: admin_calendar_settings
-- Stores calendar sync configuration per admin user
CREATE TABLE IF NOT EXISTS public.admin_calendar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Provider settings
    provider TEXT NOT NULL DEFAULT 'apple' CHECK (provider IN ('apple', 'google', 'outlook')),
    caldav_url TEXT DEFAULT 'https://caldav.icloud.com',
    username TEXT, -- iCloud email
    app_password TEXT, -- App-Specific Password (will be encrypted in Edge Function)
    calendar_name TEXT DEFAULT 'Stellar Marketing',
    
    -- Sync options
    sync_strategies BOOLEAN DEFAULT true,
    sync_tasks BOOLEAN DEFAULT true,
    sync_reminders BOOLEAN DEFAULT true,
    reminder_hours_before INTEGER DEFAULT 24,
    
    -- Status
    enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT, -- 'success', 'error', 'pending'
    last_sync_error TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_calendar_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own settings
CREATE POLICY "Users can manage own calendar settings"
    ON public.admin_calendar_settings
    FOR ALL
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_calendar_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_calendar_settings_timestamp ON public.admin_calendar_settings;
CREATE TRIGGER update_calendar_settings_timestamp
    BEFORE UPDATE ON public.admin_calendar_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_settings_updated_at();

-- Table: calendar_sync_log
-- Logs each sync event for debugging
CREATE TABLE IF NOT EXISTS public.calendar_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'strategy_created', 'strategy_updated', 'task_created', etc.
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL, -- 'strategy', 'task'
    calendar_event_id TEXT, -- ID returned from CalDAV
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calendar_sync_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own logs
CREATE POLICY "Users can view own sync logs"
    ON public.calendar_sync_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can manage all logs
CREATE POLICY "Admins can manage all sync logs"
    ON public.calendar_sync_log
    FOR ALL
    USING (public.is_admin());

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_user ON public.calendar_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_entity ON public.calendar_sync_log(entity_type, entity_id);

SELECT 'Calendar integration schema created successfully!' as status;
