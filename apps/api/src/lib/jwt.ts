import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "../env";

export type Role = "student" | "admin" | "teacher";

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: Role;
  iss?: string;
  aud?: string | string[];
  iat: number;
  exp: number;
  jti: string;
}

export async function signAccessToken(input: { userId: number; role: Role }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    {
      sub: String(input.userId),
      role: input.role,
      iss: env.JWT_ISSUER,
      aud: env.JWT_AUDIENCE,
      iat: now,
      exp: now + env.ACCESS_TOKEN_TTL_SECONDS,
      jti: crypto.randomUUID(),
    },
    env.JWT_SECRET,
    "HS256"
  );
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const payload = await verify(token, env.JWT_SECRET, {
    alg: "HS256",
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  });

  return payload as AccessTokenPayload;
}

export function roleFromDbRole(dbRole: number | null | undefined): Role {
  if (dbRole === 1) return "admin";
  if (dbRole === 2) return "teacher";
  return "student";
}
