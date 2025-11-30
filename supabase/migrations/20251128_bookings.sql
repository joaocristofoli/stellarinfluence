-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company/Brand info
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Campaign details
  campaign_brief TEXT NOT NULL,
  budget_range TEXT, -- e.g., "R$ 5.000 - R$ 10.000"
  preferred_timeline TEXT,
  
  -- Preferences
  preferred_platforms JSONB DEFAULT '[]'::jsonb, -- ["instagram", "youtube"]
  target_audience TEXT,
  campaign_goals TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, reviewing, approved, rejected, completed
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create booking_creators junction table (requested creators)
CREATE TABLE public.booking_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_creators ENABLE ROW LEVEL SECURITY;

-- Anyone can create bookings (public form)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view and manage all bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Booking creators policies
CREATE POLICY "Anyone can add creators to bookings on creation"
  ON public.booking_creators FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view booking creators"
  ON public.booking_creators FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers
CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
