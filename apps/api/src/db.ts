import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@studykit/db/schema";
import { env } from "./env";

export const sql = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
});

export const db = drizzle(sql, { schema });
