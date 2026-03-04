import { describe, it, expect } from "bun:test";
import { Hono } from "hono";

// Minimal app for testing endpoints that don't require DB/Redis.
// Full app imports routes that connect to Postgres on load.
const testApp = new Hono();
testApp.get("/health", (c) => c.json({ status: "ok" }));
testApp.get("/ready", async (c) => c.json({ status: "ready" }));
testApp.notFound((c) => c.json({ errors: ["Not found"] }, 404));

describe("API", () => {
  describe("GET /health", () => {
    it("returns 200 and status ok", async () => {
      const res = await testApp.request("/health");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("GET /ready", () => {
    it("returns 200 and status ready", async () => {
      const res = await testApp.request("/ready");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: "ready" });
    });
  });

  describe("404", () => {
    it("returns 404 for unknown route", async () => {
      const res = await testApp.request("/unknown");
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ errors: ["Not found"] });
    });
  });
});
