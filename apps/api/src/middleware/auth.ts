import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verifyAccessToken, type Role } from "../lib/jwt";

export const AUTH_COOKIE_NAME = "auth_token";

export interface AuthContext {
  userId: number;
  role: Role;
}

export const authMiddleware = createMiddleware<{ Variables: { auth: AuthContext } }>(
  async (c, next) => {
    const authorization = c.req.header("authorization");
    const tokenFromHeader = authorization
      ? authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : authorization
      : null;

    const tokenFromCookie = getCookie(c, AUTH_COOKIE_NAME);
    const token = tokenFromHeader ?? tokenFromCookie;

    if (!token) {
      return c.json({ errors: ["Необходимо войти на сайт"] }, 401);
    }

    try {
      const payload = await verifyAccessToken(token);
      if (!payload.sub || !payload.role) {
        return c.json({ errors: ["Необходимо войти на сайт"] }, 401);
      }

      c.set("auth", {
        userId: Number(payload.sub),
        role: payload.role,
      });
      await next();
    } catch {
      return c.json({ errors: ["Необходимо войти на сайт"] }, 401);
    }
  }
);

export function authorize(...roles: Role[]) {
  return createMiddleware<{ Variables: { auth: AuthContext } }>(async (c, next) => {
    const auth = c.get("auth");
    if (!roles.includes(auth.role)) {
      return c.json({ errors: ["Forbidden"] }, 403);
    }

    await next();
  });
}
