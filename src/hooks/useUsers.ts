import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('*');
      if (rErr) throw rErr;

      return (profiles || []).map((p) => ({
        ...p,
        roles: (roles || []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });
};
