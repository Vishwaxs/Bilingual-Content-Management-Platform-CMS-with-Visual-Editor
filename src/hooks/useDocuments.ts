import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText, sanitizeUrl } from '@/lib/security/sanitize';
import { logCmsActivity } from '@/lib/audit';

const DOCUMENT_CATEGORIES = new Set(['circular', 'report', 'policy', 'press', 'other']);

type DocumentMutationInput = {
  title_en: string;
  title_hi?: string;
  category: string;
  file_url: string;
  file_size?: number | null;
  is_public?: boolean;
};

const normalizeDocumentCategory = (value: string) => {
  return DOCUMENT_CATEGORIES.has(value) ? value : 'other';
};

const normalizeDocumentPayload = (doc: DocumentMutationInput): DocumentMutationInput => ({
  ...doc,
  title_en: sanitizeText(doc.title_en, 200),
  title_hi: sanitizeText(doc.title_hi ?? '', 200),
  category: normalizeDocumentCategory(doc.category),
  file_url: sanitizeUrl(doc.file_url),
  file_size: typeof doc.file_size === 'number' && Number.isFinite(doc.file_size) && doc.file_size >= 0
    ? doc.file_size
    : 0,
});

const normalizeDocumentUpdates = (updates: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...updates };

  if (typeof normalized.title_en === 'string') normalized.title_en = sanitizeText(normalized.title_en, 200);
  if (typeof normalized.title_hi === 'string') normalized.title_hi = sanitizeText(normalized.title_hi, 200);
  if (typeof normalized.category === 'string') normalized.category = normalizeDocumentCategory(normalized.category);
  if (typeof normalized.file_url === 'string') normalized.file_url = sanitizeUrl(normalized.file_url);
  if (typeof normalized.file_size === 'number') {
    normalized.file_size = Number.isFinite(normalized.file_size) && normalized.file_size >= 0
      ? normalized.file_size
      : 0;
  }

  return normalized;
};

export const usePublicDocuments = (category?: string) => {
  return useQuery({
    queryKey: ['documents', 'public', category],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((doc) => ({
        ...doc,
        file_url: sanitizeUrl(doc.file_url ?? ''),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminDocumentsList = () => {
  return useQuery({
    queryKey: ['admin', 'documents', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useAdminDocument = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        file_url: sanitizeUrl(data.file_url ?? ''),
      };
    },
    enabled: !!id,
  });
};

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: DocumentMutationInput) => {
      const normalized = normalizeDocumentPayload(doc);
      const { data, error } = await supabase.from('documents').insert(normalized).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'create',
        entityType: 'document',
        entityId: typeof data?.id === 'string' ? data.id : undefined,
        details: {
          category: variables.category,
          is_public: variables.is_public,
        },
      });
    },
  });
};

export const useUpdateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const normalizedUpdates = normalizeDocumentUpdates(updates);
      const { data, error } = await supabase
        .from('documents')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'document',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'documents'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'delete',
        entityType: 'document',
        entityId: id,
      });
    },
  });
};
