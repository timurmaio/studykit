import { Worker } from "bullmq";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { sqlProblems, sqlSolutions } from "@studykit/db/schema";

const REDIS_URL = process.env.REDIS_URL;
const DATABASE_URL = process.env.DATABASE_URL;
const EXECUTOR_URL = process.env.EXECUTOR_URL || "http://executor_v2:3200";

if (!REDIS_URL || !DATABASE_URL) {
  throw new Error("REDIS_URL and DATABASE_URL are required");
}

const pg = postgres(DATABASE_URL, { max: 5, prepare: false });
const db = drizzle(pg);

type CheckJob = {
  solutionId: number;
  code: string;
  userId: number;
  sqlProblemId: number;
};

type SqlProblemPayload = {
  initialCode: string | null;
  checkFunction: string | null;
  solutionCode: string | null;
  executable: boolean | null;
};

async function evaluateByExecutor(payload: {
  solutionId: number;
  code: string;
  initialCode: string | null;
  checkFunction: string | null;
  solutionCode: string | null;
  executable: boolean | null;
}): Promise<boolean | null> {
  const response = await fetch(`${EXECUTOR_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Executor error: ${response.status}`);
  }

  const data = (await response.json()) as { succeed: boolean | null };
  return data.succeed;
}

async function evaluateSolution(solutionId: number): Promise<boolean | null> {
  const [solution] = await db
    .select({
      id: sqlSolutions.id,
      sqlProblemId: sqlSolutions.sqlProblemId,
      code: sqlSolutions.code,
    })
    .from(sqlSolutions)
    .where(eq(sqlSolutions.id, solutionId))
    .limit(1);

  if (!solution || !solution.sqlProblemId || !solution.code) {
    return false;
  }

  const [problem] = await db
    .select({
      initialCode: sqlProblems.initialCode,
      checkFunction: sqlProblems.checkFunction,
      solutionCode: sqlProblems.solutionCode,
      executable: sqlProblems.executable,
    })
    .from(sqlProblems)
    .where(eq(sqlProblems.id, solution.sqlProblemId))
    .limit(1);

  if (!problem) {
    return false;
  }

  return evaluateByExecutor({
    solutionId: solution.id,
    code: solution.code,
    initialCode: problem.initialCode,
    checkFunction: problem.checkFunction,
    solutionCode: problem.solutionCode,
    executable: problem.executable,
  });
}

const worker = new Worker<CheckJob>(
  "sql-solution-check",
  async (job) => {
    const succeed = await evaluateSolution(job.data.solutionId);

    await db
      .update(sqlSolutions)
      .set({
        succeed,
        updatedAt: new Date(),
      })
      .where(eq(sqlSolutions.id, job.data.solutionId));
  },
  {
    connection: { url: REDIS_URL },
    concurrency: 4,
  }
);

worker.on("completed", (job) => {
  console.log("Job completed", job.id);
});

worker.on("failed", (job, error) => {
  console.error("Job failed", job?.id, error);
});

console.log("Worker v2 started");
