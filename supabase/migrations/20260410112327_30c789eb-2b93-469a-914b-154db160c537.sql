
-- Add missing columns to news_articles
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS excerpt_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS excerpt_hi text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'announcement';

-- Add slug to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS cover_image text DEFAULT '',
  ADD COLUMN IF NOT EXISTS event_time text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Documents table
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL DEFAULT '',
  title_hi text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'circular',
  file_url text NOT NULL DEFAULT '',
  file_size bigint DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents readable by everyone" ON public.documents
  FOR SELECT USING (is_public = true OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  district text DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contacts" ON public.contact_submissions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contacts" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit contact" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Membership applications table
CREATE TABLE public.membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  district text NOT NULL DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view memberships" ON public.membership_applications
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update memberships" ON public.membership_applications
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can apply for membership" ON public.membership_applications
  FOR INSERT WITH CHECK (true);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL DEFAULT '',
  entity_type text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
