-- ============================================================
-- Migration: Superadmin functions, RLS policies for all tables
-- Prerequisites: app_role enum with 'superadmin' value committed
--   (from migration 20260417010000)
-- Idempotent: CREATE OR REPLACE + IF NOT EXISTS guards
-- ============================================================

-- 1. Rebuild has_role() (unchanged logic, just ensure it's current)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Create is_superadmin() helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  );
$$;

-- 3. Superadmin can view all user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Superadmins can view all roles'
  ) THEN
    CREATE POLICY "Superadmins can view all roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- 4. Superadmin can manage user_roles (insert/update/delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Superadmins can manage roles'
  ) THEN
    CREATE POLICY "Superadmins can manage roles"
      ON public.user_roles
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- 5. Superadmin RLS policies for all existing tables
-- (additive — existing admin policies remain untouched)

-- news_articles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='news_articles' AND policyname='Superadmins can manage news') THEN
    CREATE POLICY "Superadmins can manage news"
      ON public.news_articles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- leadership_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leadership_profiles' AND policyname='Superadmins can manage leadership') THEN
    CREATE POLICY "Superadmins can manage leadership"
      ON public.leadership_profiles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Superadmins can manage events') THEN
    CREATE POLICY "Superadmins can manage events"
      ON public.events FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- documents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Superadmins can manage documents') THEN
    CREATE POLICY "Superadmins can manage documents"
      ON public.documents FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- contact_submissions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_submissions' AND policyname='Superadmins can manage contacts') THEN
    CREATE POLICY "Superadmins can manage contacts"
      ON public.contact_submissions FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- membership_applications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='membership_applications' AND policyname='Superadmins can manage memberships') THEN
    CREATE POLICY "Superadmins can manage memberships"
      ON public.membership_applications FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- activity_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='activity_logs' AND policyname='Superadmins can manage activity logs') THEN
    CREATE POLICY "Superadmins can manage activity logs"
      ON public.activity_logs FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- site_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='Superadmins can manage settings') THEN
    CREATE POLICY "Superadmins can manage settings"
      ON public.site_settings FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- focus_areas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='focus_areas' AND policyname='Superadmins can manage focus areas') THEN
    CREATE POLICY "Superadmins can manage focus areas"
      ON public.focus_areas FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Superadmins can manage profiles') THEN
    CREATE POLICY "Superadmins can manage profiles"
      ON public.profiles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- storage (all buckets)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Superadmins full storage access') THEN
    CREATE POLICY "Superadmins full storage access"
      ON storage.objects FOR ALL TO authenticated
      USING (public.is_superadmin())
      WITH CHECK (public.is_superadmin());
  END IF;
END $$;
