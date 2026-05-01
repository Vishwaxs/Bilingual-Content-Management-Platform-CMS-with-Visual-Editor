-- Polls & Surveys System
-- Public polls with anonymous voting via localStorage fingerprint

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en TEXT NOT NULL,
  question_hi TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{id, text_en, text_hi}]
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  voter_fingerprint TEXT NOT NULL, -- sha256 of navigator.userAgent + screen resolution
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent double voting
CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_vote_unique
  ON public.poll_votes (poll_id, voter_fingerprint);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll
  ON public.poll_votes (poll_id, option_id);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: public read active, admin all
CREATE POLICY "Public can view active polls" ON public.polls
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admins manage polls" ON public.polls
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );

-- Votes: public insert, admin read
CREATE POLICY "Anyone can vote" ON public.poll_votes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read votes" ON public.poll_votes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    )
  );
