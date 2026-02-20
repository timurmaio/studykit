FROM node:22-alpine

WORKDIR /app

# Копируем всё и ставим зависимости
COPY . .

WORKDIR /app/apps/frontend

RUN corepack enable pnpm && pnpm install

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
