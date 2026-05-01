-- ============================================================
-- ABHM UP — Migration 003: Indexes, RLS hardening, storage, focus_areas
-- Run this in Supabase SQL Editor or via `supabase db push`
-- ============================================================

--- PART 0: FOCUS AREAS TABLE ---
CREATE TABLE IF NOT EXISTS public.focus_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL DEFAULT '',
  title_hi TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🙏',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Focus areas readable by everyone"
  ON public.focus_areas FOR SELECT USING (true);

CREATE POLICY "Admins can manage focus areas"
  ON public.focus_areas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_focus_areas_updated_at
  BEFORE UPDATE ON public.focus_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--- PART 1: PERFORMANCE INDEXES ---

-- news_articles: public queries filter by status and sort by date
CREATE INDEX IF NOT EXISTS idx_news_status_date
  ON public.news_articles(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_slug
  ON public.news_articles(slug);

CREATE INDEX IF NOT EXISTS idx_news_category
  ON public.news_articles(category, status);

-- leadership_profiles: homepage loads active leaders ordered by display_order
CREATE INDEX IF NOT EXISTS idx_leaders_active_order
  ON public.leadership_profiles(display_order ASC) WHERE is_active = true;

-- events: public queries filter upcoming events by date
CREATE INDEX IF NOT EXISTS idx_events_date_status
  ON public.events(event_date DESC, status);

-- activity_logs: admin queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_activity_user_date
  ON public.activity_logs(user_id, created_at DESC);

-- contact_submissions: admin queries by status
CREATE INDEX IF NOT EXISTS idx_contacts_status_date
  ON public.contact_submissions(status, created_at DESC);

-- membership_applications: admin queries by status and district
CREATE INDEX IF NOT EXISTS idx_memberships_status
  ON public.membership_applications(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memberships_district
  ON public.membership_applications(district);

-- focus_areas: ordered display
CREATE INDEX IF NOT EXISTS idx_focus_areas_order
  ON public.focus_areas(display_order ASC) WHERE is_active = true;


--- PART 2: STORAGE BUCKETS ---

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('news-images',   'news-images',   true,  5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('event-images',  'event-images',  true,  5242880,
   ARRAY['image/jpeg','image/png','image/webp']),
  ('leader-photos', 'leader-photos', true,  3145728,
   ARRAY['image/jpeg','image/png','image/webp']),
  ('documents',     'documents',     false, 26214400,
   ARRAY['application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (public read for image buckets, authenticated write)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read news images') THEN
    CREATE POLICY "Public read news images" ON storage.objects
      FOR SELECT USING (bucket_id = 'news-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload news images') THEN
    CREATE POLICY "Auth upload news images" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth delete news images') THEN
    CREATE POLICY "Auth delete news images" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'news-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read event images') THEN
    CREATE POLICY "Public read event images" ON storage.objects
      FOR SELECT USING (bucket_id = 'event-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload event images') THEN
    CREATE POLICY "Auth upload event images" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read leader photos') THEN
    CREATE POLICY "Public read leader photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'leader-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload leader photos') THEN
    CREATE POLICY "Auth upload leader photos" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'leader-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth read documents') THEN
    CREATE POLICY "Auth read documents" ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'documents');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload documents') THEN
    CREATE POLICY "Auth upload documents" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
  END IF;
END $$;
