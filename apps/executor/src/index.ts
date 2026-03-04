import { Database } from "bun:sqlite";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";

const HOST = process.env.EXECUTOR_HOST || "0.0.0.0";
const PORT = parseInt(process.env.EXECUTOR_PORT || "3200");

interface Payload {
  solutionId: number;
  code: string;
  initialCode?: string;
  solutionCode?: string;
  checkFunction?: string;
  executable?: boolean;
}

function castValue(value: string | number | null): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  }
  return value;
}

function executeQuery(db: Database, sql: string): unknown[][] {
  if (!sql || sql.trim() === "") return [];
  
  try {
    const stmt = db.query(sql);
    const rows = stmt.all();
    
    if (rows.length === 0) return [];
    
    const columns = Object.keys(rows[0] as object);
    return rows.map((row) => {
      const arr = columns.map((col) => castValue((row as Record<string, unknown>)[col]));
      return arr;
    });
  } catch (e) {
    throw new Error((e as Error).message);
  }
}

function arraysEqual(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[j][j]) return false;
    }
  }
  return true;
}

async function evaluate(payload: Payload): Promise<boolean> {
  if (payload.executable === false) return false;

  const dbPath = `/tmp/executor_${Date.now()}_${Math.random().toString(36).slice(2)}.sqlite`;
  
  try {
    execSync(`sqlite3 "${dbPath}" ""`, { stdio: "pipe" });
    
    const db = new Database(dbPath);
    
    if (payload.initialCode && payload.initialCode.trim()) {
      executeQuery(db, payload.initialCode);
    }
    
    const resultRows = executeQuery(db, payload.code);
    
    if (!payload.solutionCode || payload.solutionCode.trim() === "") {
      return false;
    }
    
    const expectedRows = executeQuery(db, payload.solutionCode);
    
    return arraysEqual(resultRows, expectedRows);
  } catch {
    return false;
  } finally {
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }
  }
}

const server = Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === "/health") {
      return Response.json({ status: "ok" });
    }
    
    if (url.pathname === "/execute" && req.method === "POST") {
      return (async () => {
        try {
          const payload: Payload = await req.json();
          
          if (!payload.solutionId || !payload.code || typeof payload.code !== "string") {
            return Response.json(
              { error: "Invalid payload" },
              { status: 400 }
            );
          }
          
          const succeed = await evaluate(payload);
          
          return Response.json({
            solutionId: payload.solutionId,
            succeed,
          });
        } catch {
          return Response.json(
            { error: "Invalid payload" },
            { status: 400 }
          );
        }
      })();
    }
    
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  },
});

console.log(`Executor (Bun) started on http://${HOST}:${PORT}`);
