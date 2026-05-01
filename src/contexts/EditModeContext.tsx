import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useAuth';
import { useSaveAllPendingEdits, useCmsRealtime } from '@/hooks/useEditableCms';
import { toast } from 'sonner';

// ─── Context shape ────────────────────────────────────────────
interface EditModeContextValue {
  isEditMode: boolean;
  pendingEdits: Map<string, string>;
  selectedKey: string | null;
  pendingCount: number;
  // Actions
  enterEditMode: () => void;
  exitEditMode: () => void;
  setPendingValue: (key: string, value: string) => void;
  removePendingValue: (key: string) => void;
  selectElement: (key: string | null) => void;
  saveAll: () => Promise<void>;
  discardAll: () => void;
  isSaving: boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────
export function EditModeProvider({ children }: { children: ReactNode }) {
  const isSuperAdmin = useIsSuperAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(new Map());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const saveMutation = useSaveAllPendingEdits();

  // Subscribe to realtime changes
  useCmsRealtime();

  // Read URL param on mount
  useEffect(() => {
    if (searchParams.get('edit_mode') === 'true' && isSuperAdmin) {
      setIsEditMode(true);
    }
  }, [searchParams, isSuperAdmin]);

  // Manage body class for toolbar offset
  useEffect(() => {
    if (isEditMode) {
      document.body.classList.add('edit-mode-active');
    } else {
      document.body.classList.remove('edit-mode-active');
    }
    return () => document.body.classList.remove('edit-mode-active');
  }, [isEditMode]);

  const enterEditMode = useCallback(() => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can enter edit mode');
      return;
    }
    setIsEditMode(true);
    setSearchParams((prev) => {
      prev.set('edit_mode', 'true');
      return prev;
    });
  }, [isSuperAdmin, setSearchParams]);

  const exitEditMode = useCallback(() => {
    if (pendingEdits.size > 0) {
      if (!confirm(`You have ${pendingEdits.size} unsaved changes. Discard and exit?`)) {
        return;
      }
    }
    setIsEditMode(false);
    setPendingEdits(new Map());
    setSelectedKey(null);
    setSearchParams((prev) => {
      prev.delete('edit_mode');
      return prev;
    });
  }, [pendingEdits, setSearchParams]);

  const setPendingValue = useCallback((key: string, value: string) => {
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const removePendingValue = useCallback((key: string) => {
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const selectElement = useCallback((key: string | null) => {
    setSelectedKey(key);
  }, []);

  const saveAll = useCallback(async () => {
    if (pendingEdits.size === 0) {
      toast.info('No changes to save');
      return;
    }
    try {
      const count = await saveMutation.mutateAsync(pendingEdits);
      setPendingEdits(new Map());
      setSelectedKey(null);
      toast.success(`${count} change${count > 1 ? 's' : ''} saved successfully`);
    } catch (e) {
      toast.error(`Save failed: ${(e as Error).message}`);
    }
  }, [pendingEdits, saveMutation]);

  const discardAll = useCallback(() => {
    if (pendingEdits.size === 0) return;
    if (!confirm(`Discard ${pendingEdits.size} unsaved change(s)?`)) return;
    setPendingEdits(new Map());
    setSelectedKey(null);
    toast.info('Changes discarded');
  }, [pendingEdits]);

  const value: EditModeContextValue = {
    isEditMode: isEditMode && isSuperAdmin,
    pendingEdits,
    selectedKey,
    pendingCount: pendingEdits.size,
    enterEditMode,
    exitEditMode,
    setPendingValue,
    removePendingValue,
    selectElement,
    saveAll,
    discardAll,
    isSaving: saveMutation.isPending,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error('useEditMode must be used inside EditModeProvider');
  return ctx;
}
