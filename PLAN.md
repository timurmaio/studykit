# Studykit Migration Plan

## Current State (as of today)

- Frontend is pointed to API v2 (`http://localhost:3100`).
- API v2 serves compatibility routes under `/api/...` and core learner flows work.
- SQL checking pipeline is running on v2 stack:
  - `api_v2` -> Redis queue -> `worker_v2` -> `executor_v2` (Ruby, check_function-aware).
- Directus is added to Docker (`http://localhost:8055`) and login works.
- Admin credentials moved to environment variables (no hardcoded secrets in seeds).

## Goal

Remove legacy Rails backend and legacy admin frontend, keep MVP fully functional with:

- API v2 + worker + executor
- Directus for content management
- Frontend consuming API v2

## Remaining Work

### 1) Directus as CMS (priority)

- Configure Directus collections/permissions for content editing:
  - `courses`
  - `lectures`
  - `lecture_contents`
  - `markdown_contents`
  - `video_contents`
  - `sql_problem_contents`
  - `sql_problems`
- Configure roles:
  - admin/editor can manage content
  - public has no write access
- Validate content edit roundtrip:
  - edit in Directus -> visible through API v2 -> visible in frontend.

### 2) Finalize API v2 for MVP

- Keep only functional parity needed for MVP; no strict 1:1 legacy parity required.
- Ensure stable behavior for these flows:
  - signup/login/profile
  - courses list/course page/content page
  - join/leave/statistics
  - sql_solutions submit/poll
- Add/keep smoke checks for above flows.

### 3) Decouple from legacy admin app

- Stop using `apps/admin` in day-to-day workflow.
- Option A: remove from docker-compose and keep code archived.
- Option B: delete `apps/admin` entirely once Directus flow is confirmed.

### 4) Remove legacy Rails backend

- Preconditions:
  - frontend smoke passes against API v2 only
  - SQL execution pipeline confirmed on v2 stack
  - content management is done through Directus
- Then:
  - remove `backend`, `sneakers`, and `rabbitmq` services from docker-compose
  - remove Rails-specific seed/migration operational dependency
  - optionally archive/delete `apps/backend`.

### 5) Media handling sanity check

- Ensure course/user avatars still resolve after Rails removal.
- Preferred options:
  - Directus-managed files, or
  - external URLs, or
  - dedicated static file server for historical uploads.

## Suggested Next Session Start

1. Open Directus and configure content collections + permissions.
2. Edit one course/lecture/content item in Directus and verify frontend reflects it through API v2.
3. Remove legacy admin service from compose.
4. Do final smoke and remove legacy Rails services.

## Quick Commands

```bash
# Start main v2 stack + Directus
docker-compose up -d db redis api_v2 worker_v2 executor_v2 directus frontend

# API v2 parity/smoke helper
docker-compose exec -T \
  -e RAILS_BASE_URL=http://backend:3000 \
  -e V2_BASE_URL=http://localhost:3100 \
  api_v2 bun scripts/parity-check.ts

# Frontend build check
pnpm build:frontend
```
