import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import { useIsSuperAdmin, useCurrentUser } from '@/hooks/useAuth';
import { useAdminAccess } from '@/contexts/useAdminAccess';
import { isSuperAdminRole } from '@/lib/auth/permissions';
import { ExternalLink, Bell, X, Keyboard } from 'lucide-react';
import { useContactSubmissions, useMembershipApplications } from '@/hooks/useSubmissions';
import { useAdminShortcuts } from '@/hooks/useAdminShortcuts';

const AdminLayout = () => {
  const isSuperAdmin = useIsSuperAdmin();
  const { user } = useCurrentUser();
  const { role } = useAdminAccess();

  // Notification badge counts
  const { data: contacts } = useContactSubmissions();
  const { data: memberships } = useMembershipApplications();
  const newContacts = contacts?.filter(c => c.status === 'new').length || 0;
  const newMembers = memberships?.filter(m => m.status === 'new').length || 0;
  const notifCount = newContacts + newMembers;
  const { shortcuts, showHelp, setShowHelp } = useAdminShortcuts();

  return (
    <>
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Admin Top Bar */}
          <header className="h-14 flex items-center border-b border-border px-4 bg-[#0B1F3A] text-white gap-3 sticky top-0 z-50">
            <SidebarTrigger className="mr-2 text-white/70 hover:text-white" />
            <span className="font-display text-sm font-semibold text-white/90">ABHM UP</span>
            <span className="text-white/30 text-xs hidden sm:inline">Admin Panel</span>

            <div className="flex-1" />

            {/* SuperAdmin: Edit Live Site button */}
            {isSuperAdmin && (
              <button
                onClick={() => window.open('/?edit_mode=true', '_blank')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg
                  bg-gradient-to-r from-[#FF6B00] to-[#FF9933] text-white
                  shadow-lg shadow-[#FF6B00]/25 hover:brightness-110 hover:-translate-y-0.5 transition-all"
              >
                🎨 Edit Live Site
              </button>
            )}

            {/* Role badge */}
            {isSuperAdmin ? (
              <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF9933] border border-[#FF6B00]/30">
                Super Admin
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                Admin
              </span>
            )}

            {/* Notification bell */}
            <button className="relative p-1.5 text-white/50 hover:text-white transition-colors" title={`${notifCount} new items`}>
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF6B00] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            {/* Exit to site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> Site
            </a>

            {/* User email (truncated) */}
            <span className="text-[11px] text-white/30 truncate max-w-[120px] hidden md:inline">
              {user?.email}
            </span>
          </header>
          <main className="flex-1 p-6 bg-muted">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>

    {/* Shortcuts Help Modal */}
    {showHelp && (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowHelp(false); }}
      >
        <div style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
          padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Keyboard style={{ width: 16, height: 16, color: '#FF6B00' }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Keyboard Shortcuts</span>
            </div>
            <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 16, height: 16, color: '#9ca3af' }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {shortcuts.map((s) => (
              <div key={s.keys} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', background: '#f9fafb', borderRadius: 8, gap: 8,
              }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{s.label}</span>
                <kbd style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                  padding: '2px 6px', background: '#e5e7eb', borderRadius: 4, color: '#111',
                  whiteSpace: 'nowrap',
                }}>{s.keys}</kbd>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
            Press <kbd style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>?</kbd> to toggle this panel
          </p>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminLayout;
