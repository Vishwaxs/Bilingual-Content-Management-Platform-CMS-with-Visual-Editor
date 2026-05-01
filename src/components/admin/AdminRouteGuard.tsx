import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminUser } from '@/hooks/useAuth';
import type { AdminRole } from '@/hooks/useAuth';

interface Props {
  children: ReactNode;
  requiredRole?: AdminRole; // default: 'admin' (both admin+superadmin pass)
  fallback?: ReactNode;
}

export function AdminRouteGuard({ children, requiredRole = 'admin', fallback }: Props) {
  const { data: adminUser, isLoading, isFetched } = useAdminUser();

  if (isLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role hierarchy: superadmin-only routes block admin
  if (requiredRole === 'superadmin' && !adminUser.isSuperAdmin) {
    return fallback ? <>{fallback}</> : (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-serif font-black text-[#0B1F3A] text-2xl mb-2">Super Admin Only</h2>
          <p className="text-gray-500 text-sm mb-6">This area requires Super Admin privileges.</p>
          <a href="/admin" className="bg-[#FF6B00] text-white font-bold px-6 py-3 rounded-lg inline-block hover:bg-[#E55A00] transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
