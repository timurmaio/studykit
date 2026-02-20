import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  lectureContents,
  markdownContents,
  sqlProblemContents,
  sqlSolutions,
  videoContents,
} from "@studykit/db/schema";
import { authMiddleware } from "../middleware/auth";

export const lectureRoutes = new Hono();

lectureRoutes.get("/:lectureId/content/:id", authMiddleware, async (c) => {
  const lectureId = Number(c.req.param("lectureId"));
  const contentId = Number(c.req.param("id"));
  if (!Number.isFinite(lectureId) || !Number.isFinite(contentId) || lectureId <= 0 || contentId <= 0) {
    return c.json({ errors: ["Invalid params"] }, 400);
  }

  const [content] = await db
    .select({
      id: lectureContents.id,
      type: lectureContents.actableType,
      lectureId: lectureContents.lectureId,
      serialNumber: lectureContents.serialNumber,
      actableId: lectureContents.actableId,
    })
    .from(lectureContents)
    .where(and(eq(lectureContents.id, contentId), eq(lectureContents.lectureId, lectureId)))
    .limit(1);

  if (!content) {
    return c.json({ errors: ["Not found"] }, 404);
  }

  if (content.type === "MarkdownContent") {
    const [item] = await db
      .select({ id: markdownContents.id, title: markdownContents.title, body: markdownContents.body })
      .from(markdownContents)
      .where(eq(markdownContents.id, content.actableId!))
      .limit(1);

    if (!item) return c.json({ errors: ["Not found"] }, 404);
    return c.json({
      id: content.id,
      type: content.type,
      lectureId: content.lectureId,
      serialNumber: content.serialNumber,
      title: item.title,
      body: item.body,
    });
  }

  if (content.type === "SqlProblemContent") {
    const [item] = await db
      .select({
        id: sqlProblemContents.id,
        title: sqlProblemContents.title,
        body: sqlProblemContents.body,
        sqlProblemId: sqlProblemContents.sqlProblemId,
      })
      .from(sqlProblemContents)
      .where(eq(sqlProblemContents.id, content.actableId!))
      .limit(1);

    if (!item) return c.json({ errors: ["Not found"] }, 404);

    const auth = c.get("auth");
    const solutions = await db
      .select({
        id: sqlSolutions.id,
        sql_problem_id: sqlSolutions.sqlProblemId,
        user_id: sqlSolutions.userId,
        code: sqlSolutions.code,
        succeed: sqlSolutions.succeed,
      })
      .from(sqlSolutions)
      .where(and(eq(sqlSolutions.sqlProblemId, item.sqlProblemId!), eq(sqlSolutions.userId, auth.userId)));

    return c.json({
      id: content.id,
      type: content.type,
      lectureId: content.lectureId,
      serialNumber: content.serialNumber,
      title: item.title,
      body: item.body,
      sqlProblemId: item.sqlProblemId,
      sqlSolutions: solutions,
    });
  }

  if (content.type === "VideoContent") {
    const [item] = await db
      .select({ id: videoContents.id, url: videoContents.url })
      .from(videoContents)
      .where(eq(videoContents.id, content.actableId!))
      .limit(1);

    if (!item) return c.json({ errors: ["Not found"] }, 404);
    return c.json({
      id: content.id,
      type: content.type,
      lectureId: content.lectureId,
      serialNumber: content.serialNumber,
      url: item.url,
    });
  }

  return c.json({ errors: ["Unsupported content type"] }, 422);
});
