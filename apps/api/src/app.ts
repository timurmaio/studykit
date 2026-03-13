import { Hono } from "hono";
import { cors } from "hono/cors";
import { userRoutes } from "./routes/users";
import { courseRoutes } from "./routes/courses";
import { sqlSolutionRoutes } from "./routes/sql-solutions";
import { lectureRoutes } from "./routes/lectures";
import { env, corsOrigins } from "./env";
import { openApiSpec } from "../openapi";

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
app.get("/openapi.json", (c) => c.json(openApiSpec));
app.get("/docs", (c) =>
  c.html(`<!DOCTYPE html>
<html>
<head>
  <title>StudyKit API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>`)
);

const api = new Hono();
api.route("/users", userRoutes);
api.route("/courses", courseRoutes);
api.route("/lectures", lectureRoutes);
api.route("/sql-solutions", sqlSolutionRoutes);

app.route("/api", api);

app.notFound((c) => c.json({ errors: ["Not found"] }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ errors: ["Internal server error"] }, 500);
});

export type AppType = typeof app;
export { app };
