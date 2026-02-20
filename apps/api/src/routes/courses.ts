import { Hono } from "hono";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
  courses,
  users,
  lectures,
  lectureContents,
  groups,
  userGroups,
  sqlSolutions,
  sqlProblemContents,
  markdownContents,
  videoContents,
} from "@studykit/db/schema";
import { authMiddleware } from "../middleware/auth";
import { roleFromDbRole } from "../lib/jwt";

function resolveCourseAvatar(baseUrl: string, courseId: number, avatar: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
  return `${baseUrl}/uploads/course/avatar/${courseId}/${avatar}`;
}

function resolveUserAvatar(baseUrl: string, userId: number | null, avatar: string | null) {
  if (!avatar || !userId) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
  return `${baseUrl}/uploads/user/avatar/${userId}/${avatar}`;
}

function formatRailsDatetime(value: Date | string | null | undefined) {
  if (!value) return null;
  const iso = (value instanceof Date ? value : new Date(value)).toISOString();
  return iso.replace("T", " ").replace(".000Z", "");
}

const courseIdSchema = z.coerce.number().int().positive();

const userIdSchema = z.coerce.number().int().positive();

const listCoursesQuerySchema = z.object({
  owned_by: z.coerce.number().int().positive().optional(),
  participated_by: z.coerce.number().int().positive().optional(),
});

export const courseRoutes = new Hono();

courseRoutes.get("/", async (c) => {
  const parsedQuery = listCoursesQuerySchema.safeParse(c.req.query());
  if (!parsedQuery.success) {
    return c.json({ errors: ["Invalid query params"] }, 400);
  }

  const ownerId = parsedQuery.data.owned_by;
  const participatedBy = parsedQuery.data.participated_by;

  const base = db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      avatar: courses.avatar,
      ownerId: courses.ownerId,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
      ownerEmail: users.email,
      ownerAvatar: users.avatar,
      ownerRole: users.role,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .leftJoin(users, eq(courses.ownerId, users.id))
    .orderBy(desc(courses.updatedAt));

  const rows = ownerId
    ? await base.where(eq(courses.ownerId, ownerId))
    : participatedBy
      ? await base
          .leftJoin(groups, eq(groups.courseId, courses.id))
          .leftJoin(userGroups, eq(userGroups.groupId, groups.id))
          .where(eq(userGroups.userId, participatedBy))
      : await base;

  return c.json(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      avatar: resolveCourseAvatar(new URL(c.req.url).origin, row.id, row.avatar),
      owner: {
        id: row.ownerId,
        firstName: row.ownerFirstName,
        lastName: row.ownerLastName,
        email: row.ownerEmail,
        avatar: resolveUserAvatar(new URL(c.req.url).origin, row.ownerId, row.ownerAvatar),
        role: roleFromDbRole(row.ownerRole),
      },
    }))
  );
});

