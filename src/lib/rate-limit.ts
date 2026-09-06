type RateLimitRecord = {
  tokens: number;
  lastRefill: number;
};

const store = new Map<string, RateLimitRecord>();

/**
 * Token bucket in-memory rate limiter
 * @param key unique identifier (e.g. `vote:${userId}`, `submit:${ip}`)
 * @param maxTokens capacity of bucket
 * @param refillRatePerSecond rate at which tokens refill
 */
export function checkRateLimit(
  key: string,
  maxTokens: number,
  refillRatePerSecond: number
): { success: boolean; remaining: number; resetAfterMs: number } {
  const now = Date.now();
  let record = store.get(key);

  if (!record) {
    record = { tokens: maxTokens - 1, lastRefill: now };
    store.set(key, record);
    return { success: true, remaining: maxTokens - 1, resetAfterMs: 0 };
  }

  // Calculate token refill
  const elapsedSeconds = (now - record.lastRefill) / 1000;
  const newTokens = Math.min(maxTokens, record.tokens + elapsedSeconds * refillRatePerSecond);

  if (newTokens < 1) {
    const timeNeededMs = Math.ceil((1 - newTokens) / refillRatePerSecond) * 1000;
    return { success: false, remaining: 0, resetAfterMs: timeNeededMs };
  }

  record.tokens = newTokens - 1;
  record.lastRefill = now;
  store.set(key, record);

  return {
    success: true,
    remaining: Math.floor(record.tokens),
    resetAfterMs: 0,
  };
}
