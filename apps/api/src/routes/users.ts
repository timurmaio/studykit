import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users } from "@studykit/db/schema";
import { authMiddleware } from "../middleware/auth";
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
  return c.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    role: roleFromDbRole(user.role),
    jwtToken,
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
  return c.json(
    {
      ...created,
      role: roleFromDbRole(created.role),
      jwtToken,
    },
    201
  );
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
