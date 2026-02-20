import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 255 }),
  passwordDigest: varchar("password_digest", { length: 255 }),
  role: integer("role").default(0),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  avatar: varchar("avatar", { length: 255 }),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  ownerId: integer("owner_id"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const lectures = pgTable("lectures", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }),
  courseId: integer("course_id"),
  serialNumber: integer("serial_number"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const groups = pgTable("groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const userGroups = pgTable("user_groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id"),
  groupId: integer("group_id"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const lectureContents = pgTable("lecture_contents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  actableType: varchar("actable_type", { length: 255 }),
  lectureId: integer("lecture_id"),
  serialNumber: integer("serial_number"),
  actableId: integer("actable_id"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const sqlSolutions = pgTable("sql_solutions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sqlProblemId: integer("sql_problem_id"),
  userId: integer("user_id"),
  code: text("code"),
  succeed: boolean("succeed"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const sqlProblemContents = pgTable("sql_problem_contents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }),
  body: varchar("body", { length: 255 }),
  sqlProblemId: integer("sql_problem_id"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const markdownContents = pgTable("markdown_contents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
});

export const videoContents = pgTable("video_contents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  url: varchar("url", { length: 255 }),
});

export const sqlProblems = pgTable("sql_problems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  initialCode: text("initial_code"),
  solutionCode: text("solution_code"),
  checkFunction: text("check_function"),
  executable: boolean("executable"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull(),
  userAgent: text("user_agent"),
  ip: varchar("ip", { length: 100 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  version: bigint("version", { mode: "number" }).default(1).notNull(),
});
