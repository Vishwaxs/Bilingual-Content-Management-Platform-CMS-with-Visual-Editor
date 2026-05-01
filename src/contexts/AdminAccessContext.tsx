import type { CmsRole } from '@/lib/auth/permissions';
import { AdminAccessContext } from './admin-access-context';

export const AdminAccessProvider = ({
  role,
  children,
}: {
  role: CmsRole | null;
  children: React.ReactNode;
}) => {
  return (
    <AdminAccessContext.Provider value={{ role }}>
      {children}
    </AdminAccessContext.Provider>
  );
};
