# API v2 (Bun + Hono)

## Start with Docker Compose

```bash
docker compose up api_v2 worker_v2 redis db
```

API will be available at `http://localhost:3100/api/v2`.

## Key endpoints

- `GET /health`
- `GET /ready`
- `POST /api/v2/auth/login`
- `POST /api/v2/auth/refresh`
- `POST /api/v2/auth/logout`
- `GET /api/v2/users/me`
- `GET /api/v2/courses`
- `GET /api/v2/courses/:id`
- `POST /api/v2/courses/:id/join`
- `DELETE /api/v2/courses/:id/leave`
- `GET /api/v2/courses/:id/participating`
- `GET /api/v2/courses/:id/participants/:userId/statistics`
- `POST /api/v2/sql-solutions`
- `GET /api/v2/sql-solutions/:id`
