import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeHtml, sanitizeSlug, sanitizeText, sanitizeUrl } from '@/lib/security/sanitize';
import { logCmsActivity } from '@/lib/audit';

type EventMutationInput = {
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  slug?: string;
  event_date?: string | null;
  event_time?: string;
  location_en?: string;
  location_hi?: string;
  cover_image?: string;
  status?: string;
};

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

const normalizeEventPayload = (payload: EventMutationInput): EventMutationInput => ({
  ...payload,
  title_en: sanitizeText(payload.title_en, 200),
  title_hi: sanitizeText(payload.title_hi, 200),
  description_en: sanitizeHtml(payload.description_en),
  description_hi: sanitizeHtml(payload.description_hi),
  slug: payload.slug ? sanitizeSlug(payload.slug) : undefined,
  event_time: payload.event_time ? sanitizeText(payload.event_time, 50) : '',
  location_en: payload.location_en ? sanitizeText(payload.location_en, 200) : '',
  location_hi: payload.location_hi ? sanitizeText(payload.location_hi, 200) : '',
  cover_image: payload.cover_image ? sanitizeUrl(payload.cover_image) : '',
});

const normalizeEventUpdates = (updates: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...updates };

  if (typeof normalized.title_en === 'string') normalized.title_en = sanitizeText(normalized.title_en, 200);
  if (typeof normalized.title_hi === 'string') normalized.title_hi = sanitizeText(normalized.title_hi, 200);
  if (typeof normalized.description_en === 'string') normalized.description_en = sanitizeHtml(normalized.description_en);
  if (typeof normalized.description_hi === 'string') normalized.description_hi = sanitizeHtml(normalized.description_hi);
  if (typeof normalized.slug === 'string') normalized.slug = sanitizeSlug(normalized.slug);
  if (typeof normalized.event_time === 'string') normalized.event_time = sanitizeText(normalized.event_time, 50);
  if (typeof normalized.location_en === 'string') normalized.location_en = sanitizeText(normalized.location_en, 200);
  if (typeof normalized.location_hi === 'string') normalized.location_hi = sanitizeText(normalized.location_hi, 200);
  if (typeof normalized.cover_image === 'string') normalized.cover_image = sanitizeUrl(normalized.cover_image);

  return normalized;
};

export const useUpcomingEvents = (limit?: number) => {
  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: async () => {
      const today = getTodayIsoDate();
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('event_date', today)
        .order('event_date', { ascending: true });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePastEvents = (limit?: number) => {
  return useQuery({
    queryKey: ['events', 'past', limit],
    queryFn: async () => {
      const today = getTodayIsoDate();
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .lt('event_date', today)
        .order('event_date', { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllEvents = () => {
  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['events', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Admin hooks
export const useAdminEventsList = () => {
  return useQuery({
    queryKey: ['admin', 'events', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useAdminEvent = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: EventMutationInput) => {
      const normalized = normalizeEventPayload(event);
      const { data, error } = await supabase.from('events').insert(normalized).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'create',
        entityType: 'event',
        entityId: typeof data?.id === 'string' ? data.id : undefined,
        details: {
          slug: variables.slug,
          status: variables.status,
        },
      });
    },
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const normalizedUpdates = normalizeEventUpdates(updates as Record<string, unknown>);
      const { data, error } = await supabase
        .from('events')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'event',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'delete',
        entityType: 'event',
        entityId: id,
      });
    },
  });
};
