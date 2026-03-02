import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { env } from "../env";
import {
  users,
  courses,
  groups,
  userGroups,
  lectures,
  lectureContents,
  sqlSolutions,
  sqlProblemContents,
  userLectureProgress,
} from "@studykit/db/schema";
import { authMiddleware, AUTH_COOKIE_NAME } from "../middleware/auth";
import { roleFromDbRole, signAccessToken } from "../lib/jwt";

const loginSchema = z.object({
  user: z.object({
    email: z.string().min(1),
    password: z.string().min(1),
  }),
});

const createUserSchema = z.object({
  user: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(1),
    avatar: z.string().optional(),
  }),
});

export const userRoutes = new Hono();

userRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: "param is missing or the value is empty: user" }, 400);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      role: users.role,
    })
    .from(users)
    .where(
      sql`LOWER(${users.email}) = LOWER(${parsed.data.user.email}) AND crypt(${parsed.data.user.password}, ${users.passwordDigest}) = ${users.passwordDigest}`
    )
    .limit(1);

  if (!user) {
    const [byEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${parsed.data.user.email})`)
      .limit(1);
    if (!byEmail) {
      return c.json({ errors: "User with specified email not found" }, 404);
    }
    return c.json({ errors: "Incorrect password" }, 401);
  }

  const jwtToken = await signAccessToken({ userId: user.id, role: roleFromDbRole(user.role) });

  setCookie(c, AUTH_COOKIE_NAME, jwtToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
  });

  return c.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    role: roleFromDbRole(user.role),
  });
});

userRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ errors: ["param is missing or the value is empty: user"] }, 400);
  }

  const email = parsed.data.user.email.trim();
  const [existing] = await db.select({ id: users.id }).from(users).where(sql`LOWER(${users.email}) = LOWER(${email})`).limit(1);
  if (existing) {
    return c.json({ errors: ["Email уже существует"] }, 422);
  }

  const [created] = await db
    .insert(users)
    .values({
      firstName: parsed.data.user.first_name,
      lastName: parsed.data.user.last_name,
      email,
      passwordDigest: sql`crypt(${parsed.data.user.password}, gen_salt('bf'))`,
      avatar: parsed.data.user.avatar ?? null,
      role: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
    });

  const jwtToken = await signAccessToken({ userId: created.id, role: roleFromDbRole(created.role) });

  setCookie(c, AUTH_COOKIE_NAME, jwtToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
  });

  return c.json(
    {
      ...created,
      role: roleFromDbRole(created.role),
    },
    201
  );
});

userRoutes.post("/logout", (c) => {
  deleteCookie(c, AUTH_COOKIE_NAME, { path: "/" });
  return c.json({ ok: true }, 200);
});

userRoutes.get("/me", authMiddleware, async (c) => {
  const auth = c.get("auth");

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user) {
    return c.json({ errors: ["Not found"] }, 404);
  }

  return c.json({
    ...user,
    role: roleFromDbRole(user.role),
  });
});

userRoutes.get("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ errors: ["Invalid user id"] }, 400);
  }

  const auth = c.get("auth");
  if (auth.userId !== id) {
    return c.json({ errors: "You can view only your own account" }, 403);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return c.json({ errors: ["User not found"] }, 404);
  }

  return c.json({
    ...user,
    role: roleFromDbRole(user.role),
  });
});

userRoutes.put("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ errors: ["Invalid user id"] }, 400);
  }

  const auth = c.get("auth");
  if (auth.userId !== id) {
    return c.json({ errors: "You can edit only your own account" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ errors: ["Invalid payload"] }, 400);
  }

  const { firstName, lastName } = parsed.data;

  await db
    .update(users)
    .set({
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  const [updatedUser] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return c.json({
    ...updatedUser,
    role: roleFromDbRole(updatedUser.role),
  });
});

userRoutes.get("/:id/courses", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ errors: ["Invalid user id"] }, 400);
  }

  const auth = c.get("auth");
  if (auth.userId !== id) {
    return c.json({ errors: "You can view only your own courses" }, 403);
  }

  const userCourseIds = await db
    .select({ courseId: groups.courseId })
    .from(groups)
    .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
    .where(eq(userGroups.userId, auth.userId));

  const courseIdList = userCourseIds
    .map((r) => r.courseId)
    .filter((id): id is number => id != null);

  if (courseIdList.length === 0) {
    return c.json([]);
  }

  const courseRows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      avatar: courses.avatar,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
    })
    .from(courses)
    .leftJoin(users, eq(courses.ownerId, users.id))
    .where(inArray(courses.id, courseIdList));

  const result = await Promise.all(
    courseRows.map(async (course) => {
      const contentCountResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(lectureContents)
        .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
        .where(eq(lectures.courseId, course.id));

      const progressCountResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT user_lecture_progress.lecture_content_id)` })
        .from(userLectureProgress)
        .leftJoin(lectureContents, eq(userLectureProgress.lectureContentId, lectureContents.id))
        .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
        .where(
          and(
            eq(userLectureProgress.userId, auth.userId),
            eq(lectures.courseId, course.id)
          )
        );

      const solvedProblemsResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT sql_problem_contents.id)` })
        .from(sqlSolutions)
        .leftJoin(sqlProblemContents, eq(sqlSolutions.sqlProblemId, sqlProblemContents.id))
        .leftJoin(lectureContents, and(
          eq(lectureContents.actableType, "SqlProblemContent"),
          eq(lectureContents.actableId, sqlProblemContents.id)
        ))
        .leftJoin(lectures, eq(lectures.id, lectureContents.lectureId))
        .where(
          and(
            eq(sqlSolutions.userId, auth.userId),
            eq(sqlSolutions.succeed, true),
            eq(lectures.courseId, course.id)
          )
        );

      const totalContent = contentCountResult[0]?.count || 0;
      const completedContent = progressCountResult[0]?.count || 0;
      const solved = solvedProblemsResult[0]?.count || 0;

      // Combine viewed content and solved SQL problems for completion
      const allCompleted = Math.max(completedContent, solved);
      const percentage = totalContent > 0 ? Math.round((allCompleted / totalContent) * 100) : 0;

      return {
        ...course,
        owner: {
          firstName: course.ownerFirstName,
          lastName: course.ownerLastName,
        },
        progress: {
          totalContent,
          completedContent: allCompleted,
          solvedProblems: solved,
          percentage: Math.min(100, percentage),
        },
      };
    })
  );

  return c.json(result);
});
