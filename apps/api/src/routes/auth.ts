import { Hono } from "hono";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users, refreshTokens } from "@studykit/db/schema";
import { signAccessToken, roleFromDbRole } from "../lib/jwt";
import { createRefreshToken, hashRefreshToken } from "../lib/tokens";
import { env } from "../env";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { getClientIp } from "../lib/request-ip";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

type LoginUser = {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: number | null;
};

function normalizeUser(user: LoginUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: roleFromDbRole(user.role),
  };
}

async function issueTokens(input: { userId: number; role: number | null; userAgent?: string; ip?: string }) {
  const accessToken = await signAccessToken({
    userId: input.userId,
    role: roleFromDbRole(input.role),
  });

  const refresh = createRefreshToken();
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    id: refresh.id,
    userId: input.userId,
    tokenHash: refresh.hash,
    userAgent: input.userAgent,
    ip: input.ip,
    expiresAt,
  });

  return { accessToken, refreshToken: `${refresh.id}.${refresh.token}` };
}

export const authRoutes = new Hono();

authRoutes.post("/login", rateLimit({ keyPrefix: "auth:login", max: 5, windowMs: 15 * 60 * 1000 }), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(users)
    .where(
      sql`LOWER(${users.email}) = LOWER(${parsed.data.email}) AND crypt(${parsed.data.password}, ${users.passwordDigest}) = ${users.passwordDigest}`
    )
    .limit(1);

  if (!user) {
    return c.json({ errors: ["Invalid credentials"] }, 401);
  }

  const tokens = await issueTokens({
    userId: user.id,
    role: user.role,
    userAgent: c.req.header("user-agent"),
    ip: getClientIp(c),
  });

  return c.json({ user: normalizeUser(user), ...tokens });
});

authRoutes.post(
  "/refresh",
  rateLimit({ keyPrefix: "auth:refresh", max: 20, windowMs: 15 * 60 * 1000 }),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ errors: ["Invalid payload"] }, 400);
    }

    const [id, token] = parsed.data.refreshToken.split(".");
    if (!id || !token) {
      return c.json({ errors: ["Invalid refresh token"] }, 401);
    }

    const tokenHash = hashRefreshToken(token);
    const [rotated] = await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        lastUsedAt: new Date(),
        version: sql`${refreshTokens.version} + 1`,
      })
      .where(
        and(
          eq(refreshTokens.id, id),
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .returning({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
      });

    if (!rotated) {
      return c.json({ errors: ["Invalid refresh token"] }, 401);
    }

    const [user] = await db
      .select({ id: users.id, role: users.role, email: users.email, firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, rotated.userId))
      .limit(1);

    if (!user) {
      return c.json({ errors: ["Invalid refresh token"] }, 401);
    }

    const tokens = await issueTokens({
      userId: user.id,
      role: user.role,
      userAgent: c.req.header("user-agent"),
      ip: getClientIp(c),
    });

    return c.json({ user: normalizeUser(user), ...tokens });
  }
);

authRoutes.post("/logout", authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const [id, token] = parsed.data.refreshToken.split(".");
  if (!id || !token) {
    return c.json({ errors: ["Invalid refresh token"] }, 400);
  }

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, id), eq(refreshTokens.userId, c.get("auth").userId), eq(refreshTokens.tokenHash, hashRefreshToken(token))));

  return c.json({ data: "ok" });
});
