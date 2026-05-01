import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeHtml, sanitizeSlug, sanitizeText, sanitizeUrl } from '@/lib/security/sanitize';
import { logCmsActivity } from '@/lib/audit';

type NewsMutationInput = {
  title_en: string;
  title_hi: string;
  body_en: string;
  body_hi: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  meta_title_en?: string;
  meta_title_hi?: string;
  meta_description_en?: string;
  meta_description_hi?: string;
  featured_image?: string;
  published_at?: string;
  author_id?: string;
};

const normalizeNewsPayload = (payload: NewsMutationInput): NewsMutationInput => ({
  ...payload,
  title_en: sanitizeText(payload.title_en, 200),
  title_hi: sanitizeText(payload.title_hi, 200),
  body_en: sanitizeHtml(payload.body_en),
  body_hi: sanitizeHtml(payload.body_hi),
  slug: sanitizeSlug(payload.slug),
  meta_title_en: sanitizeText(payload.meta_title_en ?? '', 70),
  meta_title_hi: sanitizeText(payload.meta_title_hi ?? '', 70),
  meta_description_en: sanitizeText(payload.meta_description_en ?? '', 170),
  meta_description_hi: sanitizeText(payload.meta_description_hi ?? '', 170),
  featured_image: sanitizeUrl(payload.featured_image ?? ''),
});

const normalizeNewsUpdates = (updates: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...updates };

  if (typeof normalized.title_en === 'string') normalized.title_en = sanitizeText(normalized.title_en, 200);
  if (typeof normalized.title_hi === 'string') normalized.title_hi = sanitizeText(normalized.title_hi, 200);
  if (typeof normalized.body_en === 'string') normalized.body_en = sanitizeHtml(normalized.body_en);
  if (typeof normalized.body_hi === 'string') normalized.body_hi = sanitizeHtml(normalized.body_hi);
  if (typeof normalized.slug === 'string') normalized.slug = sanitizeSlug(normalized.slug);
  if (typeof normalized.meta_title_en === 'string') normalized.meta_title_en = sanitizeText(normalized.meta_title_en, 70);
  if (typeof normalized.meta_title_hi === 'string') normalized.meta_title_hi = sanitizeText(normalized.meta_title_hi, 70);
  if (typeof normalized.meta_description_en === 'string') normalized.meta_description_en = sanitizeText(normalized.meta_description_en, 170);
  if (typeof normalized.meta_description_hi === 'string') normalized.meta_description_hi = sanitizeText(normalized.meta_description_hi, 170);
  if (typeof normalized.featured_image === 'string') normalized.featured_image = sanitizeUrl(normalized.featured_image);

  return normalized;
};

type PublishedNewsPageParams = {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
};

const normalizeSearchTerm = (term: string) => {
  return term.trim().replace(/[%,]/g, ' ').replace(/\s+/g, ' ').slice(0, 100);
};

export const usePublishedNews = (limit?: number) => {
  return useQuery({
    queryKey: ['news', 'published', limit],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', nowIso)
        .order('published_at', { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublishedNewsPage = ({ page, pageSize, category, search }: PublishedNewsPageParams) => {
  return useQuery({
    queryKey: ['news', 'published', 'page', page, pageSize, category, search],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const safePage = Math.max(1, page);
      const safePageSize = Math.max(1, Math.min(24, pageSize));
      const from = (safePage - 1) * safePageSize;
      const to = from + safePageSize - 1;
      const searchTerm = normalizeSearchTerm(search ?? '');

      let query = supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .lte('published_at', nowIso);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        const pattern = `%${searchTerm}%`;
        query = query.or(`title_en.ilike.${pattern},title_hi.ilike.${pattern},excerpt_en.ilike.${pattern},excerpt_hi.ilike.${pattern}`);
      }

      query = query.order('published_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const total = count ?? 0;

      return {
        items: data ?? [],
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil(total / safePageSize),
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useNewsBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['news', 'slug', slug],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', nowIso)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useAllNews = () => {
  return useQuery({
    queryKey: ['news', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: NewsMutationInput) => {
      const normalized = normalizeNewsPayload(article);
      const { data, error } = await supabase.from('news_articles').insert([normalized]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'create',
        entityType: 'news_article',
        entityId: typeof data?.id === 'string' ? data.id : undefined,
        details: {
          slug: variables.slug,
          status: variables.status,
        },
      });
    },
  });
};

export const useUpdateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const normalizedUpdates = normalizeNewsUpdates(updates as Record<string, unknown>);
      const { data, error } = await supabase
        .from('news_articles')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'news_article',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};

export const useDeleteNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news_articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'delete',
        entityType: 'news_article',
        entityId: id,
      });
    },
  });
};
