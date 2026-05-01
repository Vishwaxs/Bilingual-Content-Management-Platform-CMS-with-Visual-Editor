-- ============================================================
-- Migration: Create cms_content + cms_content_history tables
-- Prerequisites: auth.users, user_roles with superadmin enum value,
--   has_role() and is_superadmin() functions
--   (all from migration 20260417010000)
-- Idempotent: all DDL uses IF NOT EXISTS / CREATE OR REPLACE
-- ============================================================

-- ============================================================
-- 1. cms_content table — stores all frontend-editable content
-- Key format: "section:element:property"
-- Examples: "hero:title_line1:text_en", "about:body:text_hi"
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cms_content (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text        NOT NULL UNIQUE
                          CHECK (key ~ '^[a-z0-9_]+:[a-z0-9_]+:[a-z0-9_]+$'),
  value       text        NOT NULL DEFAULT '',
  type        text        NOT NULL DEFAULT 'text'
                          CHECK (type IN ('text','text_hi','image_url','color','number','boolean','richtext','url')),
  label       text        NOT NULL DEFAULT '',
  section     text        NOT NULL DEFAULT '',
  description text,
  is_locked   boolean     NOT NULL DEFAULT false,
  updated_by  uuid        REFERENCES auth.users(id),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Public can read ALL cms_content (it's frontend content)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content'
      AND policyname = 'Public read cms_content'
  ) THEN
    CREATE POLICY "Public read cms_content"
      ON public.cms_content FOR SELECT USING (true);
  END IF;
END $$;

-- Only superadmin can write cms_content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content'
      AND policyname = 'Superadmin manage cms_content'
  ) THEN
    CREATE POLICY "Superadmin manage cms_content"
      ON public.cms_content FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_cms_section ON public.cms_content(section);
CREATE INDEX IF NOT EXISTS idx_cms_key     ON public.cms_content(key);


-- ============================================================
-- 2. cms_content_history — full edit history for undo/revert
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cms_content_history (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id       uuid        NOT NULL REFERENCES public.cms_content(id) ON DELETE CASCADE,
  key              text        NOT NULL,
  old_value        text        NOT NULL,
  new_value        text        NOT NULL,
  changed_by       uuid        REFERENCES auth.users(id),
  changed_by_email text,
  changed_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_content_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content_history'
      AND policyname = 'Superadmin read history'
  ) THEN
    CREATE POLICY "Superadmin read history"
      ON public.cms_content_history FOR SELECT
      USING (public.has_role(auth.uid(), 'superadmin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content_history'
      AND policyname = 'System insert history'
  ) THEN
    CREATE POLICY "System insert history"
      ON public.cms_content_history FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cms_history_content
  ON public.cms_content_history(content_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_history_changed_at
  ON public.cms_content_history(changed_at DESC);


-- ============================================================
-- 3. Trigger: auto-log history on every cms_content UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_cms_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO public.cms_content_history
      (content_id, key, old_value, new_value, changed_by, changed_by_email, changed_at)
    VALUES
      (OLD.id, OLD.key, OLD.value, NEW.value, auth.uid(),
       (SELECT email FROM auth.users WHERE id = auth.uid()),
       now());
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_content_history_trigger ON public.cms_content;
CREATE TRIGGER cms_content_history_trigger
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW EXECUTE FUNCTION public.log_cms_history();


-- ============================================================
-- 4. Realtime publication — add cms_content
-- ============================================================
-- Supabase manages the supabase_realtime publication.
-- We just add cms_content to it if not already present.
-- Using ALTER ... ADD TABLE is additive and won't disrupt existing tables.
DO $$
BEGIN
  -- Check if cms_content is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'cms_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_content;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- Publication doesn't exist yet — Supabase will create it.
    -- We can't create it here because Supabase manages it.
    RAISE NOTICE 'supabase_realtime publication not found; enable realtime for cms_content in Supabase Dashboard → Database → Replication';
END $$;

