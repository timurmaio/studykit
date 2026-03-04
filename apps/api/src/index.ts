import { serve } from "@hono/node-server";
import { env } from "./env";
import { bootstrap } from "./bootstrap";
import { app } from "./app";

bootstrap()
  .then(() => {
    serve(
      {
        fetch: app.fetch,
        hostname: env.API_HOST,
        port: env.API_PORT,
      },
      (info) => {
        console.log(`API listening at http://${info.address}:${info.port}`);
      }
    );
  })
  .catch((error) => {
    console.error("Failed to bootstrap API", error);
    process.exit(1);
  });
