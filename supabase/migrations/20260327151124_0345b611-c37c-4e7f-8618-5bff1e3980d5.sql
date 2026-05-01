
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- News articles
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL DEFAULT '',
  title_hi TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  body_hi TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  meta_title_en TEXT DEFAULT '',
  meta_title_hi TEXT DEFAULT '',
  meta_description_en TEXT DEFAULT '',
  meta_description_hi TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published news readable by everyone"
  ON public.news_articles FOR SELECT USING (status = 'published' OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Admins can insert news"
  ON public.news_articles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can update news"
  ON public.news_articles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete news"
  ON public.news_articles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Leadership profiles
CREATE TABLE public.leadership_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL DEFAULT '',
  name_hi TEXT NOT NULL DEFAULT '',
  designation_en TEXT NOT NULL DEFAULT '',
  designation_hi TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  bio_hi TEXT NOT NULL DEFAULT '',
  photo_url TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leadership_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership profiles readable by everyone"
  ON public.leadership_profiles FOR SELECT USING (true);
CREATE POLICY "Admins can insert leadership"
  ON public.leadership_profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update leadership"
  ON public.leadership_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete leadership"
  ON public.leadership_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL DEFAULT '',
  title_hi TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  event_date TIMESTAMPTZ,
  location_en TEXT DEFAULT '',
  location_hi TEXT DEFAULT '',
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events readable by everyone"
  ON public.events FOR SELECT USING (status = 'published' OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings readable by everyone"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "Admins can delete media"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER leadership_profiles_updated_at
  BEFORE UPDATE ON public.leadership_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
