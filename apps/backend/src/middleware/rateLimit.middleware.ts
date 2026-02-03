import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting middleware
 * Limits requests per IP address within a time window
 */
export function rateLimitMiddleware(options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Max requests per window
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.ip ||
      'unknown';

    const key = `${ip}:${req.path}`;
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[key].count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    // Check if limit exceeded
    if (store[key].count > max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    // If skipSuccessfulRequests, decrement on successful response
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function (data: any) {
        if (res.statusCode < 400) {
          store[key].count--;
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

/**
 * Cleanup old entries from store periodically
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60 * 1000); // Clean up every minute

/**
 * Preset rate limit configurations
 */
export const rateLimits = {
  // Strict limit for authentication endpoints
  auth: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests
    message: 'Too many authentication attempts, please try again later.',
  }),

  // Standard limit for API endpoints
  api: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
  }),

  // Generous limit for chat endpoints
  chat: rateLimitMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 messages per minute
    message: 'Slow down! Too many messages.',
  }),

  // Very strict for password reset
  passwordReset: rateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests
    message: 'Too many password reset attempts. Please try again later.',
  }),
};
