import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeGetItem, safeRemoveItem, safeSetItem } from '@/lib/safe-storage';

describe('safe-storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it('reads and writes values through localStorage', () => {
    expect(safeSetItem('abhm-test', 'hi')).toBe(true);
    expect(safeGetItem('abhm-test')).toBe('hi');
  });

  it('returns null for a missing key', () => {
    expect(safeGetItem('abhm-does-not-exist')).toBeNull();
  });

  it('removes a value', () => {
    safeSetItem('abhm-test', 'en');
    expect(safeRemoveItem('abhm-test')).toBe(true);
    expect(safeGetItem('abhm-test')).toBeNull();
  });

  it('returns null instead of throwing when getItem throws (e.g. sandboxed iframe)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    expect(() => safeGetItem('abhm-test')).not.toThrow();
    expect(safeGetItem('abhm-test')).toBeNull();
  });

  it('returns false instead of throwing when setItem throws (e.g. quota exceeded)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    expect(() => safeSetItem('abhm-test', 'hi')).not.toThrow();
    expect(safeSetItem('abhm-test', 'hi')).toBe(false);
  });

  it('returns false instead of throwing when removeItem throws', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    expect(() => safeRemoveItem('abhm-test')).not.toThrow();
    expect(safeRemoveItem('abhm-test')).toBe(false);
  });
});
