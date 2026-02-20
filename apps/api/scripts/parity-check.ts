type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const railsBase = process.env.RAILS_BASE_URL || "http://localhost:3000";
const v2Base = process.env.V2_BASE_URL || "http://localhost:3100";
const email = process.env.PARITY_EMAIL || process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.PARITY_PASSWORD || process.env.ADMIN_PASSWORD || "change_me_please";

function normalize(value: Json): Json {
  if (Array.isArray(value)) {
    const normalized = value.map(normalize);
    if (normalized.every((item) => item && typeof item === "object" && !Array.isArray(item) && "id" in (item as any))) {
      return [...normalized].sort((a: any, b: any) => Number(a.id) - Number(b.id));
    }
    return normalized;
  }
  if (value && typeof value === "object") {
    const result: Record<string, Json> = {};
    for (const key of Object.keys(value).sort()) {
      if (key === "jwtToken") {
        result[key] = "<token>";
        continue;
      }
      if (key === "createdAt" || key === "updatedAt") {
        result[key] = "<datetime>";
        continue;
      }
      result[key] = normalize((value as Record<string, Json>)[key]);
    }
    return result;
  }
  if (typeof value === "string") {
    const uploadMatch = value.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/);
    if (uploadMatch) {
      return `<host>${uploadMatch[1]}`;
    }
  }
  return value;
}

async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: Json = text as Json;
  try {
    body = JSON.parse(text);
  } catch {
    // non-json
  }
  return { status: res.status, body };
}

function assertEqual(name: string, left: unknown, right: unknown) {
  const a = JSON.stringify(left);
  const b = JSON.stringify(right);
  if (a !== b) {
    throw new Error(`${name} mismatch\nRails: ${a}\nV2: ${b}`);
  }
}

