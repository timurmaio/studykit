import { randomBytes, randomUUID, createHash } from "crypto";

export function createRefreshToken(): { id: string; token: string; hash: string } {
  const id = randomUUID();
  const token = randomBytes(48).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { id, token, hash };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
