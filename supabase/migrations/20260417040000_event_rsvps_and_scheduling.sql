-- Event RSVP System
-- Allows visitors to register attendance for upcoming events

-- ─── RSVP table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT,
  attendees_count INT DEFAULT 1 CHECK (attendees_count >= 1 AND attendees_count <= 20),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate RSVPs from the same phone for the same event
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_rsvp_unique
  ON public.event_rsvps (event_id, phone);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id
  ON public.event_rsvps (event_id);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public RSVP form)
CREATE POLICY "Anyone can RSVP" ON public.event_rsvps
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read RSVPs
CREATE POLICY "Admins can read RSVPs" ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- Only admins can delete RSVPs
CREATE POLICY "Admins can delete RSVPs" ON public.event_rsvps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- ─── Content scheduling column ────────────────────────────────
-- For GAP 1: Schedule articles to publish at a future date
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