async function main() {
  console.log(`Checking parity: rails=${railsBase}, v2=${v2Base}`);

  const payload = JSON.stringify({ user: { email, password } });
  const [railsLogin, v2Login] = await Promise.all([
    request(`${railsBase}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }),
    request(`${v2Base}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }),
  ]);

  assertEqual("login.status", railsLogin.status, v2Login.status);
  assertEqual("login.body", normalize(railsLogin.body), normalize(v2Login.body));

  const railsToken = (railsLogin.body as any).jwtToken as string;
  const v2Token = (v2Login.body as any).jwtToken as string;
  const userId = (v2Login.body as any).id as number;

  const [railsUser, v2User] = await Promise.all([
    request(`${railsBase}/api/users/${userId}`, { headers: { Authorization: railsToken } }),
    request(`${v2Base}/api/users/${userId}`, { headers: { Authorization: v2Token } }),
  ]);
  assertEqual("users.show.status", railsUser.status, v2User.status);
  assertEqual("users.show.body", normalize(railsUser.body), normalize(v2User.body));

  const [railsCourses, v2Courses] = await Promise.all([
    request(`${railsBase}/api/courses`),
    request(`${v2Base}/api/courses`),
  ]);
  assertEqual("courses.index.status", railsCourses.status, v2Courses.status);
  assertEqual("courses.index.length", (railsCourses.body as any[]).length, (v2Courses.body as any[]).length);

  const courseId = (railsCourses.body as any[])[0]?.id;
  if (!courseId) throw new Error("No course found for parity check");

  const [railsCourse, v2Course] = await Promise.all([
    request(`${railsBase}/api/courses/${courseId}`, { headers: { Authorization: railsToken } }),
    request(`${v2Base}/api/courses/${courseId}`, { headers: { Authorization: v2Token } }),
  ]);
  assertEqual("courses.show.status", railsCourse.status, v2Course.status);
  assertEqual("courses.show.body", normalize(railsCourse.body), normalize(v2Course.body));

  const [railsPart, v2Part] = await Promise.all([
    request(`${railsBase}/api/courses/${courseId}/participating`, { headers: { Authorization: railsToken } }),
    request(`${v2Base}/api/courses/${courseId}/participating`, { headers: { Authorization: v2Token } }),
  ]);
  assertEqual("courses.participating.status", railsPart.status, v2Part.status);
  assertEqual("courses.participating.body", normalize(railsPart.body), normalize(v2Part.body));

  const [railsStats, v2Stats] = await Promise.all([
    request(`${railsBase}/api/courses/${courseId}/participants/${userId}/statistics`, {
      headers: { Authorization: railsToken },
    }),
    request(`${v2Base}/api/courses/${courseId}/participants/${userId}/statistics`, {
      headers: { Authorization: v2Token },
    }),
  ]);
  assertEqual("courses.statistics.status", railsStats.status, v2Stats.status);
  assertEqual("courses.statistics.body", normalize(railsStats.body), normalize(v2Stats.body));

  const lectureId = (railsCourse.body as any)?.lectures?.[0]?.id;
  const contentId = (railsCourse.body as any)?.lectures?.[0]?.content?.[0]?.id;
  if (!lectureId || !contentId) {
    throw new Error("No lecture content found for parity check");
  }

  const [railsContent, v2Content] = await Promise.all([
    request(`${railsBase}/api/lectures/${lectureId}/content/${contentId}`, {
      headers: { Authorization: railsToken },
    }),
    request(`${v2Base}/api/lectures/${lectureId}/content/${contentId}`, {
      headers: { Authorization: v2Token },
    }),
  ]);
  assertEqual("lecture-content.status", railsContent.status, v2Content.status);
  assertEqual("lecture-content.body", normalize(railsContent.body), normalize(v2Content.body));

  const sqlPayload = JSON.stringify({
    sql_solution: {
      sql_problem_id: 1,
      code: "select 1",
    },
  });
  const [railsSqlCreate, v2SqlCreate] = await Promise.all([
    request(`${railsBase}/api/sql_solutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: railsToken },
      body: sqlPayload,
    }),
    request(`${v2Base}/api/sql_solutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: v2Token },
      body: sqlPayload,
    }),
  ]);
  assertEqual("sql.create.status", railsSqlCreate.status, v2SqlCreate.status);
  assertEqual(
    "sql.create.body-shape",
    normalize({ ...railsSqlCreate.body, id: "<id>" } as any),
    normalize({ ...v2SqlCreate.body, id: "<id>" } as any)
  );

  const [railsSqlShow, v2SqlShow] = await Promise.all([
    request(`${railsBase}/api/sql_solutions/${(railsSqlCreate.body as any).id}`, {
      headers: { Authorization: railsToken },
    }),
    request(`${v2Base}/api/sql_solutions/${(v2SqlCreate.body as any).id}`, {
      headers: { Authorization: v2Token },
    }),
  ]);
  assertEqual("sql.show.status", railsSqlShow.status, v2SqlShow.status);
  assertEqual(
    "sql.show.body-shape",
    normalize({ ...railsSqlShow.body, id: "<id>", succeed: "<state>" } as any),
    normalize({ ...v2SqlShow.body, id: "<id>", succeed: "<state>" } as any)
  );

  const [railsLoginWrong, v2LoginWrong] = await Promise.all([
    request(`${railsBase}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email, password: "wrong-password" } }),
    }),
    request(`${v2Base}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email, password: "wrong-password" } }),
    }),
  ]);
  assertEqual("login.wrong.status", railsLoginWrong.status, v2LoginWrong.status);
  assertEqual("login.wrong.body", normalize(railsLoginWrong.body), normalize(v2LoginWrong.body));

  const [railsLoginUnknown, v2LoginUnknown] = await Promise.all([
    request(`${railsBase}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email: "nouser@example.com", password: "x" } }),
    }),
    request(`${v2Base}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email: "nouser@example.com", password: "x" } }),
    }),
  ]);
  assertEqual("login.unknown.status", railsLoginUnknown.status, v2LoginUnknown.status);
  assertEqual("login.unknown.body", normalize(railsLoginUnknown.body), normalize(v2LoginUnknown.body));

  const [railsUnauthPart, v2UnauthPart] = await Promise.all([
    request(`${railsBase}/api/courses/${courseId}/participating`),
    request(`${v2Base}/api/courses/${courseId}/participating`),
  ]);
  assertEqual("participating.unauth.status", railsUnauthPart.status, v2UnauthPart.status);
  assertEqual("participating.unauth.body", normalize(railsUnauthPart.body), normalize(v2UnauthPart.body));

  const invalidSqlPayload = JSON.stringify({ sql_solution: { sql_problem_id: 1 } });
  const [railsSqlInvalid, v2SqlInvalid] = await Promise.all([
    request(`${railsBase}/api/sql_solutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: railsToken },
      body: invalidSqlPayload,
    }),
    request(`${v2Base}/api/sql_solutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: v2Token },
      body: invalidSqlPayload,
    }),
  ]);
  assertEqual("sql.invalid.status", railsSqlInvalid.status, v2SqlInvalid.status);
  assertEqual("sql.invalid.body", normalize(railsSqlInvalid.body), normalize(v2SqlInvalid.body));

  const [railsJoinMissing, v2JoinMissing] = await Promise.all([
    request(`${railsBase}/api/courses/999999/join`, {
      method: "POST",
      headers: { Authorization: railsToken },
    }),
    request(`${v2Base}/api/courses/999999/join`, {
      method: "POST",
      headers: { Authorization: v2Token },
    }),
  ]);
  assertEqual("join.not-found.status", railsJoinMissing.status, v2JoinMissing.status);
  assertEqual("join.not-found.body", normalize(railsJoinMissing.body), normalize(v2JoinMissing.body));

  const [railsLeaveMissing, v2LeaveMissing] = await Promise.all([
    request(`${railsBase}/api/courses/999999/leave`, {
      method: "DELETE",
      headers: { Authorization: railsToken },
    }),
    request(`${v2Base}/api/courses/999999/leave`, {
      method: "DELETE",
      headers: { Authorization: v2Token },
    }),
  ]);
  assertEqual("leave.not-found.status", railsLeaveMissing.status, v2LeaveMissing.status);
  assertEqual("leave.not-found.body", normalize(railsLeaveMissing.body), normalize(v2LeaveMissing.body));

  const duplicateSignupPayload = JSON.stringify({
    user: {
      first_name: "Parity",
      last_name: "Tester",
      email,
      password: "test-password",
    },
  });
  const [railsSignupDuplicate, v2SignupDuplicate] = await Promise.all([
    request(`${railsBase}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: duplicateSignupPayload,
    }),
    request(`${v2Base}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: duplicateSignupPayload,
    }),
  ]);
  assertEqual("signup.duplicate.status", railsSignupDuplicate.status, v2SignupDuplicate.status);
  assertEqual("signup.duplicate.body", normalize(railsSignupDuplicate.body), normalize(v2SignupDuplicate.body));

  const [railsSignupMissing, v2SignupMissing] = await Promise.all([
    request(`${railsBase}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
    request(`${v2Base}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  ]);
  assertEqual("signup.missing.status", railsSignupMissing.status, v2SignupMissing.status);
  assertEqual("signup.missing.body", normalize(railsSignupMissing.body), normalize(v2SignupMissing.body));

  const [railsUserUnauth, v2UserUnauth] = await Promise.all([
    request(`${railsBase}/api/users/${userId}`),
    request(`${v2Base}/api/users/${userId}`),
  ]);
  assertEqual("users.show.unauth.status", railsUserUnauth.status, v2UserUnauth.status);
  assertEqual("users.show.unauth.body", normalize(railsUserUnauth.body), normalize(v2UserUnauth.body));

  console.log("Parity checks passed for auth/users/courses/lecture-content/sql-solutions");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
