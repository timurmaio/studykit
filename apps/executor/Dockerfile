FROM oven/bun:1-alpine

RUN apk add --no-cache sqlite curl

WORKDIR /app

COPY apps/executor/package.json ./package.json
RUN bun install

COPY apps/executor/src ./src

ENV EXECUTOR_HOST=0.0.0.0
ENV EXECUTOR_PORT=3200

CMD ["bun", "src/index.ts"]
