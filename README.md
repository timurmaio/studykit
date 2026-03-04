# StudyKit

**Self-hosted learning platform for universities.** Teachers create courses, students learn through interactive content and practice exercises.

> **Status:** Experimental / Proof of concept. This is not production-ready software. Use at your own discretion.

---

## What It Is

StudyKit is a learning management system designed for academic institutions. It addresses a common gap: lecture material presented once in class often isn't enough. Professors can publish their courses online so students can review at their own pace and practice with graded exercises before exams.

**Core concept:** Each teacher owns their course content. No one-size-fits-all curriculum — everyone teaches differently, and StudyKit supports that.

---

## Target Use Case

- **Primary:** Universities and colleges running self-hosted infrastructure
- **Deployment:** Docker Compose, on-premise or private cloud
- **Future:** Multi-tenant SaaS with per-institution subdomains (see [VISION.md](./docs/VISION.md))

---

## Features

| Area | Capabilities |
|------|--------------|
| **Content** | Multi-format lectures: Markdown, Video, interactive SQL problems |
| **Practice** | SQL execution engine with automatic validation against expected results |
| **Progress** | Per-student progress tracking across courses |
| **CMS** | Directus for flexible content authoring |

**Included:** Sample SQL course (based on real university material) to demonstrate the workflow.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite, React Router |
| API | Hono (Node.js) |
| Background jobs | BullMQ, Redis |
| SQL validation | Dedicated executor service (sandboxed) |
| CMS | Directus |
| Database | PostgreSQL |

---

## Local Deployment

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Step-by-step

**1. Clone and enter the project**

```bash
git clone https://github.com/timurmaio/studykit.git
cd studykit
```

**2. Configure environment**

```bash
cp .env.example .env
```

Defaults in `.env` work for local development. For production, change `JWT_SECRET`, `DIRECTUS_KEY`, `DIRECTUS_SECRET`, and `DIRECTUS_ADMIN_PASSWORD`.

**3. First run only: initialize the database**

```bash
docker compose up -d db redis
# wait until PostgreSQL is ready (5–10 seconds)
docker compose run db-init
```

**4. Start all services**

```bash
docker compose up db redis api worker executor frontend directus
```

**5. Open the app**

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend (student UI) |
| http://localhost:8055 | Directus (content management) |

---

### Optional: minimal stack

To run only API, worker, Redis and DB (no frontend, no Directus):

```bash
docker compose up api worker redis db
```

---

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │
│   (React)   │     │   (Hono)    │
└─────────────┘     └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌──────────┐      ┌────────────┐     ┌──────────┐
  │  Worker  │      │  Executor  │     │ Directus │
  │ (BullMQ) │      │ (SQL eval) │     │   (CMS)  │
  └──────────┘      └────────────┘     └──────────┘
```

| Service | Role |
|---------|------|
| **Frontend** | Student-facing UI |
| **API** | Auth, courses, lectures, solution submission |
| **Worker** | Asynchronous SQL validation via BullMQ |
| **Executor** | Sandboxed SQL execution and result comparison |
| **Directus** | Content management for courses and lectures |

---

## Project Structure

```
apps/
├── frontend   # React + Vite
├── api        # Hono REST API
├── worker     # BullMQ job processor
└── executor   # SQL validator

packages/
└── db         # Shared Drizzle schema
```

---

## License

See repository root for license information.
