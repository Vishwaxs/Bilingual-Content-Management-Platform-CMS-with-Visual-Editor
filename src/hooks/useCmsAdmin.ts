import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────
export interface CmsContentRow {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  section: string;
  description: string | null;
  is_locked: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface CmsHistoryRow {
  id: string;
  content_id: string;
  key: string;
  old_value: string;
  new_value: string;
  changed_by: string | null;
  changed_by_email: string | null;
  changed_at: string;
}

// ─── Admin: Read all CMS content ─────────────────────────────
export const useAdminCmsContent = (section?: string) => {
  return useQuery({
    queryKey: ['admin', 'cms-content', section],
    queryFn: async () => {
      let query = supabase
        .from('cms_content' as any)
        .select('*')
        .order('section', { ascending: true })
        .order('key', { ascending: true });
      if (section) query = query.eq('section', section);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as CmsContentRow[];
    },
    staleTime: 30_000,
  });
};

// ─── Admin: Update one CMS content row ────────────────────────
export const useUpdateCmsContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { data, error } = await supabase
        .from('cms_content' as any)
        .update({ value } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CmsContentRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cms-content'] });
      qc.invalidateQueries({ queryKey: ['cms'] }); // frontend cache too
    },
  });
};

// ─── Admin: Read CMS content history ──────────────────────────
export const useCmsContentHistory = (limit = 50) => {
  return useQuery({
    queryKey: ['admin', 'cms-history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content_history' as any)
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as CmsHistoryRow[];
    },
    staleTime: 30_000,
  });
};

// ─── Admin: Revert a CMS content value ────────────────────────
export const useRevertCmsContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contentId, oldValue }: { contentId: string; oldValue: string }) => {
      const { data, error } = await supabase
        .from('cms_content' as any)
        .update({ value: oldValue } as any)
        .eq('id', contentId)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CmsContentRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cms-content'] });
      qc.invalidateQueries({ queryKey: ['admin', 'cms-history'] });
      qc.invalidateQueries({ queryKey: ['cms'] });
    },
  });
};

// ─── Admin: Get all unique sections ───────────────────────────
export const useCmsSections = () => {
  return useQuery({
    queryKey: ['admin', 'cms-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content' as any)
        .select('section');
      if (error) throw error;
      const rows = (data ?? []) as unknown as { section: string }[];
      return [...new Set(rows.map(r => r.section))].sort();
    },
    staleTime: 5 * 60_000,
  });
};
