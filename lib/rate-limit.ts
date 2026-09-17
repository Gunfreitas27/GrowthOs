import { Redis } from '@upstash/redis';

// @upstash/redis has been a listed dependency since Fase 0 but was never
// imported anywhere — this is its first real use.

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
    });
  }
  return _redis;
}

const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

// Fixed-window counter per key. Fails OPEN on any Redis error — unset/
// placeholder credentials, a network blip, Upstash being down — because
// this is a defense-in-depth layer, not the primary auth boundary (the API
// key already is). A Redis outage should degrade rate limiting, not take
// the whole MCP endpoint down.
export async function checkRateLimit(key: string, limit: number): Promise<RateLimitResult> {
  try {
    const redis = getRedis();
    const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / 1000 / WINDOW_SECONDS)}`;
    const count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.expire(windowKey, WINDOW_SECONDS);
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), limit };
  } catch (err) {
    console.error('[rate-limit] Redis unavailable, failing open:', err);
    return { allowed: true, remaining: limit, limit };
  }
}
