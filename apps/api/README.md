# API (Bun + Hono)

## Start with Docker Compose

```bash
docker compose up api worker redis db
```

API will be available at `http://localhost:3100/api`.

## Key endpoints

- `GET /health`
- `GET /ready`

Users:
- `POST /api/users` (signup)
- `POST /api/users/login`
- `POST /api/users/logout`
- `GET /api/users/me`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/users/:id/courses`

Courses:
- `GET /api/courses` (`?owner=` `?enrolled=`)
- `POST /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses/:id/contents`
- `POST /api/courses/:id/lectures`
- `GET /api/courses/:id/enrollment`
- `POST /api/courses/:id/enrollments`
- `DELETE /api/courses/:id/enrollments`
- `GET /api/courses/:id/progress`
- `POST /api/courses/:id/progress`
- `GET /api/courses/:id/analytics`

Lectures:
- `GET /api/lectures/:lectureId/contents/:contentId`

SQL Solutions:
- `POST /api/sql-solutions`
- `GET /api/sql-solutions/:id/stream`

## Endpoint reference (REST)

All routes use kebab-case. Query params: `?owner=` for courses by owner, `?enrolled=` for courses user is enrolled in.
