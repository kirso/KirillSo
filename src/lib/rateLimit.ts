interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

interface RateLimitInfo {
  remaining: number; // Remaining requests
  reset: number; // Timestamp when the limit resets
}

// In-memory store for development
const store = new Map<string, { count: number; reset: number }>();

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  async limit(identifier: string): Promise<RateLimitInfo> {
    const now = Date.now();
    const record = store.get(identifier);

    // If no record exists or window has expired, create new record
    if (!record || now > record.reset) {
      store.set(identifier, {
        count: 1,
        reset: now + this.config.windowMs,
      });

      return {
        remaining: this.config.maxRequests - 1,
        reset: now + this.config.windowMs,
      };
    }

    // Increment count if within window
    record.count += 1;
    store.set(identifier, record);

    // Check if over limit
    if (record.count > this.config.maxRequests) {
      return {
        remaining: 0,
        reset: record.reset,
      };
    }

    return {
      remaining: this.config.maxRequests - record.count,
      reset: record.reset,
    };
  }

  async isLimited(identifier: string): Promise<boolean> {
    const { remaining } = await this.limit(identifier);
    return remaining <= 0;
  }
}

// Create a default rate limiter instance
export const chatRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60 * 1000, // per minute
});
