// Lightweight in-memory rate limiter for unauthenticated public endpoints.
// Per-instance only (best-effort) — not a hard guarantee across workers, but
// adds meaningful abuse protection against credit-draining loops.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }
  if (b.count >= opts.limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

export function clientKey(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

export function tooManyRequests(retryAfter: number) {
  return new Response("Too many requests. Please slow down.", {
    status: 429,
    headers: { "Retry-After": String(retryAfter) },
  });
}
