import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CmsContentRow } from '@/hooks/useCmsAdmin';

// ─── Fetch all CMS content (used by both frontend + editor) ──
export const useAllCmsContent = () => {
  return useQuery({
    queryKey: ['cms', 'all-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('key');
      if (error) throw error;
      const rows = (data ?? []) as unknown as CmsContentRow[];
      // Build key→row map for O(1) lookups
      const map = new Map<string, CmsContentRow>();
      rows.forEach((r) => map.set(r.key, r));
      return { rows, map };
    },
    staleTime: 2 * 60_000,
  });
};

// ─── Get a single CMS value with fallback (non-edit mode) ────
export const useCmsValue = (
  key: string,
  fallback: string = '',
  pendingEdits?: Map<string, string>,
) => {
  const { data } = useAllCmsContent();

  // Pending edit overrides DB value in edit mode
  if (pendingEdits?.has(key)) return pendingEdits.get(key)!;

  // DB value
  const row = data?.map.get(key);
  return row?.value ?? fallback;
};

// ─── Bilingual text helper ────────────────────────────────────
// Returns the EN or HI value based on current language
export const useCmsText = (
  keyEn: string,
  keyHi: string,
  fallbackEn: string,
  fallbackHi: string,
  lang: 'en' | 'hi',
  pendingEdits?: Map<string, string>,
) => {
  const enVal = useCmsValue(keyEn, fallbackEn, pendingEdits);
  const hiVal = useCmsValue(keyHi, fallbackHi, pendingEdits);
  return lang === 'hi' ? hiVal : enVal;
};

// ─── Save a single CMS value ─────────────────────────────────
export const useSaveCmsValue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Find content row by key to get its ID
      const { data: row, error: findError } = await supabase
        .from('cms_content')
        .select('id')
        .eq('key', key)
        .single();
      if (findError) throw findError;
      const id = row?.id;
      if (!id) throw new Error(`CMS key "${key}" not found`);

      const { error } = await supabase
        .from('cms_content')
        .update({ value })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms'] });
      qc.invalidateQueries({ queryKey: ['admin', 'cms-content'] });
      qc.invalidateQueries({ queryKey: ['admin', 'cms-history'] });
    },
  });
};

// ─── Batch save all pending edits ─────────────────────────────
export const useSaveAllPendingEdits = () => {
  const saveSingle = useSaveCmsValue();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pendingEdits: Map<string, string>) => {
      const entries = Array.from(pendingEdits.entries());
      // Save sequentially to avoid race conditions on the trigger
      for (const [key, value] of entries) {
        await saveSingle.mutateAsync({ key, value });
      }
      return entries.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms'] });
      qc.invalidateQueries({ queryKey: ['admin', 'cms-content'] });
      qc.invalidateQueries({ queryKey: ['admin', 'cms-history'] });
    },
  });
};

// ─── Realtime subscription for cms_content changes ────────────
export const useCmsRealtime = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('cms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cms_content' },
        () => {
          // Invalidate cache on any change to cms_content
          qc.invalidateQueries({ queryKey: ['cms'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
};
