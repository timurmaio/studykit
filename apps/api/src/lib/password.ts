declare const Bun:
  | undefined
  | {
      password: {
        hash(password: string, options?: { algorithm: "argon2id" }): Promise<string>;
        verify(password: string, hash: string): Promise<boolean>;
      };
    };

export async function hashPassword(password: string): Promise<string> {
  if (typeof Bun === "undefined" || !Bun.password) {
    throw new Error("Bun runtime is required for password hashing");
  }

  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof Bun !== "undefined" && Bun.password) {
    try {
      return await Bun.password.verify(password, hash);
    } catch {
      // fall through to bcryptjs verification
    }
  }

  const bcrypt = await import("bcrypt-ts");
  return bcrypt.compareSync(password, hash);
}
