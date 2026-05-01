import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logCmsActivity } from '@/lib/audit';

export const useUpdateSubmissionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'activity_logs'] });
      void logCmsActivity({
        action: 'update',
        entityType: 'submission',
        entityId: typeof variables.id === 'string'
          ? variables.id
          : (typeof data?.id === 'string' ? data.id : undefined),
      });
    },
  });
};
type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
type MembershipStatus = 'new' | 'approved' | 'rejected' | 'pending';

export const useContactSubmissions = (status?: string) => {
  return useQuery({
    queryKey: ['admin', 'contacts', status],
    queryFn: async () => {
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useMembershipApplications = (status?: string, district?: string) => {
  return useQuery({
    queryKey: ['admin', 'memberships', status, district],
    queryFn: async () => {
      let query = supabase
        .from('membership_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useUpdateContactStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'contacts'] }),
  });
};

export const useUpdateMembershipStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MembershipStatus }) => {
      const { data, error } = await supabase
        .from('membership_applications')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'memberships'] }),
  });
};
