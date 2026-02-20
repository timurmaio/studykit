import { sql } from "./db";

export async function bootstrap(): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id uuid PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash varchar(128) NOT NULL,
      user_agent text,
      ip varchar(100),
      expires_at timestamptz NOT NULL,
      revoked_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_used_at timestamptz,
      version bigint NOT NULL DEFAULT 1
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(user_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS refresh_tokens_hash_idx ON refresh_tokens(token_hash);
  `;
}