courseRoutes.get("/:id", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      avatar: courses.avatar,
      ownerId: courses.ownerId,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
      ownerEmail: users.email,
      ownerAvatar: users.avatar,
      ownerRole: users.role,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .leftJoin(users, eq(courses.ownerId, users.id))
    .where(eq(courses.id, parsedId.data))
    .limit(1);

  if (!course) {
    return c.json({ errors: ["Course not found"] }, 404);
  }

  const lecturesRows = await db
    .select({
      id: lectures.id,
      title: lectures.title,
      serialNumber: lectures.serialNumber,
      courseId: lectures.courseId,
    })
    .from(lectures)
    .where(eq(lectures.courseId, course.id))
    .orderBy(lectures.serialNumber);

  const contentRows = await db
    .select({
      id: lectureContents.id,
      lectureId: lectureContents.lectureId,
      serialNumber: lectureContents.serialNumber,
      type: lectureContents.actableType,
      actableId: lectureContents.actableId,
    })
    .from(lectureContents)
    .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
    .where(eq(lectures.courseId, course.id))
    .orderBy(lectureContents.serialNumber);

  const auth = c.get("auth");
  const solvedSqlProblemIds = await db
    .select({ sqlProblemId: sqlSolutions.sqlProblemId })
    .from(sqlSolutions)
    .where(and(eq(sqlSolutions.userId, auth.userId), eq(sqlSolutions.succeed, true)));

  const solvedProblemIds = solvedSqlProblemIds
    .map((row) => row.sqlProblemId)
    .filter((id): id is number => Number.isFinite(id));

  const solvedRows = solvedProblemIds.length
    ? await db
        .select({ lectureContentId: lectureContents.id })
        .from(sqlProblemContents)
        .leftJoin(
          lectureContents,
          and(eq(lectureContents.actableType, "SqlProblemContent"), eq(lectureContents.actableId, sqlProblemContents.id))
        )
        .where(inArray(sqlProblemContents.id, solvedProblemIds))
    : [];

  const markdownIds = contentRows
    .filter((content) => content.type === "MarkdownContent")
    .map((content) => content.actableId)
    .filter((id): id is number => Number.isFinite(id));
  const sqlContentIds = contentRows
    .filter((content) => content.type === "SqlProblemContent")
    .map((content) => content.actableId)
    .filter((id): id is number => Number.isFinite(id));
  const videoIds = contentRows
    .filter((content) => content.type === "VideoContent")
    .map((content) => content.actableId)
    .filter((id): id is number => Number.isFinite(id));

  const markdownRows = markdownIds.length
    ? await db
        .select({ id: markdownContents.id, title: markdownContents.title, body: markdownContents.body })
        .from(markdownContents)
        .where(inArray(markdownContents.id, markdownIds))
    : [];

  const sqlContentRows = sqlContentIds.length
    ? await db
        .select({
          id: sqlProblemContents.id,
          title: sqlProblemContents.title,
          body: sqlProblemContents.body,
          sqlProblemId: sqlProblemContents.sqlProblemId,
        })
        .from(sqlProblemContents)
        .where(inArray(sqlProblemContents.id, sqlContentIds))
    : [];

  const videoRows = videoIds.length
    ? await db
        .select({ id: videoContents.id, url: videoContents.url })
        .from(videoContents)
        .where(inArray(videoContents.id, videoIds))
    : [];

  const markdownMap = new Map(markdownRows.map((row) => [row.id, row]));
  const sqlContentMap = new Map(sqlContentRows.map((row) => [row.id, row]));
  const videoMap = new Map(videoRows.map((row) => [row.id, row]));

  const lecturesWithContent = lecturesRows.map((lecture) => ({
    ...lecture,
    content: contentRows
      .filter((content) => content.lectureId === lecture.id)
      .map((content) => {
        const base = {
          id: content.id,
          type: content.type,
          lecture_id: content.lectureId,
          serial_number: content.serialNumber,
          title:
            content.type === "MarkdownContent"
              ? markdownMap.get(content.actableId ?? -1)?.title
              : content.type === "SqlProblemContent"
                ? sqlContentMap.get(content.actableId ?? -1)?.title
                : undefined,
          body:
            content.type === "MarkdownContent"
              ? markdownMap.get(content.actableId ?? -1)?.body
              : content.type === "SqlProblemContent"
                ? sqlContentMap.get(content.actableId ?? -1)?.body
                : undefined,
          url: content.type === "VideoContent" ? videoMap.get(content.actableId ?? -1)?.url : undefined,
          sql_problem_id:
            content.type === "SqlProblemContent"
              ? sqlContentMap.get(content.actableId ?? -1)?.sqlProblemId
              : undefined,
        } as Record<string, unknown>;

        if (content.type === "SqlProblemContent") {
          base.sql_solutions = [];
        }

        return base;
      }),
  }));

  return c.json({
    id: course.id,
    title: course.title,
    description: course.description,
    avatar: resolveCourseAvatar(new URL(c.req.url).origin, course.id, course.avatar),
    createdAt: formatRailsDatetime(course.createdAt),
    owner: {
      id: course.ownerId,
      firstName: course.ownerFirstName,
      lastName: course.ownerLastName,
      email: course.ownerEmail,
      avatar: resolveUserAvatar(new URL(c.req.url).origin, course.ownerId, course.ownerAvatar),
      role: roleFromDbRole(course.ownerRole),
    },
    lectures: lecturesWithContent,
    solvedIds: Array.from(
      new Set(solvedRows.map((row) => row.lectureContentId).filter((id): id is number => Number.isFinite(id)))
    ),
  });
});

