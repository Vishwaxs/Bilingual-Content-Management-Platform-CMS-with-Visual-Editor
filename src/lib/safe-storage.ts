// src/lib/safe-storage.ts
// A defensive wrapper around window.localStorage.
//
// Accessing localStorage can throw synchronously (not just fail silently) in
// several real-world environments:
//   - Private / incognito modes in some browsers (Safari historically threw
//     QuotaExceededError on setItem; older WebKit threw on any access).
//   - Sandboxed iframes without the `allow-same-origin` token, where merely
//     reading `window.localStorage` throws a SecurityError.
//   - Server-side / non-DOM runtimes where `window` is undefined.
//
// Because LanguageProvider reads storage inside a useState initializer (i.e.
// during render), an uncaught throw there takes down the entire React tree.
// These helpers guarantee they never throw, falling back to a no-op so the app
// keeps working with in-memory state only.

/**
 * Read a key from localStorage. Returns `null` if the value is absent or if
 * storage is unavailable/throws for any reason.
 */
export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Write a key to localStorage. Returns `true` on success, `false` if storage is
 * unavailable or the write throws (e.g. quota exceeded, disabled storage).
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a key from localStorage. Never throws; returns `true` on success.
 */
export function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
