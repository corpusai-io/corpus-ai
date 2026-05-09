import { Request } from 'express';
import rateLimit, { Options as RateLimitOptions, Store } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

import type { AuthRequest } from './auth.middleware';

/**
 * Rate limiting middleware.
 *
 * Backed by a Redis store (Upstash, Railway Redis, etc.) when REDIS_URL is set —
 * required for correctness across multiple Railway replicas.
 * Falls back to express-rate-limit's default in-memory store for local dev when
 * REDIS_URL is missing (single-process only).
 *
 * Set REDIS_URL to your provider's standard Redis protocol URL, e.g. for Upstash:
 *   rediss://default:<TOKEN>@<region>.upstash.io:6379
 *
 * Keys requests by authenticated user email when present, else by client IP.
 * Express must be configured with `app.set('trust proxy', 1)` so req.ip resolves
 * to the original client behind Railway's proxy.
 */

const REDIS_URL = process.env.REDIS_URL;

const redisClient = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: false,
    })
  : null;

if (redisClient) {
  redisClient.on('error', (err) => {
    console.error('[rate-limit] Redis error:', err.message);
  });
  redisClient.on('connect', () => {
    console.log('[rate-limit] Redis connected — distributed rate limits active');
  });
} else {
  console.warn('[rate-limit] REDIS_URL not set — using in-memory store (single replica only)');
}

function buildStore(prefix: string): Store | undefined {
  if (!redisClient) return undefined;
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    // ioredis' .call(command, ...args) speaks the raw RESP protocol that
    // rate-limit-redis expects. The `any` cast is needed because ioredis'
    // generic return type is wider than rate-limit-redis' RedisReply.
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as any,
  });
}

function keyByUserOrIp(req: Request): string {
  const user = (req as AuthRequest).user;
  if (user?.email) return `u:${user.email}`;
  return `ip:${req.ip ?? 'unknown'}`;
}

function makeLimiter(prefix: string, opts: { windowMs: number; max: number; message?: string } & Partial<RateLimitOptions>) {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded', message: opts.message ?? 'Too many requests, please try again later.' },
    keyGenerator: keyByUserOrIp,
    store: buildStore(prefix),
  });
}

/**
 * Preset rate limit configurations.
 * Limits are conservative defaults suitable for staging; tune via env if needed.
 */
export const rateLimits = {
  auth: makeLimiter('auth', {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
  }),

  api: makeLimiter('api', {
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),

  chat: makeLimiter('chat', {
    windowMs: 60 * 1000,
    max: 20,
    message: 'Slow down! Too many messages.',
  }),

  passwordReset: makeLimiter('pwreset', {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts. Please try again later.',
  }),
};
