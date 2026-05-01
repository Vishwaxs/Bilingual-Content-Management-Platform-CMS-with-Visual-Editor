// Deno KV-based rate limiting (persistent across requests)
// Falls back to in-memory if KV unavailable
const memStore = new Map<string, { count: number; resetAt: number }>();

const isValidIp = (value: string) => {
  return /^[a-fA-F0-9:.]{3,64}$/.test(value);
};

export function getClientAddress(req: Request): string {
  const candidates = [
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-real-ip'),
    req.headers.get('x-forwarded-for')?.split(',')[0],
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized && isValidIp(normalized)) {
      return normalized;
    }
  }

  return 'unknown';
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const resetAt = now + windowMs;

  // Try Deno KV first
  try {
    const kv = await Deno.openKv();
    const kvKey: Deno.KvKey = ['rl', key];

    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await kv.get<{ count: number; resetAt: number }>(kvKey);

      if (!existing.value || existing.value.resetAt < now) {
        const committed = await kv
          .atomic()
          .check(existing)
          .set(kvKey, { count: 1, resetAt }, { expireIn: windowMs })
          .commit();

        if (committed.ok) {
          return { allowed: true, remaining: limit - 1, resetAt };
        }
        continue;
      }

      const updatedCount = existing.value.count + 1;
      const ttl = Math.max(existing.value.resetAt - now, 1_000);

      const committed = await kv
        .atomic()
        .check(existing)
        .set(kvKey, { count: updatedCount, resetAt: existing.value.resetAt }, { expireIn: ttl })
        .commit();

      if (!committed.ok) {
        continue;
      }

      if (updatedCount > limit) {
        return { allowed: false, remaining: 0, resetAt: existing.value.resetAt };
      }

      return { allowed: true, remaining: Math.max(0, limit - updatedCount), resetAt: existing.value.resetAt };
    }

    return { allowed: false, remaining: 0, resetAt };
  } catch {
    // Fallback to in-memory
    const existing = memStore.get(key);
    if (!existing || existing.resetAt < now) {
      memStore.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }
    existing.count++;
    if (existing.count > limit) return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
  }
}