courseRoutes.get("/:id/participating", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const auth = c.get("auth");

  const [participation] = await db
    .select({ id: userGroups.id })
    .from(groups)
    .leftJoin(userGroups, and(eq(userGroups.groupId, groups.id), eq(userGroups.userId, auth.userId)))
    .where(eq(groups.courseId, parsedId.data))
    .limit(1);

  return c.json({ participating: Boolean(participation?.id) });
});

courseRoutes.post("/:id/join", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const auth = c.get("auth");
  const [group] = await db.select({ id: groups.id }).from(groups).where(eq(groups.courseId, parsedId.data)).limit(1);
  if (!group) {
    return c.json({ errors: ["Невозможно найти указанный курс"] }, 404);
  }

  const [existing] = await db
    .select({ id: userGroups.id })
    .from(userGroups)
    .where(and(eq(userGroups.groupId, group.id), eq(userGroups.userId, auth.userId)))
    .limit(1);

  if (existing) {
    return c.json({ errors: "Невозможно подписаться на курс" }, 422);
  }

  await db.insert(userGroups).values({ userId: auth.userId, groupId: group.id });
  return c.json({ data: "Вы успешно подписаны на курс" });
});

courseRoutes.delete("/:id/leave", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const auth = c.get("auth");
  const [group] = await db.select({ id: groups.id }).from(groups).where(eq(groups.courseId, parsedId.data)).limit(1);
  if (!group) {
    return c.json({ errors: ["Невозможно найти указанный курс"] }, 404);
  }

  const [existing] = await db
    .select({ id: userGroups.id })
    .from(userGroups)
    .where(and(eq(userGroups.groupId, group.id), eq(userGroups.userId, auth.userId)))
    .limit(1);

  if (!existing) {
    return c.json({ errors: ["Невозможно отписаться от курса"] }, 422);
  }

  await db.delete(userGroups).where(eq(userGroups.id, existing.id));
  return c.json({ data: "Вы успешно отписаны от курса" });
});

courseRoutes.get("/:id/participants/:userId/statistics", authMiddleware, async (c) => {
  const parsedCourseId = courseIdSchema.safeParse(c.req.param("id"));
  const parsedUserId = userIdSchema.safeParse(c.req.param("userId"));
  if (!parsedCourseId.success || !parsedUserId.success) {
    return c.json({ errors: ["Invalid params"] }, 400);
  }

  const auth = c.get("auth");
  if (auth.userId !== parsedUserId.data) {
    return c.json({ errors: ["Forbidden"] }, 403);
  }

  const [course] = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, parsedCourseId.data)).limit(1);
  if (!course) {
    return c.json({ errors: ["Невозможно найти указанный курс"] }, 404);
  }

  const problemRows = await db
    .select({ sqlProblemId: sqlProblemContents.sqlProblemId })
    .from(sqlProblemContents)
    .leftJoin(
      lectureContents,
      and(eq(lectureContents.actableType, "SqlProblemContent"), eq(lectureContents.actableId, sqlProblemContents.id))
    )
    .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
    .where(eq(lectures.courseId, parsedCourseId.data));

  const problemIds = new Set(problemRows.map((row) => row.sqlProblemId).filter((id): id is number => Number.isFinite(id)));

  const solvedRows = await db
    .select({ sqlProblemId: sqlSolutions.sqlProblemId })
    .from(sqlSolutions)
    .where(and(eq(sqlSolutions.userId, auth.userId), eq(sqlSolutions.succeed, true)));

  const solvedIds = new Set(solvedRows.map((row) => row.sqlProblemId).filter((id): id is number => Number.isFinite(id)));
  let solvedProblems = 0;
  for (const id of problemIds) {
    if (solvedIds.has(id)) solvedProblems += 1;
  }

  return c.json({
    data: {
      solved_problems: solvedProblems,
      problems: problemIds.size,
    },
  });
});
