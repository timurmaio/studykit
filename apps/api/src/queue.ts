import { Queue } from "bullmq";
import { env } from "./env";

export const sqlCheckQueue = new Queue("sql-solution-check", {
  connection: {
    url: env.REDIS_URL,
  },
});
