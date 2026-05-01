import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutEntry {
  keys: string;
  label: string;
  action: () => void;
}

/**
 * useAdminShortcuts — global keyboard shortcuts for admin routes.
 * Only active when the current path starts with /admin.
 * Returns the shortcuts list (for the help modal) and showHelp state.
 */
export function useAdminShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  const shortcuts: ShortcutEntry[] = [
    { keys: 'n n', label: 'New article', action: () => navigate('/admin/news/new') },
    { keys: 'n e', label: 'New event', action: () => navigate('/admin/events/new') },
    { keys: 'n l', label: 'New leader', action: () => navigate('/admin/leaders/new') },
    { keys: 's s', label: 'Save form', action: () => (document.querySelector('[data-save-btn]') as HTMLElement)?.click() },
    { keys: 'p p', label: 'Publish', action: () => (document.querySelector('[data-publish-btn]') as HTMLElement)?.click() },
    { keys: 'e s', label: 'Edit live site', action: () => window.open('/?edit_mode=true', '_blank') },
    { keys: '/', label: 'Focus search', action: () => (document.querySelector('[data-search]') as HTMLElement)?.focus() },
    { keys: '?', label: 'Show shortcuts', action: () => setShowHelp(true) },
    { keys: 'g d', label: 'Go to dashboard', action: () => navigate('/admin') },
    { keys: 'g n', label: 'Go to news', action: () => navigate('/admin/news') },
    { keys: 'g e', label: 'Go to events', action: () => navigate('/admin/events') },
  ];

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (!isAdmin) return;
    // Don't trigger when typing in inputs/textareas
    const tag = (e.target as HTMLElement).tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      if (e.key === 'Escape') (e.target as HTMLElement).blur();
      return;
    }
    // contentEditable
    if ((e.target as HTMLElement).isContentEditable) return;

    // Handle single-key shortcuts
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const search = document.querySelector('[data-search]') as HTMLElement;
      if (search) search.focus();
      return;
    }

    if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      setShowHelp((v) => !v);
      return;
    }

    if (e.key === 'Escape') {
      setShowHelp(false);
      return;
    }
  }, [isAdmin]);

  // Double-key sequence detection (e.g. "n n")
  const [lastKey, setLastKey] = useState<{ key: string; time: number } | null>(null);

  const handleSequence = useCallback((e: KeyboardEvent) => {
    if (!isAdmin) return;
    const tag = (e.target as HTMLElement).tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    if ((e.target as HTMLElement).isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();
    const now = Date.now();

    if (lastKey && now - lastKey.time < 500) {
      const sequence = `${lastKey.key} ${key}`;
      const shortcut = shortcuts.find((s) => s.keys === sequence);
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
        setLastKey(null);
        return;
      }
    }

    setLastKey({ key, time: now });
  }, [isAdmin, lastKey, shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keydown', handleSequence);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keydown', handleSequence);
    };
  }, [handleKeydown, handleSequence]);

  return { shortcuts, showHelp, setShowHelp };
}
