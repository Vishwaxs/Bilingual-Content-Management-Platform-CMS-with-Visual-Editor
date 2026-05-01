import { Link, useLocation } from 'react-router-dom';
import { useLogout, useCurrentUser, useIsSuperAdmin } from '@/hooks/useAuth';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Newspaper, Users, Calendar, FileText, MessageSquare,
  UserPlus, Settings, LogOut, FolderHeart, Shield, Palette, Edit, Clock,
  Activity, FolderOpen,
} from 'lucide-react';
import { glass } from '@/lib/glass';
import { canAccessSection, isCmsRole, type CmsSection, type CmsRole } from '@/lib/auth/permissions';
import { useAdminAccess } from '@/contexts/useAdminAccess';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useLogout();
  const { user } = useCurrentUser();
  const { role } = useAdminAccess();
  const isSuperAdmin = useIsSuperAdmin();

  const userRole: CmsRole | null = isCmsRole(role) ? role : null;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { group: 'Overview', items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' as CmsSection },
    ]},
    { group: 'Content', items: [
      { to: '/admin/news', icon: Newspaper, label: 'News', section: 'news' as CmsSection },
      { to: '/admin/leadership', icon: Users, label: 'Leadership', section: 'leadership' as CmsSection },
      { to: '/admin/events', icon: Calendar, label: 'Events', section: 'events' as CmsSection },
      { to: '/admin/documents', icon: FileText, label: 'Documents', section: 'documents' as CmsSection },
      { to: '/admin/focus-areas', icon: FolderHeart, label: 'Focus Areas', section: 'focusAreas' as CmsSection },
    ]},
    { group: 'Submissions', items: [
      { to: '/admin/contacts', icon: MessageSquare, label: 'Contacts', section: 'contacts' as CmsSection },
      { to: '/admin/memberships', icon: UserPlus, label: 'Memberships', section: 'memberships' as CmsSection },
    ]},
    // SuperAdmin-only group — conditionally rendered
    ...(isSuperAdmin ? [{
      group: 'Super Admin',
      items: [
        { to: '/admin/content', icon: Edit, label: 'Content Manager', section: 'content' as CmsSection },
        { to: '/admin/media', icon: FolderOpen, label: 'Media Library', section: 'media' as CmsSection },
        { to: '/admin/history', icon: Clock, label: 'Edit History', section: 'history' as CmsSection },
        { to: '/admin/users', icon: Shield, label: 'User Management', section: 'users' as CmsSection },
        { to: '/admin/system', icon: Activity, label: 'System Health', section: 'system' as CmsSection },
        { to: '/admin/settings', icon: Settings, label: 'Settings', section: 'settings' as CmsSection },
      ],
    }] : []),
  ];

  const filteredMenuItems = menuItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessSection(userRole, item.section)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar style={glass.navy}>
      <SidebarHeader className="px-4 py-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B] rounded-lg flex items-center justify-center">
            <span className="text-[#FF9933] font-display text-sm font-black">अ</span>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-foreground">ABHM UP</div>
            <div className="text-[10px] text-muted-foreground">CMS Panel</div>
          </div>
        </Link>
        {/* Role badge */}
        <div className="mt-2">
          {isSuperAdmin ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF9933] border border-[#FF6B00]/30">
              ⚡ Super Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Admin
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredMenuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className={`text-[10px] font-extrabold tracking-[.1em] uppercase ${
              group.group === 'Super Admin'
                ? 'text-[#FF9933]/70'
                : 'text-muted-foreground/60'
            }`}>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={item.to === '/admin' ? location.pathname === '/admin' : isActive(item.to)}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-foreground font-medium truncate">{user?.email}</div>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => window.open('/?edit_mode=true', '_blank')}
            className="flex items-center gap-2 text-xs font-bold w-full px-2 py-1.5 rounded-md mb-1
              bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9933]/20 text-[#FF9933]
              hover:from-[#FF6B00]/30 hover:to-[#FF9933]/30 transition-all"
          >
            <Palette className="h-3.5 w-3.5" /> Edit Live Site
          </button>
        )}
        <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
