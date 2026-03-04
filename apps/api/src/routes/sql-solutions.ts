import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { sqlSolutions } from "@studykit/db/schema";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { sqlCheckQueue } from "../queue";
import Redis from "ioredis";
import { env } from "../env";
import { SQL_SOLUTION_CHANNEL } from "../redis";

const createSchema = z.union([
  z.object({
    sqlProblemId: z.number().int().positive(),
    code: z.string().min(1).max(10000),
  }),
  z.object({
    sql_solution: z.object({
      sql_problem_id: z.number().int().positive(),
      code: z.string().min(1).max(10000),
    }),
  }),
]);

export const sqlSolutionRoutes = new Hono();

sqlSolutionRoutes.post(
  "/",
  authMiddleware,
  rateLimit({ keyPrefix: "sql:submit", max: 20, windowMs: 60 * 1000 }),
  async (c) => {
    const body = await c.req.json().catch(() => null);

    if (body && typeof body === "object" && "sql_solution" in (body as Record<string, unknown>)) {
      const nested = (body as Record<string, any>).sql_solution;
      if (!nested || typeof nested !== "object") {
        return c.json({ errors: "param is missing or the value is empty: sql_solution" }, 400);
      }

      if (!nested.code || String(nested.code).trim() === "") {
        return c.json({ errors: ["Код решения не может быть пустым"] }, 422);
      }
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ errors: ["Invalid payload"] }, 400);
    }

    const payload = "sql_solution" in parsed.data
      ? {
          sqlProblemId: parsed.data.sql_solution.sql_problem_id,
          code: parsed.data.sql_solution.code,
        }
      : parsed.data;

    const auth = c.get("auth");

    const [solution] = await db
      .insert(sqlSolutions)
      .values({
        sqlProblemId: payload.sqlProblemId,
        code: payload.code,
        userId: auth.userId,
        succeed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: sqlSolutions.id,
        sqlProblemId: sqlSolutions.sqlProblemId,
        userId: sqlSolutions.userId,
        code: sqlSolutions.code,
        succeed: sqlSolutions.succeed,
      });

    try {
      await sqlCheckQueue.add(
        "check",
        {
          solutionId: solution.id,
          code: payload.code,
          userId: auth.userId,
        },
        {
          attempts: 3,
          removeOnComplete: 50,
          removeOnFail: 200,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );
    } catch {
      await db.delete(sqlSolutions).where(eq(sqlSolutions.id, solution.id));
      return c.json({ errors: ["Queue is temporarily unavailable"] }, 503);
    }

    return c.json(solution, 201);
  }
);

sqlSolutionRoutes.get("/:id/stream", authMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ errors: ["Invalid solution id"] }, 400);
  }

  const auth = c.get("auth");
  const channel = `${SQL_SOLUTION_CHANNEL}:${id}`;
  const STREAM_TIMEOUT_MS = 120_000;

  return streamSSE(c, async (stream) => {
    const [solution] = await db
      .select({
        succeed: sqlSolutions.succeed,
      })
      .from(sqlSolutions)
      .where(and(eq(sqlSolutions.id, id), eq(sqlSolutions.userId, auth.userId)))
      .limit(1);

    if (!solution) {
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({ errors: ["Not found"] }),
      });
      stream.close();
      return;
    }

    if (solution.succeed !== null) {
      await stream.writeSSE({
        event: "result",
        data: JSON.stringify({ succeed: solution.succeed }),
      });
      stream.close();
      return;
    }

    const sub = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
    let timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {}, 0);

    const result = await new Promise<{ succeed: boolean | null; timeout?: boolean }>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve({ succeed: null, timeout: true });
      }, STREAM_TIMEOUT_MS);

      sub.subscribe(channel).catch(() => resolve({ succeed: null }));

      sub.on("message", (ch: string, message: string) => {
        if (ch === channel) {
          clearTimeout(timeoutId);
          try {
            const parsed = JSON.parse(message) as { succeed: boolean | null };
            resolve({ succeed: parsed.succeed });
          } catch {
            resolve({ succeed: null });
          }
        }
      });
    });

    clearTimeout(timeoutId);
    sub.unsubscribe(channel).catch(() => {});
    sub.quit().catch(() => {});

    await stream.writeSSE({
      event: "result",
      data: JSON.stringify(result),
    });
    stream.close();
  });
});
