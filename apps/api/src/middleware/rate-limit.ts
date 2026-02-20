import { createMiddleware } from "hono/factory";
import { getClientIp } from "../lib/request-ip";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

interface Options {
  keyPrefix: string;
  max: number;
  windowMs: number;
}

export function rateLimit(options: Options) {
  return createMiddleware(async (c, next) => {
    const ip = getClientIp(c);
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      await next();
      return;
    }

    if (current.count >= options.max) {
      c.header("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return c.json({ errors: ["Too many requests"] }, 429);
    }

    current.count += 1;
    buckets.set(key, current);
    await next();
  });
}
