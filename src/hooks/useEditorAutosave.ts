import { useCallback, useEffect, useState } from 'react';

type AutosavePayload<T> = {
  savedAt: string;
  data: T;
};

type UseEditorAutosaveOptions<T> = {
  storageKey: string;
  value: T;
  enabled?: boolean;
  debounceMs?: number;
};

const isAutosavePayload = <T,>(value: unknown): value is AutosavePayload<T> => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.savedAt === 'string' && 'data' in candidate;
};

export const useEditorAutosave = <T,>({
  storageKey,
  value,
  enabled = true,
  debounceMs = 800,
}: UseEditorAutosaveOptions<T>) => {
  const [pendingDraft, setPendingDraft] = useState<AutosavePayload<T> | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPendingDraft(null);
      setIsReady(false);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setPendingDraft(null);
        setIsReady(true);
        return;
      }

      const parsed: unknown = JSON.parse(raw);
      if (isAutosavePayload<T>(parsed)) {
        setPendingDraft(parsed);
        setLastSavedAt(parsed.savedAt);
      } else {
        window.localStorage.removeItem(storageKey);
        setPendingDraft(null);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      setPendingDraft(null);
    }

    setIsReady(true);
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled || !isReady) return;
    if (pendingDraft) return;

    const timer = window.setTimeout(() => {
      const payload: AutosavePayload<T> = {
        savedAt: new Date().toISOString(),
        data: value,
      };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setLastSavedAt(payload.savedAt);
      } catch {
        // Ignore quota and storage availability errors; editor must stay functional.
      }
    }, Math.max(250, debounceMs));

    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, isReady, pendingDraft, storageKey, value]);

  const restorePendingDraft = useCallback(() => {
    const restored = pendingDraft?.data ?? null;
    setPendingDraft(null);
    return restored;
  }, [pendingDraft]);

  const discardPendingDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } finally {
      setPendingDraft(null);
      setLastSavedAt(null);
    }
  }, [storageKey]);

  const clearAutosave = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } finally {
      setPendingDraft(null);
      setLastSavedAt(null);
    }
  }, [storageKey]);

  return {
    pendingDraft,
    lastSavedAt,
    restorePendingDraft,
    discardPendingDraft,
    clearAutosave,
  };
};