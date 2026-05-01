import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logCmsActivity } from '@/lib/audit';

export const useLeadershipProfiles = (activeOnly = true) => {
  return useQuery({
    queryKey: ['leadership', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('leadership_profiles')
        .select('*')
        .order('display_order', { ascending: true });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateLeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leader: {
      name_en: string; name_hi: string;
      designation_en: string; designation_hi: string;
      bio_en: string; bio_hi: string;
      photo_url?: string; display_order?: number;
    }) => {
      const { data, error } = await supabase.from('leadership_profiles').insert(leader).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leadership'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'create',
        entityType: 'leadership_profile',
        entityId: typeof data?.id === 'string' ? data.id : undefined,
      });
    },
  });
};

export const useUpdateLeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('leadership_profiles')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['leadership'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'leadership_profile',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};

export const useDeleteLeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leadership_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['leadership'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'delete',
        entityType: 'leadership_profile',
        entityId: id,
      });
    },
  });
};
