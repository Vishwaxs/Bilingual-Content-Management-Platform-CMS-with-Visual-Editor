import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────
export type AdminRole = 'admin' | 'superadmin';

export interface AdminUser {
  user: User;
  role: AdminRole;
  isSuperAdmin: boolean;
  isAdmin: boolean; // true for BOTH admin and superadmin
}

// ─── Core auth query ──────────────────────────────────────────
export function useAdminUser() {
  return useQuery({
    queryKey: ['auth', 'admin-user'],
    queryFn: async (): Promise<AdminUser | null> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !roleData) return null;

      const role = roleData.role as string;
      if (!['admin', 'superadmin'].includes(role)) return null;

      return {
        user,
        role: role as AdminRole,
        isSuperAdmin: role === 'superadmin',
        isAdmin: true, // both roles are admins
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ─── Convenience hooks ────────────────────────────────────────
export function useIsSuperAdmin() {
  const { data } = useAdminUser();
  return data?.isSuperAdmin ?? false;
}

export function useIsAdmin() {
  const { data } = useAdminUser();
  return data?.isAdmin ?? false;
}

export function useCurrentRole(): AdminRole | null {
  const { data } = useAdminUser();
  return data?.role ?? null;
}

// ─── Login mutation ───────────────────────────────────────────
export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check role exists
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('No admin role assigned to this account. Contact the system administrator.');
      }

      const role = roleData.role as string;
      if (!['admin', 'superadmin'].includes(role)) {
        await supabase.auth.signOut();
        throw new Error('Insufficient permissions. Admin access required.');
      }

      // Log the login
      await supabase.from('activity_logs').insert({
        user_id: data.user.id,
        action: 'login',
        entity_type: 'auth',
        entity_id: data.user.id,
        details: { role, email: data.user.email },
      });

      return { user: data.user, role: role as AdminRole };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

// ─── Logout ───────────────────────────────────────────────────
export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'logout',
          entity_type: 'auth',
          entity_id: user.id,
          details: { email: user.email },
        });
      }
      return supabase.auth.signOut();
    },
    onSuccess: () => {
      qc.clear(); // Clear ALL cached data on logout
      window.location.href = '/admin/login';
    },
  });
}

// ─── Password change ──────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      if (newPassword.length < 12) throw new Error('Password must be at least 12 characters');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  });
}

// ─── Auth state listener (app-level) ──────────────────────────
export function useAuthStateListener() {
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        qc.invalidateQueries({ queryKey: ['auth'] });
      }
    });
    return () => subscription.unsubscribe();
  }, [qc]);
}

// ─── Backward-compatible exports ──────────────────────────────
// These are used by AdminSidebar (useCurrentUser, useLogout)
// and AdminLogin (useLogin). Keep for smooth migration.

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

export const useLogin = () => {
  const adminLogin = useAdminLogin();
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await adminLogin.mutateAsync({ email, password });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      return false;
    }
  }, [adminLogin]);

  return { login, loading: adminLogin.isPending, error };
};

export const useLogout = () => {
  const adminLogout = useAdminLogout();
  const logout = useCallback(async () => {
    await adminLogout.mutateAsync();
  }, [adminLogout]);
  return { logout };
};
