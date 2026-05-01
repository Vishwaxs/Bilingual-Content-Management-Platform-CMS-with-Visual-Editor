import { useState } from 'react';
import { useAdminProfiles } from '@/hooks/useUsers';
import { useIsSuperAdmin } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Shield, UserPlus, ChevronDown, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ROLE_OPTIONS = ['admin', 'superadmin'] as const;

const ROLE_BADGE_STYLES: Record<string, string> = {
  superadmin: 'bg-[#FF6B00]/15 text-[#FF9933] border-[#FF6B00]/30',
  admin:      'bg-blue-100 text-blue-700 border-blue-200',
  editor:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  viewer:     'bg-gray-100 text-gray-600 border-gray-200',
};

const UsersManager = () => {
  const isSuperAdmin = useIsSuperAdmin();
  const { data: users, isLoading, refetch } = useAdminProfiles();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // ─── Change role mutation ───────────────────────────────
  const changeRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing roles for this user
      const { error: delError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delError) throw delError;

      // Insert new role
      const { error: insError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      if (insError) throw insError;
    },
    onSuccess: () => {
      toast.success('Role updated successfully');
      qc.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
    onError: (e) => toast.error(`Failed to update role: ${e.message}`),
  });

  // ─── Filter users by search ─────────────────────────────
  const filtered = (users ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q)) || u.id.includes(q);
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">This page requires Super Admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#FF9933]" /> User Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage admin users and their roles</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowInvite(!showInvite)}
          className="bg-[#FF6B00] hover:bg-[#E55A00] text-white"
        >
          <UserPlus className="h-4 w-4 mr-1" /> Invite Admin
        </Button>
      </div>

      {/* Invite panel */}
      {showInvite && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Invite New Admin</h3>
          <p className="text-[11px] text-muted-foreground">
            The user must already have a Supabase auth account. Enter their email to assign an admin role.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!inviteEmail.includes('@')}
              onClick={() => {
                toast.info('Invite flow requires Edge Function integration. For now, add roles directly in Supabase Dashboard → user_roles table.');
                setInviteEmail('');
                setShowInvite(false);
              }}
            >
              Send Invite
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">User</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">User ID</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Joined</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const primaryRole = user.roles[0] ?? 'none';
                return (
                  <TableRow key={user.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(user.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.full_name || 'Unnamed'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}…</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.roles.map((r) => (
                          <Badge
                            key={r}
                            variant="outline"
                            className={`text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE_STYLES[r] ?? ROLE_BADGE_STYLES.viewer}`}
                          >
                            {r === 'superadmin' && '⚡ '}{r}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">No role</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select
                          value={primaryRole}
                          onChange={(e) => {
                            if (e.target.value !== primaryRole) {
                              changeRole.mutate({ userId: user.id, newRole: e.target.value });
                            }
                          }}
                          className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground
                            focus:ring-1 focus:ring-[#FF6B00] outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <option value="none" disabled>Set role…</option>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {search ? 'No users match your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''} total
      </p>
    </div>
  );
};

export default UsersManager;
