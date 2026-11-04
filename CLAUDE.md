# Client Portal

Next.js (App Router) + Postgres (Prisma) + TanStack Query + Better Auth. See README.md for setup.

## Data fetching pattern (use this everywhere)

All app data flows through the same three layers. Don't query Prisma from pages
or components, and don't fetch data in server components. There is no separate DAL —
route handlers are the only place that touch the DB.

```
client component ──useX() hook──▶ /api/x route handler ──▶ Prisma
   (useQuery)        (axios)        (auth + validation + query)
```

1. **Route handler** — `src/app/api/<resource>/route.ts`
   - First line inside `try`: `await requireSession()` or `await requireAdmin()` from
     `src/lib/session.ts`. These validate the session against the DB and throw
     `UnauthorizedError` (401) / `ForbiddenError` (403).
   - Validate input and throw `ValidationError` (400) for bad input.
   - Take user identity from the session, never from the request body.
   - Wrap in `try { ... } catch (error) { return apiError(error); }` (`src/lib/apiResponse.ts`
     maps those errors, plus Better Auth `APIError`s, to status codes).
   - Never return secrets (e.g. session `token`) — use `select`.
   - Add the path to `ApiRoutes` in `src/lib/apiRoutes.ts`.
   - If two routes need the same query, extract it to `src/lib/` then — not before.

2. **Hook** — `src/hooks/use<Resource>.ts`
   - `useQuery` / `useMutation` calling `axios` directly:
     `const { data } = await axios.get<Project[]>(ApiRoutes.projects); return data;`
   - Mutations invalidate the related query keys in `onSuccess`.

3. **Page / component** — `"use client"`, uses the hook, handles `isPending` / `error` / empty states.

Auth: `src/proxy.ts` runs on pages only (not `/api`) and just checks a session cookie
exists, redirecting to `/login` if not. Real validation is `requireSession()` in each
route handler.

Exceptions: `api/auth/[...all]` (Better Auth), `api/admin/bootstrap` (public, first-user only),
and the auth pages (`login`, `change-password`) don't follow this pattern.

Client requests: never call `fetch()` or `axios` from components. Requests to our `/api` routes go
through a hook (`useQuery`/`useMutation` + `axios`). The only exception is Better Auth's own calls
(sign in, sign out, change password), which use `authClient` from `src/lib/auth-client.ts`.

## Code style

- Never `await` inside an object literal — assign to a const first:
  `const requestHeaders = await headers();` then `getSession({ headers: requestHeaders })`.
- Role-based UI isn't set up yet — don't add role checks to the UI.
- Interfaces live in `src/interfaces/` in files named `<name>-interface.ts`; type aliases live in
  `src/types/` in files named `<name>-type.ts`. Never declare them inline in components, hooks
  or routes. Import them with `import type`.
