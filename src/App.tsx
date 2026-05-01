import { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import type { Session } from '@supabase/supabase-js';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminAccessProvider } from '@/contexts/AdminAccessContext';
import { useAdminAccess } from '@/contexts/useAdminAccess';
import { supabase } from "@/integrations/supabase/client";
import { canAccessSection, hasCmsAccess, isCmsRole, type CmsRole, type CmsSection } from '@/lib/auth/permissions';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { VisualEditorToolbar } from '@/components/editor/VisualEditorToolbar';
import { EditPanel } from '@/components/editor/EditPanel';

// Eager-load critical pages
import Index from "./pages/Index";
import AdminLayout from "./components/admin/AdminLayout";

// Lazy-load all other pages for bundle splitting
const About = lazy(() => import("./pages/About"));
const Organization = lazy(() => import("./pages/Organization"));
const Join = lazy(() => import("./pages/Join"));
const Leadership = lazy(() => import("./pages/Leadership"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Documents = lazy(() => import("./pages/Documents"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

// Admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const NewsManager = lazy(() => import("./pages/admin/NewsManager"));
const NewsEditor = lazy(() => import("./pages/admin/NewsEditor"));
const LeadershipManager = lazy(() => import("./pages/admin/LeadershipManager"));
const EventsManager = lazy(() => import("./pages/admin/EventsManager"));
const EventEditor = lazy(() => import("./pages/admin/EventEditor"));
const DocumentsManager = lazy(() => import("./pages/admin/DocumentsManager"));
const DocumentEditor = lazy(() => import("./pages/admin/DocumentEditor"));
const ContactsManager = lazy(() => import("./pages/admin/ContactsManager"));
const MembershipsManager = lazy(() => import("./pages/admin/MembershipsManager"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const SiteSettings = lazy(() => import("./pages/admin/SiteSettings"));
const FocusAreasManager = lazy(() => import("./pages/admin/FocusAreasManager"));
const ContentManager = lazy(() => import("./pages/admin/ContentManager"));
const EditHistory = lazy(() => import("./pages/admin/EditHistory"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const MediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 2 * 60 * 1000, retry: 1 },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
  </div>
);

const getDeniedRedirect = (role: CmsRole | null) => {
  if (role === 'editor') return '/admin/news';
  return '/';
};

const RequireSectionAccess = ({
  role,
  section,
  children,
}: {
  role: CmsRole | null;
  section: CmsSection;
  children: React.ReactNode;
}) => {
  if (!canAccessSection(role, section)) {
    return <Navigate to={getDeniedRedirect(role)} replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [cmsRole, setCmsRole] = useState<CmsRole | null | undefined>(undefined);

  const resolveAccess = async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user?.id) {
      setCmsRole(null);
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', nextSession.user.id)
      .in('role', ['admin', 'editor', 'viewer', 'superadmin'])
      .limit(1)
      .maybeSingle();

    if (error || !isCmsRole(data?.role)) {
      setCmsRole(null);
      return;
    }

    setCmsRole(data.role);
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      void resolveAccess(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      void resolveAccess(initialSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined || cmsRole === undefined) return <LoadingFallback />;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!hasCmsAccess(cmsRole)) return <Navigate to="/" replace />;
  if (location.pathname === '/admin' && !canAccessSection(cmsRole, 'dashboard')) {
    return <Navigate to={getDeniedRedirect(cmsRole)} replace />;
  }

  return <AdminAccessProvider role={cmsRole}>{children}</AdminAccessProvider>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EditModeProvider>
            <VisualEditorToolbar />
            <EditPanel />
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/organization" element={<Organization />} />
              <Route path="/join" element={<Join />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />

              {/* Admin login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin routes (protected) */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminGate section="dashboard"><Dashboard /></AdminGate>} />
                <Route path="news" element={<AdminGate section="news"><NewsManager /></AdminGate>} />
                <Route path="news/:id" element={<AdminGate section="news"><NewsEditor /></AdminGate>} />
                <Route path="leadership" element={<AdminGate section="leadership"><LeadershipManager /></AdminGate>} />
                <Route path="events" element={<AdminGate section="events"><EventsManager /></AdminGate>} />
                <Route path="events/:id" element={<AdminGate section="events"><EventEditor /></AdminGate>} />
                <Route path="documents" element={<AdminGate section="documents"><DocumentsManager /></AdminGate>} />
                <Route path="documents/:id" element={<AdminGate section="documents"><DocumentEditor /></AdminGate>} />
                <Route path="contacts" element={<AdminGate section="contacts"><ContactsManager /></AdminGate>} />
                <Route path="memberships" element={<AdminGate section="memberships"><MembershipsManager /></AdminGate>} />
                <Route path="focus-areas" element={<AdminGate section="focusAreas"><FocusAreasManager /></AdminGate>} />

                {/* SuperAdmin-only routes */}
                <Route path="users" element={<AdminGate section="users"><UsersManager /></AdminGate>} />
                <Route path="settings" element={<AdminGate section="settings"><SiteSettings /></AdminGate>} />
                <Route path="content" element={<AdminGate section="content"><ContentManager /></AdminGate>} />
                <Route path="history" element={<AdminGate section="history"><EditHistory /></AdminGate>} />
                <Route path="system" element={<AdminGate section="system"><SystemHealth /></AdminGate>} />
                <Route path="media" element={<AdminGate section="media"><MediaLibrary /></AdminGate>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </EditModeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

const AdminGate = ({ section, children }: { section: CmsSection; children: React.ReactNode }) => {
  const { role } = useAdminAccess();
  return <RequireSectionAccess role={role} section={section}>{children}</RequireSectionAccess>;
};

export default App;
