-- CMS hardening migration: security policies, role model, constraints, and query indexes

-- ------------------------------------------------------------
-- 1) Role model hardening
-- ------------------------------------------------------------

-- Keep one effective role per user (admin preferred over editor over viewer).
WITH ranked_roles AS (
  SELECT
    id,
    user_id,
    role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'editor' THEN 2
          ELSE 3
        END,
        id
    ) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked_roles rr
WHERE ur.id = rr.id
  AND rr.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_roles_user_id
  ON public.user_roles(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2) Submission path hardening
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can apply for membership" ON public.membership_applications;

-- Edge functions submit using service role; align table shape with optional phone capture.
ALTER TABLE public.contact_submissions
  ALTER COLUMN phone DROP NOT NULL;

-- ------------------------------------------------------------
-- 3) Storage policy hardening (remove broad authenticated writes)
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Auth upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete news images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload leader photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth read documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload documents" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload news images') THEN
    CREATE POLICY "Editors upload news images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'news-images'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors delete news images') THEN
    CREATE POLICY "Editors delete news images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'news-images'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload event images') THEN
    CREATE POLICY "Editors upload event images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'event-images'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload leader photos') THEN
    CREATE POLICY "Editors upload leader photos"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'leader-photos'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors read documents bucket') THEN
    CREATE POLICY "Editors read documents bucket"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'documents'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload documents bucket') THEN
    CREATE POLICY "Editors upload documents bucket"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'documents'
        AND (
          public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'editor')
        )
      );
  END IF;
END $$;

-- ------------------------------------------------------------
-- 4) Domain normalization and constraints
-- ------------------------------------------------------------

UPDATE public.contact_submissions
SET status = 'new'
WHERE status NOT IN ('new', 'read', 'replied', 'archived')
   OR status IS NULL;

UPDATE public.membership_applications
SET status = 'new'
WHERE status NOT IN ('new', 'approved', 'rejected', 'pending')
   OR status IS NULL;

UPDATE public.news_articles
SET category = 'announcement'
WHERE category NOT IN ('event', 'announcement', 'seva', 'cultural', 'political', 'general')
   OR category IS NULL
   OR length(trim(category)) = 0;

UPDATE public.documents
SET category = 'circular'
WHERE category NOT IN ('circular', 'report', 'policy', 'press', 'other')
   OR category IS NULL
   OR length(trim(category)) = 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contact_submissions_status') THEN
    ALTER TABLE public.contact_submissions
      ADD CONSTRAINT chk_contact_submissions_status
      CHECK (status IN ('new', 'read', 'replied', 'archived')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_membership_applications_status') THEN
    ALTER TABLE public.membership_applications
      ADD CONSTRAINT chk_membership_applications_status
      CHECK (status IN ('new', 'approved', 'rejected', 'pending')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_news_articles_category') THEN
    ALTER TABLE public.news_articles
      ADD CONSTRAINT chk_news_articles_category
      CHECK (category IN ('event', 'announcement', 'seva', 'cultural', 'political', 'general')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_documents_category') THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT chk_documents_category
      CHECK (category IN ('circular', 'report', 'policy', 'press', 'other')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_news_published_requirements') THEN
    ALTER TABLE public.news_articles
      ADD CONSTRAINT chk_news_published_requirements
      CHECK (
        status <> 'published'
        OR (
          published_at IS NOT NULL
          AND slug IS NOT NULL
          AND length(trim(slug)) > 0
        )
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_events_published_requirements') THEN
    ALTER TABLE public.events
      ADD CONSTRAINT chk_events_published_requirements
      CHECK (
        status <> 'published'
        OR (
          event_date IS NOT NULL
          AND slug IS NOT NULL
          AND length(trim(slug)) > 0
        )
      ) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.contact_submissions VALIDATE CONSTRAINT chk_contact_submissions_status;
ALTER TABLE public.membership_applications VALIDATE CONSTRAINT chk_membership_applications_status;
ALTER TABLE public.news_articles VALIDATE CONSTRAINT chk_news_articles_category;
ALTER TABLE public.documents VALIDATE CONSTRAINT chk_documents_category;
ALTER TABLE public.news_articles VALIDATE CONSTRAINT chk_news_published_requirements;
ALTER TABLE public.events VALIDATE CONSTRAINT chk_events_published_requirements;

-- ------------------------------------------------------------
-- 5) Query-aligned indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_events_status_date_asc
  ON public.events(status, event_date ASC);

CREATE INDEX IF NOT EXISTS idx_documents_public_created_at
  ON public.documents(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON public.activity_logs(created_at DESC);
