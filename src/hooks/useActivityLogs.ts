import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActivityLogs = (limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'activity_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useLogActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      details,
    }: {
      action: string;
      entityType: string;
      entityId?: string;
      details?: Record<string, unknown>;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase.from('activity_logs').insert({
        user_id: userData.user.id,
        action,
        entity_type: entityType,
        entity_id: entityId ?? null,
        details: details ?? {},
      });
      if (error) console.error('Activity log error:', error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] }),
  });
};
