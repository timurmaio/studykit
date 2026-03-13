# Contributing to StudyKit

Thank you for your interest in contributing. This guide helps you get set up and submit changes.

---

## Prerequisites

- **Node.js** 22+ (or as specified in `package.json` engines)
- **pnpm** 10+
- **Docker** and **Docker Compose** (for full stack)
- **Bun** (optional, for API/worker; Node works too)

---

## Setup

### 1. Clone

```bash
git clone https://github.com/timurmaio/studykit.git
cd studykit
```

### 2. Install

```bash
pnpm install
```

### 3. Environment

```bash
cp .env.example .env
# Edit .env if needed (JWT_SECRET, DB URL, etc.)
```

### 4. Database

```bash
docker compose up -d db redis
# Wait ~10 seconds for PostgreSQL
docker compose run db-init
```

### 5. Run

```bash
# Full stack
docker compose up db redis api worker executor frontend directus

# Or frontend only (for UI work, API must run separately)
pnpm dev:frontend
```

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:frontend` | Start frontend dev server (port 5173) |
| `pnpm build:frontend` | Build frontend for production |
| `pnpm test` | Run unit tests (Vitest + API) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm --filter @studykit/api dev` | Start API dev server |

### Frontend

- **Framework:** React 19, Vite 7
- **Styles:** Tailwind CSS
- **Forms:** React Aria Components
- **Tests:** Vitest, @testing-library/react, jsdom
- **E2E:** Playwright (see `apps/frontend/e2e/`)

### API

- **Framework:** Hono
- **DB:** Drizzle ORM, PostgreSQL
- **Validation:** Zod
- **Tests:** Bun test

### Code style

- TypeScript strict mode
- Prettier for formatting (run `pnpm fmt` in frontend)
- Prefer named exports for components

---

## Submitting Changes

1. **Branch:** Create a branch from `main` (e.g. `fix/signin-redirect`, `feat/new-component`)
2. **Commit:** Use clear messages (e.g. `feat(api): add enrollment endpoint`)
3. **Tests:** Ensure `pnpm test` passes
4. **Push:** Push branch and open a Pull Request

### Commit conventions

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — refactoring
- `test:` — tests
- `chore:` — tooling, dependencies

---

## API Documentation

- **Swagger UI:** http://localhost:3100/docs (when API is running)
- **OpenAPI spec:** http://localhost:3100/openapi.json
- **Spec source:** `apps/api/openapi.ts`

---

## Project Structure

```
apps/
├── frontend/     # React SPA
├── api/          # Hono REST API
├── worker/       # BullMQ jobs
└── executor/     # SQL validator

packages/
└── db/           # Shared schema

docs/
├── ARCHITECTURE.md
├── CONTRIBUTING.md
└── VISION.md
```

---

## Need Help?

- Open an issue for bugs or feature requests
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- See [VISION.md](./VISION.md) for roadmap
