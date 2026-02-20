import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env, corsOrigins } from "./env";
import { bootstrap } from "./bootstrap";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { courseRoutes } from "./routes/courses";
import { sqlSolutionRoutes } from "./routes/sql-solutions";
import { lectureRoutes } from "./routes/lectures";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "";
      return corsOrigins.includes(origin) ? origin : "";
    },
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/ready", async (c) => c.json({ status: "ready" }));

const v2 = new Hono();
v2.route("/auth", authRoutes);
v2.route("/users", userRoutes);
v2.route("/courses", courseRoutes);
v2.route("/lectures", lectureRoutes);
v2.route("/sql-solutions", sqlSolutionRoutes);
v2.route("/sql_solutions", sqlSolutionRoutes);

app.route("/api/v2", v2);
app.route("/api", v2);

app.notFound((c) => c.json({ errors: ["Not found"] }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ errors: ["Internal server error"] }, 500);
});

bootstrap()
  .then(() => {
    serve(
      {
        fetch: app.fetch,
        hostname: env.API_HOST,
        port: env.API_PORT,
      },
      (info) => {
        console.log(`API v2 listening at http://${info.address}:${info.port}`);
      }
    );
  })
  .catch((error) => {
    console.error("Failed to bootstrap API v2", error);
    process.exit(1);
  });
