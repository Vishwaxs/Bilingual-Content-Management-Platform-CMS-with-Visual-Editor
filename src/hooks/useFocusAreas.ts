import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logCmsActivity } from '@/lib/audit';

export const useFocusAreas = () => {
  return useQuery({
    queryKey: ['focus_areas', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_areas')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminFocusAreas = () => {
  return useQuery({
    queryKey: ['admin', 'focus_areas', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_areas')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useCreateFocusArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (area: {
      title_en: string; title_hi: string;
      description_en: string; description_hi: string;
      icon?: string; display_order?: number; is_active?: boolean;
    }) => {
      const { data, error } = await supabase.from('focus_areas').insert(area).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'create',
        entityType: 'focus_area',
        entityId: typeof data?.id === 'string' ? data.id : undefined,
      });
    },
  });
};

export const useUpdateFocusArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('focus_areas')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'focus_area',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};

export const useDeleteFocusArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('focus_areas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'focus_areas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'delete',
        entityType: 'focus_area',
        entityId: id,
      });
    },
  });
};
