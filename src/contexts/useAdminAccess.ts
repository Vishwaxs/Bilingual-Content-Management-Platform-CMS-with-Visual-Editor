import { useContext } from 'react';
import { AdminAccessContext } from './admin-access-context';

export const useAdminAccess = () => {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error('useAdminAccess must be used inside AdminAccessProvider');
  }
  return context;
};