/**
 * OpenAPI 3.0 specification for StudyKit API.
 * Served at GET /openapi.json
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "StudyKit API",
    version: "0.1.0",
    description:
      "REST API for StudyKit — self-hosted learning platform. Auth via HTTP-only cookies (JWT).",
  },
  servers: [{ url: "/", description: "API root (routes under /api)" }],
  tags: [
    { name: "Health", description: "Health checks" },
    { name: "Users", description: "Authentication and user management" },
    { name: "Courses", description: "Course catalog and enrollment" },
    { name: "Lectures", description: "Lecture content" },
    { name: "SQL Solutions", description: "SQL exercise submissions" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } } },
      },
    },
    "/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness check",
        responses: { 200: { description: "Ready" } },
      },
    },
    "/api/users": {
      post: {
        tags: ["Users"],
        summary: "Register user",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["user"],
                properties: {
                  user: {
                    type: "object",
                    required: ["first_name", "last_name", "email", "password"],
                    properties: {
                      first_name: { type: "string" },
                      last_name: { type: "string" },
                      email: { type: "string", format: "email" },
                      password: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "User created" }, 400: { description: "Validation error" } },
      },
    },
    "/api/users/login": {
      post: {
        tags: ["Users"],
        summary: "Login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["user"],
                properties: {
                  user: {
                    type: "object",
                    required: ["email", "password"],
                    properties: { email: { type: "string" }, password: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Logged in (sets cookie)" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/users/logout": {
      post: {
        tags: ["Users"],
        summary: "Logout",
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Current user",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "User" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "User" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "List courses",
        parameters: [
          { name: "owner", in: "query", schema: { type: "integer" }, description: "Filter by owner user ID" },
          { name: "enrolled", in: "query", schema: { type: "integer" }, description: "Filter by enrolled user ID" },
        ],
        responses: { 200: { description: "Course list" } },
      },
      post: {
        tags: ["Courses"],
        summary: "Create course",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course"],
                properties: {
                  course: {
                    type: "object",
                    required: ["title"],
                    properties: { title: { type: "string" }, description: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Course created" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get course by ID",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Course" }, 404: { description: "Not found" } },
      },
    },
    "/api/courses/{id}/enrollment": {
      get: {
        tags: ["Courses"],
        summary: "Check enrollment",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "{ participating: boolean }" } },
      },
    },
    "/api/courses/{id}/enrollments": {
      post: {
        tags: ["Courses"],
        summary: "Enroll in course",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Enrolled" } },
      },
      delete: {
        tags: ["Courses"],
        summary: "Leave course",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Left" } },
      },
    },
    "/api/courses/{id}/progress": {
      get: {
        tags: ["Courses"],
        summary: "Get progress",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Progress stats" } },
      },
      post: {
        tags: ["Courses"],
        summary: "Record viewed content",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { lectureContentId: { type: "integer" } },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
    },
    "/api/lectures/{lectureId}/contents/{contentId}": {
      get: {
        tags: ["Lectures"],
        summary: "Get lecture content",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "lectureId", in: "path", required: true, schema: { type: "integer" } },
          { name: "contentId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Content (Markdown/SQL/Video)" }, 404: { description: "Not found" } },
      },
    },
    "/api/sql-solutions": {
      post: {
        tags: ["SQL Solutions"],
        summary: "Submit SQL solution",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sql_solution"],
                properties: {
                  sql_solution: {
                    type: "object",
                    required: ["sql_problem_id", "code"],
                    properties: {
                      sql_problem_id: { type: "integer" },
                      code: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Solution submitted" } },
      },
    },
    "/api/sql-solutions/{id}/stream": {
      get: {
        tags: ["SQL Solutions"],
        summary: "Stream solution result (SSE)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Server-Sent Events stream" } },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "studykit_token",
        description: "JWT in HTTP-only cookie",
      },
    },
  },
} as const;
