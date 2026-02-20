FROM oven/bun:1.1.38

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN bun install

COPY apps/worker ./apps/worker
COPY packages/db ./packages/db

WORKDIR /app/apps/worker

CMD ["bun", "src/index.ts"]
