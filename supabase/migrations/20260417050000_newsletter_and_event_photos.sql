-- Newsletter & Email Subscribers
-- Allows visitors to subscribe to email updates

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  verified BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email
  ON public.email_subscribers (email);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Public subscribe
CREATE POLICY "Anyone can subscribe" ON public.email_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins read all
CREATE POLICY "Admins can read subscribers" ON public.email_subscribers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- Admins can update (mark verified, unsubscribe)
CREATE POLICY "Admins can update subscribers" ON public.email_subscribers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- Admins can delete
CREATE POLICY "Admins can delete subscribers" ON public.email_subscribers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- ─── Event photos table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_photos_event
  ON public.event_photos (event_id, sort_order);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view event photos" ON public.event_photos
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admins manage
CREATE POLICY "Admins manage event photos" ON public.event_photos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );
