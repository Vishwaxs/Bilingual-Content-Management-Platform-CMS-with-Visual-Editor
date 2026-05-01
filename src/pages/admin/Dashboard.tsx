import { Link } from 'react-router-dom';
import { useAllNews } from '@/hooks/useNews';
import { useLeadershipProfiles } from '@/hooks/useLeadership';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { useContactSubmissions, useMembershipApplications } from '@/hooks/useSubmissions';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useIsSuperAdmin, useAdminUser } from '@/hooks/useAuth';
import {
  Newspaper, Users, Calendar, MessageSquare, UserPlus, Plus,
  ArrowRight, FileText, Palette, Clock, Activity, AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Time-based greeting ──────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getGreetingHi = () => {
  const h = new Date().getHours();
  if (h < 12) return 'सुप्रभात';
  if (h < 17) return 'नमस्कार';
  return 'शुभ संध्या';
};

// ─── Action color map for activity logs ───────────────────────
const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-500/20 text-emerald-400',
  login:  'bg-emerald-500/20 text-emerald-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  logout: 'bg-gray-500/20 text-gray-400',
};

const Dashboard = () => {
  const { data: adminUser } = useAdminUser();
  const isSuperAdmin = useIsSuperAdmin();

  const { data: newsArticles } = useAllNews();
  const { data: leaders } = useLeadershipProfiles(true);
  const { data: upcomingEvents } = useUpcomingEvents(10);
  const { data: contacts } = useContactSubmissions();
  const { data: memberships } = useMembershipApplications();
  const { data: activityLogs } = useActivityLogs(15);

  const publishedNews = newsArticles?.filter(n => n.status === 'published').length ?? 0;
  const activeLeaders = leaders?.length ?? 0;
  const upcomingCount = upcomingEvents?.length ?? 0;
  const pendingMembers = memberships?.filter(m => m.status === 'new' || m.status === 'pending').length ?? 0;
  const newMessages = contacts?.filter(c => c.status === 'new').length ?? 0;

  const recentNews = newsArticles?.slice(0, 5) ?? [];
  const recentEvents = upcomingEvents?.slice(0, 3) ?? [];

  // ─── Stats Cards ──────────────────────────────────────────
  const stats = [
    { label: 'Published News', value: publishedNews, icon: Newspaper, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', to: '/admin/news' },
    { label: 'Active Leaders', value: activeLeaders, icon: Users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', to: '/admin/leadership' },
    { label: 'Upcoming Events', value: upcomingCount, icon: Calendar, color: '#FF6B00', bg: 'rgba(255,107,0,0.12)', to: '/admin/events' },
    { label: 'Pending Members', value: pendingMembers, icon: UserPlus, color: '#10B981', bg: 'rgba(16,185,129,0.12)', to: '/admin/memberships' },
    { label: 'New Messages', value: newMessages, icon: MessageSquare, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', to: '/admin/contacts' },
  ];

  // ─── Quick Actions ────────────────────────────────────────
  const quickActions = [
    { label: 'New Article', icon: Plus, to: '/admin/news/new', color: '#3B82F6' },
    { label: 'New Event', icon: Calendar, to: '/admin/events/new', color: '#FF6B00' },
    { label: 'Documents', icon: FileText, to: '/admin/documents', color: '#8B5CF6' },
    ...(isSuperAdmin ? [{ label: 'Visual Editor', icon: Palette, to: '/?edit_mode=true', color: '#10B981', external: true }] : []),
  ];

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* ─── Welcome Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground">
            {getGreeting()}{adminUser?.user.email ? `, ${adminUser.user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            <span className="font-devanagari">{getGreetingHi()}</span>
            <span>•</span>
            <span>{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF9933] border border-[#FF6B00]/20">
              ⚡ Super Admin
            </span>
          )}
        </div>
      </div>

      {/* ─── Alert Strip ─────────────────────────────────── */}
      {(pendingMembers > 0 || newMessages > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingMembers > 0 && (
            <Link to="/admin/memberships"
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
              <AlertTriangle className="h-3.5 w-3.5" />
              {pendingMembers} pending membership{pendingMembers > 1 ? 's' : ''}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          {newMessages > 0 && (
            <Link to="/admin/contacts"
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              {newMessages} new message{newMessages > 1 ? 's' : ''}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* ─── SuperAdmin: Edit Live Site Banner ────────────── */}
      {isSuperAdmin && (
        <button
          onClick={() => window.open('/?edit_mode=true', '_blank')}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left
            bg-gradient-to-r from-[#FF6B00]/10 to-[#FF9933]/5 border border-[#FF6B00]/20
            hover:from-[#FF6B00]/20 hover:to-[#FF9933]/10 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-[#FF9933]" />
            <div>
              <div className="text-sm font-bold text-foreground">Open Visual Editor</div>
              <div className="text-[11px] text-muted-foreground">Edit live site content without code changes</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#FF9933] group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* ─── Stats Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative rounded-xl p-4 bg-card border border-border
              hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div className="font-display text-2xl font-black text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1 font-medium">{s.label}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }}>
              Manage <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Two-Column Layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* LEFT: Recent Activity Feed */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
            </div>
            {isSuperAdmin && (
              <span className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                View all logs
              </span>
            )}
          </div>
          <div className="divide-y divide-border max-h-[420px] overflow-auto">
            {activityLogs && activityLogs.length > 0 ? activityLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-500'}`}>
                  {log.action}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-medium">{log.entity_type}</span>
                    {log.entity_id && <span className="text-muted-foreground"> · {log.entity_id.slice(0, 8)}…</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">No recent activity</div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick Actions */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                a.external ? (
                  <button
                    key={a.label}
                    onClick={() => window.open(a.to, '_blank')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 border border-transparent
                      hover:border-border hover:bg-muted hover:-translate-y-0.5 transition-all text-center"
                  >
                    <a.icon className="h-5 w-5" style={{ color: a.color }} />
                    <span className="text-[11px] font-medium text-foreground">{a.label}</span>
                  </button>
                ) : (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 border border-transparent
                      hover:border-border hover:bg-muted hover:-translate-y-0.5 transition-all text-center"
                  >
                    <a.icon className="h-5 w-5" style={{ color: a.color }} />
                    <span className="text-[11px] font-medium text-foreground">{a.label}</span>
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Content Overview Mini-Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Recent Content
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recentNews.length > 0 ? recentNews.map((n) => (
                <Link key={n.id} to={`/admin/news/${n.id}`}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{n.title_en || n.title_hi}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {n.published_at ? format(new Date(n.published_at), 'MMM d') : 'Draft'}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    n.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                    n.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>{n.status}</span>
                </Link>
              )) : (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">No articles yet</div>
              )}
              {recentEvents.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/30">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming Events</span>
                  </div>
                  {recentEvents.map((e) => (
                    <Link key={e.id} to={`/admin/events/${e.id}`}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{e.title_en || e.title_hi}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {e.event_date ? format(new Date(e.event_date), 'MMM d, yyyy') : '—'}
                        </p>
                      </div>
                      <Calendar className="h-3 w-3 text-[#FF6B00]" />
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
