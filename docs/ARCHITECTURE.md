# StudyKit Architecture

Technical overview for developers and contributors.

---

## High-Level Diagram

```
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │─────▶│       API       │
│  (React, Vite)  │ HTTP │    (Hono/Bun)   │
└─────────────────┘      └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
  ┌──────────┐            ┌────────────┐             ┌──────────┐
  │  Worker  │            │  Executor  │             │ Directus │
  │ (BullMQ) │            │ (SQL eval) │             │   (CMS)  │
  └────┬─────┘            └─────┬──────┘             └────┬─────┘
       │                        │                         │
       ▼                        ▼                         ▼
  ┌──────────┐            ┌──────────┐             ┌──────────┐
  │  Redis   │            │ Executor │             │ Directus │
  │ (queue)  │            │  (Node)  │             │  (PHP)   │
  └──────────┘            └──────────┘             └──────────┘
       │                        │                         │
       └────────────────────────┼─────────────────────────┘
                                ▼
                         ┌────────────┐
                         │ PostgreSQL │
                         └────────────┘
```

---

## Services

### Frontend

- **Stack:** React 19, Vite 7, React Router, Tailwind CSS
- **Role:** Student-facing SPA. Auth via cookies, no localStorage tokens.
- **Build:** `pnpm build:frontend` → `apps/frontend/build/`
- **Dev:** `pnpm dev:frontend` → http://localhost:5173

### API

- **Stack:** Bun, Hono
- **Role:** REST API, auth (JWT in HTTP-only cookie), orchestration
- **Port:** 3100
- **Docs:** http://localhost:3100/docs (Swagger UI), http://localhost:3100/openapi.json

### Worker

- **Stack:** BullMQ, Redis
- **Role:** Async SQL validation jobs. API enqueues, worker runs executor.
- **Dependency:** Redis must be running

### Executor

- **Stack:** Node.js, isolated SQL runner
- **Role:** Runs student SQL in sandbox, compares to expected result
- **Called by:** Worker (not directly by API)

### Directus

- **Stack:** Directus (PHP)
- **Role:** CMS for flexible content. Can be used for course metadata, media.
- **Port:** 8055
- **Note:** Core flows work without Directus; it extends content authoring.

### Database

- **PostgreSQL:** Primary data store. Schema in `packages/db`.
- **Redis:** Job queues (BullMQ) and session/cache if used.

---

## Data Flow Examples

### Sign in

1. Frontend POSTs to `/api/users/login` with email/password
2. API validates, sets `studykit_token` cookie (JWT)
3. Frontend navigates to `/courses`; subsequent requests include cookie

### View course content

1. Frontend GETs `/api/courses/:id` (with cookie)
2. API returns course, lectures, content tree
3. For specific content: GET `/api/lectures/:lid/contents/:cid`
4. If SQL problem: frontend POSTs solution to `/api/sql-solutions`
5. API enqueues job; Worker runs Executor, result streamed via SSE

### Progress tracking

1. Frontend POSTs to `/api/courses/:id/progress` when viewing content
2. API records `viewedContentIds` per user
3. Analytics: GET `/api/courses/:id/analytics` (teacher only)

---

## Auth

- **Method:** JWT in HTTP-only cookie (`studykit_token`)
- **Middleware:** `authMiddleware` in `apps/api/src/middleware/auth.ts`
- **Roles:** `student`, `teacher`, `admin` — enforced via `authorize()` middleware
- **CORS:** Credentials allowed from configured origins

---

## Project Structure

```
studykit/
├── apps/
│   ├── api/           # Hono REST API
│   ├── frontend/      # React SPA
│   ├── worker/        # BullMQ processor
│   └── executor/      # SQL sandbox
├── packages/
│   └── db/            # Drizzle schema, shared types
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── VISION.md
└── docker-compose.yml
```

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/app.ts` | API entry, routes, CORS |
| `apps/api/src/routes/*.ts` | Route handlers |
| `apps/api/openapi.ts` | OpenAPI spec |
| `packages/db/schema` | DB tables, relations |
| `apps/frontend/src/routes.tsx` | React Router, loaders |
| `apps/frontend/src/types/Course.ts` | Frontend course types |

---

## Environment

See `.env.example`. Main variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis for BullMQ
- `JWT_SECRET` — Signing key for tokens
- `VITE_API_URL` — API base URL (frontend)
