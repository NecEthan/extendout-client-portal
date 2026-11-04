# Client Portal

Next.js (App Router, TS) + Postgres (Prisma) + TanStack Query + better-auth.

## Auth model

No public signup. The first account is created via the create-admin endpoint, which
is open only while the `User` table is empty. After that it requires an ADMIN session,
and admins can use it to create as many further admins as they need:

```
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","name":"Owner","password":"<temp password>"}'
```

That account is ADMIN with `requirePasswordChange: false`. From then on, the
ADMIN creates CLIENT/ADMIN accounts via `POST /api/admin/users`
(`{ email, name, role, password }`, session-gated to `portalRole: "ADMIN"`) —
those accounts get `requirePasswordChange: true` and are forced to
`/change-password` on first login. Sessions use a 400-day sliding expiry
(`src/lib/auth.ts`); an ADMIN can revoke a user's sessions via
`DELETE /api/admin/users/:id/sessions`.

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
