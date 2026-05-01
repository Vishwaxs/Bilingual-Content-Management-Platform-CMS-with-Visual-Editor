import { createContext } from 'react';
import type { CmsRole } from '@/lib/auth/permissions';

export type AdminAccessContextValue = {
  role: CmsRole | null;
};

export const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);