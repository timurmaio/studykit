import { Hono } from "hono";
import { and, desc, eq, inArray, max } from "drizzle-orm";
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
  sqlProblems,
  markdownContents,
  videoContents,
  userLectureProgress,
} from "@studykit/db/schema";
import { authMiddleware } from "../middleware/auth";
import { authorize } from "../middleware/auth";
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

function formatDatetime(value: Date | string | null | undefined) {
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

const createCourseSchema = z.object({
  course: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  }),
});

courseRoutes.post("/", authMiddleware, authorize("teacher", "admin"), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload: title is required"] }, 400);
  }

  const auth = c.get("auth");
  const now = new Date();

  const [newCourse] = await db
    .insert(courses)
    .values({
      title: parsed.data.course.title,
      description: parsed.data.course.description ?? null,
      ownerId: auth.userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: courses.id });

  if (!newCourse) {
    return c.json({ errors: ["Failed to create course"] }, 500);
  }

  await db.insert(groups).values({
    courseId: newCourse.id,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(lectures).values({
    title: "Введение",
    courseId: newCourse.id,
    serialNumber: 1,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ id: newCourse.id, title: parsed.data.course.title }, 201);
});

const createContentSchema = z.object({
  course_content: z.object({
    lecture_id: z.number().int().positive(),
    title: z.string().min(1),
    body: z.string(),
    serial_number: z.union([z.number().int().min(0), z.string()]).optional(),
    type: z.enum(["MarkdownContent", "SqlProblemContent"]),
    initial_code: z.string().optional(),
    solution_code: z.string().optional(),
  }),
});

courseRoutes.post("/:id/content", authMiddleware, authorize("teacher", "admin"), async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createContentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const auth = c.get("auth");
  const { lecture_id, title, body: contentBody, serial_number, type } = parsed.data.course_content;
  const serialNumber = typeof serial_number === "string" ? parseInt(serial_number, 10) || 0 : (serial_number ?? 0);

  const [course] = await db
    .select({ id: courses.id, ownerId: courses.ownerId })
    .from(courses)
    .where(eq(courses.id, parsedId.data))
    .limit(1);

  if (!course || course.ownerId !== auth.userId) {
    return c.json({ errors: ["Course not found or access denied"] }, 404);
  }

  const [lecture] = await db
    .select({ id: lectures.id })
    .from(lectures)
    .where(and(eq(lectures.courseId, parsedId.data), eq(lectures.id, lecture_id)))
    .limit(1);

  if (!lecture) {
    return c.json({ errors: ["Lecture not found"] }, 404);
  }

  const now = new Date();

  if (type === "MarkdownContent") {
    const [mdContent] = await db
      .insert(markdownContents)
      .values({ title, body: contentBody })
      .returning({ id: markdownContents.id });

    if (!mdContent) return c.json({ errors: ["Failed to create content"] }, 500);

    const [lc] = await db
      .insert(lectureContents)
      .values({
        actableType: "MarkdownContent",
        lectureId: lecture.id,
        actableId: mdContent.id,
        serialNumber,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: lectureContents.id });

    return c.json({ id: lc?.id, type: "MarkdownContent" }, 201);
  }

  if (type === "SqlProblemContent") {
    const { initial_code, solution_code } = parsed.data.course_content;
    const initCode = initial_code ?? "SELECT 1;";
    const solCode = solution_code ?? "SELECT 1;";

    const [sqlProblem] = await db
      .insert(sqlProblems)
      .values({
        initialCode: initCode,
        solutionCode: solCode,
        checkFunction: null,
        executable: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: sqlProblems.id });

    if (!sqlProblem) return c.json({ errors: ["Failed to create SQL problem"] }, 500);

    const [sqlContent] = await db
      .insert(sqlProblemContents)
      .values({
        title,
        body: contentBody.slice(0, 255),
        sqlProblemId: sqlProblem.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: sqlProblemContents.id });

    if (!sqlContent) return c.json({ errors: ["Failed to create SQL content"] }, 500);

    const [lc] = await db
      .insert(lectureContents)
      .values({
        actableType: "SqlProblemContent",
        lectureId: lecture.id,
        actableId: sqlContent.id,
        serialNumber,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: lectureContents.id });

    return c.json({ id: lc?.id, type: "SqlProblemContent" }, 201);
  }

  return c.json({ errors: ["Unsupported content type"] }, 400);
});

