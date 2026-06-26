import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, clearRateLimit } from '@/lib/security/rate-limit';

// The rate limiter keys off Date.now() and keeps state in a module-level Map.
// Fake timers make every assertion deterministic; clearRateLimit() resets the
// per-key state between tests so cases never leak into one another.

const BASE = 1_700_000_000_000; // fixed epoch so resetIn values are exact

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first attempt and reports remaining + full window', () => {
    const result = checkRateLimit({ key: 'first', limit: 3, windowMs: 10_000 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetIn).toBe(10_000);
    expect(result.message).toBeUndefined();

    clearRateLimit('first');
  });

  it('decrements remaining on each attempt inside the window', () => {
    const cfg = { key: 'count', limit: 3, windowMs: 10_000 };

    expect(checkRateLimit(cfg).remaining).toBe(2);
    expect(checkRateLimit(cfg).remaining).toBe(1);
    expect(checkRateLimit(cfg).remaining).toBe(0);

    clearRateLimit('count');
  });

  it('shrinks resetIn as time elapses within the window', () => {
    const cfg = { key: 'reset', limit: 5, windowMs: 10_000 };

    checkRateLimit(cfg); // opens the window at BASE
    vi.setSystemTime(BASE + 4_000);

    const result = checkRateLimit(cfg);
    expect(result.allowed).toBe(true);
    expect(result.resetIn).toBe(6_000);

    clearRateLimit('reset');
  });

  it('blocks once attempts exceed the limit', () => {
    const cfg = { key: 'block', limit: 2, windowMs: 10_000 };

    expect(checkRateLimit(cfg).allowed).toBe(true); // 1
    expect(checkRateLimit(cfg).allowed).toBe(true); // 2 (at limit)

    const blocked = checkRateLimit(cfg); // 3 -> over limit
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetIn).toBe(10_000); // defaults to windowMs
    expect(blocked.message).toMatch(/Too many attempts/);
    expect(blocked.message).toContain('10 seconds');

    clearRateLimit('block');
  });

  it('uses blockMs for the block duration when provided', () => {
    const cfg = { key: 'block-ms', limit: 1, windowMs: 10_000, blockMs: 30_000 };

    expect(checkRateLimit(cfg).allowed).toBe(true); // 1 (at limit)

    const blocked = checkRateLimit(cfg); // 2 -> over limit
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetIn).toBe(30_000);
    expect(blocked.message).toContain('30 seconds');

    clearRateLimit('block-ms');
  });

  it('keeps reporting blocked with a shrinking countdown until the block expires', () => {
    const cfg = { key: 'countdown', limit: 1, windowMs: 10_000, blockMs: 20_000 };

    checkRateLimit(cfg); // 1
    checkRateLimit(cfg); // 2 -> blocked until BASE + 20_000

    vi.setSystemTime(BASE + 5_000);
    const stillBlocked = checkRateLimit(cfg);
    expect(stillBlocked.allowed).toBe(false);
    expect(stillBlocked.resetIn).toBe(15_000);
    expect(stillBlocked.message).toContain('15 seconds');

    clearRateLimit('countdown');
  });

  it('allows attempts again once the block has expired', () => {
    const cfg = { key: 'expire', limit: 1, windowMs: 10_000, blockMs: 20_000 };

    checkRateLimit(cfg); // 1
    checkRateLimit(cfg); // 2 -> blocked until BASE + 20_000

    vi.setSystemTime(BASE + 20_001); // past the block
    const recovered = checkRateLimit(cfg);
    expect(recovered.allowed).toBe(true);
    expect(recovered.remaining).toBe(0); // limit is 1, so first attempt of new window
    expect(recovered.message).toBeUndefined();

    clearRateLimit('expire');
  });

  it('resets the counter after the window passes', () => {
    const cfg = { key: 'window', limit: 2, windowMs: 10_000 };

    checkRateLimit(cfg); // 1 -> remaining 1
    checkRateLimit(cfg); // 2 -> remaining 0

    vi.setSystemTime(BASE + 10_001); // window has elapsed
    const fresh = checkRateLimit(cfg);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(1); // counter started over
    expect(fresh.resetIn).toBe(10_000);

    clearRateLimit('window');
  });

  it('tracks distinct keys independently', () => {
    const a = { key: 'key-a', limit: 1, windowMs: 10_000 };
    const b = { key: 'key-b', limit: 1, windowMs: 10_000 };

    checkRateLimit(a); // a at limit
    checkRateLimit(a); // a blocked

    const bResult = checkRateLimit(b); // b untouched
    expect(bResult.allowed).toBe(true);
    expect(bResult.remaining).toBe(0);

    clearRateLimit('key-a');
    clearRateLimit('key-b');
  });

  it('rounds the countdown up to whole seconds', () => {
    // blockMs of 2500ms should surface as "3 seconds", not "2".
    const cfg = { key: 'ceil', limit: 1, windowMs: 10_000, blockMs: 2_500 };

    checkRateLimit(cfg);
    const blocked = checkRateLimit(cfg);
    expect(blocked.message).toContain('3 seconds');

    clearRateLimit('ceil');
  });
});

describe('clearRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('forgets prior attempts so the next call starts a fresh window', () => {
    const cfg = { key: 'clear', limit: 1, windowMs: 10_000 };

    checkRateLimit(cfg);          // at limit
    expect(checkRateLimit(cfg).allowed).toBe(false); // blocked

    clearRateLimit('clear');

    const afterClear = checkRateLimit(cfg);
    expect(afterClear.allowed).toBe(true);
    expect(afterClear.remaining).toBe(0);

    clearRateLimit('clear');
  });

  it('is a no-op for an unknown key', () => {
    expect(() => clearRateLimit('never-seen')).not.toThrow();
  });
});
