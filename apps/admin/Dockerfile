FROM node:18-alpine

WORKDIR /app

# Копируем всё и ставим зависимости
COPY . .

WORKDIR /app/apps/admin

RUN corepack enable pnpm && pnpm install

EXPOSE 3000

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
