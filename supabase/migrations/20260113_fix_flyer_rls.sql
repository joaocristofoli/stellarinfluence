-- Fix RLS policies for flyer management tables
-- Allow authenticated users to manage their company's flyer campaigns

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage flyer_campaigns" ON flyer_campaigns;
DROP POLICY IF EXISTS "Admins can manage flyer_events" ON flyer_events;
DROP POLICY IF EXISTS "Admins can manage flyer_assignments" ON flyer_assignments;
DROP POLICY IF EXISTS "Admins can manage flyer_managers" ON flyer_managers;

-- FLYER_CAMPAIGNS: Allow authenticated users to manage campaigns for their companies
CREATE POLICY "Authenticated users can view flyer_campaigns"
ON flyer_campaigns FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create flyer_campaigns"
ON flyer_campaigns FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update flyer_campaigns"
ON flyer_campaigns FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete flyer_campaigns"
ON flyer_campaigns FOR DELETE
USING (auth.uid() IS NOT NULL);

-- FLYER_EVENTS: Allow authenticated users to manage events
CREATE POLICY "Authenticated users can view flyer_events"
ON flyer_events FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create flyer_events"
ON flyer_events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update flyer_events"
ON flyer_events FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete flyer_events"
ON flyer_events FOR DELETE
USING (auth.uid() IS NOT NULL);

-- FLYER_ASSIGNMENTS: Allow authenticated users to manage assignments
CREATE POLICY "Authenticated users can view flyer_assignments"
ON flyer_assignments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create flyer_assignments"
ON flyer_assignments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update flyer_assignments"
ON flyer_assignments FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete flyer_assignments"
ON flyer_assignments FOR DELETE
USING (auth.uid() IS NOT NULL);

-- FLYER_MANAGERS: Allow authenticated users to manage managers
CREATE POLICY "Authenticated users can view flyer_managers"
ON flyer_managers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create flyer_managers"
ON flyer_managers FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update flyer_managers"
ON flyer_managers FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete flyer_managers"
ON flyer_managers FOR DELETE
USING (auth.uid() IS NOT NULL);
