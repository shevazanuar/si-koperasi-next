import { LRUCache } from "lru-cache";

/**
 * Simple in-memory rate limiter using LRU Cache.
 * Suitable for single-server / local deployments.
 * For serverless/multi-instance, replace with Upstash Redis.
 */
const rateLimitCache = new LRUCache({
  max: 500,        // maksimal 500 unique IP tracked
  ttl: 15 * 60 * 1000, // window 15 menit
});

const LIMIT = 5; // maks 5 percobaan per window

/**
 * @param {string} ip
 * @returns {{ success: boolean, remaining: number, retryAfterMs: number }}
 */
export function rateLimit(ip) {
  const key = `rl:${ip}`;
  const current = rateLimitCache.get(key) ?? 0;

  if (current >= LIMIT) {
    const ttlMs = rateLimitCache.getRemainingTTL(key);
    return { success: false, remaining: 0, retryAfterMs: ttlMs };
  }

  rateLimitCache.set(key, current + 1);
  return { success: true, remaining: LIMIT - current - 1, retryAfterMs: 0 };
}

/**
 * Helper: ambil IP dari request Next.js
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
