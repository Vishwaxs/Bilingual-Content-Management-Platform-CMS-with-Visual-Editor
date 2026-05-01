// src/lib/security/rate-limit.ts
// Client-side rate limiter for form submission debouncing.
// True server-side rate limiting is in Edge Functions (CO-03).

interface Attempt {
  count: number;
  firstAt: number;
  blockedUntil: number;
}

const attempts = new Map<string, Attempt>();

export interface RateLimitConfig {
  key: string;          // Unique key per form/action
  limit: number;        // Max attempts
  windowMs: number;     // Time window in ms
  blockMs?: number;     // How long to block after limit hit (default: windowMs)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;      // ms until reset
  message?: string;
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const blockDuration = config.blockMs ?? config.windowMs;
  const existing = attempts.get(config.key);

  // If blocked
  if (existing?.blockedUntil && now < existing.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.blockedUntil - now,
      message: `Too many attempts. Please wait ${Math.ceil((existing.blockedUntil - now) / 1000)} seconds.`,
    };
  }

  // Reset window if expired
  if (!existing || now - existing.firstAt > config.windowMs) {
    attempts.set(config.key, { count: 1, firstAt: now, blockedUntil: 0 });
    return { allowed: true, remaining: config.limit - 1, resetIn: config.windowMs };
  }

  existing.count++;

  if (existing.count > config.limit) {
    existing.blockedUntil = now + blockDuration;
    return {
      allowed: false,
      remaining: 0,
      resetIn: blockDuration,
      message: `Too many attempts. Please wait ${Math.ceil(blockDuration / 1000)} seconds.`,
    };
  }

  return {
    allowed: true,
    remaining: config.limit - existing.count,
    resetIn: config.windowMs - (now - existing.firstAt),
  };
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}
