# Client Portal

Next.js (App Router, TS) + Postgres (Prisma) + TanStack Query.

## Local dev (no docker)

```
npm install
cp .env.example .env
npm run prisma:migrate:dev
npm run dev
```

## Docker

```
docker compose up --build
```

First run only, apply schema (Postgres port is published to host, so run locally against it):

```
cp .env.example .env
npm install
npm run prisma:migrate:dev
```

Web on http://localhost:3000, Postgres on localhost:5544 (user/pass/db: `portal`).