const createLectureSchema = z.object({
  lecture: z.object({
    title: z.string().min(1),
    serial_number: z.number().int().min(0).optional(),
  }),
});

courseRoutes.post("/:id/lectures", authMiddleware, authorize("teacher", "admin"), async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createLectureSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const auth = c.get("auth");
  const [course] = await db
    .select({ id: courses.id, ownerId: courses.ownerId })
    .from(courses)
    .where(eq(courses.id, parsedId.data))
    .limit(1);

  if (!course || course.ownerId !== auth.userId) {
    return c.json({ errors: ["Course not found or access denied"] }, 404);
  }

  const [maxRow] = await db
    .select({ maxSerial: max(lectures.serialNumber) })
    .from(lectures)
    .where(eq(lectures.courseId, parsedId.data));

  const nextSerial = (maxRow?.maxSerial != null ? Math.max(0, Number(maxRow.maxSerial)) : 0) + 1;
  const serialNumber = parsed.data.lecture.serial_number ?? nextSerial;

  const now = new Date();
  const [lecture] = await db
    .insert(lectures)
    .values({
      title: parsed.data.lecture.title,
      courseId: parsedId.data,
      serialNumber,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: lectures.id, title: lectures.title, serialNumber: lectures.serialNumber });

  return c.json(lecture ?? {}, 201);
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
      createdAt: formatDatetime(course.createdAt),
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

courseRoutes.post("/:id/progress", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = z.object({
    lectureContentId: z.number().int().positive(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const auth = c.get("auth");
  const { lectureContentId } = parsed.data;

  const [content] = await db
    .select({ id: lectureContents.id })
    .from(lectureContents)
    .where(eq(lectureContents.id, lectureContentId))
    .limit(1);

  if (!content) {
    return c.json({ errors: ["Lecture content not found"] }, 404);
  }

  await db
    .insert(userLectureProgress)
    .values({
      userId: auth.userId,
      lectureContentId,
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  return c.json({ success: true });
});

courseRoutes.get("/:id/progress", authMiddleware, async (c) => {
  const parsedId = courseIdSchema.safeParse(c.req.param("id"));
  if (!parsedId.success) {
    return c.json({ errors: ["Invalid course id"] }, 400);
  }

  const auth = c.get("auth");

  const contentIds = await db
    .select({ id: lectureContents.id })
    .from(lectureContents)
    .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
    .where(eq(lectures.courseId, parsedId.data));

  const contentIdList = contentIds.map((r) => r.id);

  const progressRows = await db
    .select({ lectureContentId: userLectureProgress.lectureContentId })
    .from(userLectureProgress)
    .where(
      and(
        eq(userLectureProgress.userId, auth.userId),
        contentIdList.length > 0 ? inArray(userLectureProgress.lectureContentId, contentIdList) : eq(userLectureProgress.id, 0)
      )
    );

  const solvedProblemIds = await db
    .select({ sqlProblemId: sqlSolutions.sqlProblemId })
    .from(sqlSolutions)
    .where(and(eq(sqlSolutions.userId, auth.userId), eq(sqlSolutions.succeed, true)));

  const solvedIds = new Set(solvedProblemIds.map((r) => r.sqlProblemId).filter(Boolean));

  const solvedContentIds = await db
    .select({ lectureContentId: lectureContents.id })
    .from(sqlProblemContents)
    .leftJoin(
      lectureContents,
      and(eq(lectureContents.actableType, "SqlProblemContent"), eq(lectureContents.actableId, sqlProblemContents.id))
    )
    .where(inArray(sqlProblemContents.id, Array.from(solvedIds).filter((id): id is number => id != null)));

  const solvedContentIdSet = new Set(solvedContentIds.map((r) => r.lectureContentId).filter(Boolean));

  const allProgressIds = new Set([
    ...progressRows.map((r) => r.lectureContentId),
    ...solvedContentIdSet,
  ]);

  return c.json({
    viewedContentIds: Array.from(allProgressIds),
    totalContent: contentIdList.length,
    completedCount: allProgressIds.size,
  });
});
