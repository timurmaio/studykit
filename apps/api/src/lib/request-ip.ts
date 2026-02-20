import type { Context } from "hono";
import { trustProxy } from "../env";

export function getClientIp(c: Context): string {
  if (trustProxy) {
    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }

    const realIp = c.req.header("x-real-ip");
    if (realIp) return realIp;
  }

  return "direct";
}
