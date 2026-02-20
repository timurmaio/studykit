import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().default(3100),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default("studykit-api-v2"),
  JWT_AUDIENCE: z.string().default("studykit-frontend"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(15 * 60),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:3001"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
export const trustProxy = env.TRUST_PROXY === "true";
