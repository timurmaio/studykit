FROM oven/bun:1.1.38

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN bun install

COPY apps/api ./apps/api
COPY packages/db ./packages/db

WORKDIR /app/apps/api

CMD ["bun", "src/index.ts"]
