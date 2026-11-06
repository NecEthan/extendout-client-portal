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

## Document storage

Uploaded files go to an S3-compatible bucket; Postgres only stores metadata (`Document` table).
The browser uploads straight to the bucket with a short-lived presigned URL, so files never pass
through the Next.js server:

1. `POST /api/projects/:id/documents` — checks access and limits, creates a `PENDING` row, returns a
   presigned PUT URL locked to that key, content type and exact size.
2. Browser `PUT`s the file to that URL.
3. `POST /api/documents/:id/complete` — checks the object exists with the approved size, marks it `READY`.

Why presigned URLs instead of uploading through our backend:

- **Many users can upload at once.** The server only does quick checks and signs a link; the
  heavy file transfer happens between the browser and the bucket, so concurrent uploads don't tie
  up server memory or requests.
- **Less bandwidth.** Proxying would send every byte through our server twice (in, then out to the
  bucket). With presigned URLs the server never touches the file.
- **Faster.** One hop (browser → bucket) instead of two, and the bucket provider is built for
  large transfers.
- **Works on any host.** No dependence on the host's request size/time limits (e.g. Vercel caps
  request bodies at ~4.5 MB).
- **Still secure.** The bucket stays private and its keys never leave the server; each link only
  allows one key, one exact size and type, for 10 minutes, and is only issued after the access and
  limit checks.

Only `READY` documents are listed. Limits (`src/lib/uploadLimits.ts`): 100 MB per file, 100 uploads
per user per hour, 5 GB per project.

**Photos** (Photos tab, construction progress) use the same flow and table, with `type: "PHOTO"` in
step 1; the server only accepts JPEG, PNG, WebP and GIF for photos. They share the limits above with
documents. `GET /api/projects/:id/photos` lists them, each with a presigned GET URL (valid 1 hour) so
the browser can show them from the private bucket. In production the bucket's CORS rule doesn't need
`GET`: `<img>` tags load cross-origin images without CORS.

**Local dev:** `docker-compose.dev.yml` runs SeaweedFS (S3 API on `localhost:9000`) and creates the
private `portal-documents` bucket automatically. Dev-only credentials are in `docker/seaweedfs/s3.json`.

**Production (Backblaze B2):**

1. Create a **private** bucket.
2. Create an application key restricted to **that bucket only**; use it for `S3_ACCESS_KEY_ID` /
   `S3_SECRET_ACCESS_KEY`.
3. Set `S3_ENDPOINT` to the bucket's S3 endpoint (e.g. `https://s3.<region>.backblazeb2.com`),
   `S3_REGION` to its region (e.g. `us-west-004`), `S3_BUCKET` to its name. Leave
   `S3_PUBLIC_ENDPOINT` unset (it defaults to `S3_ENDPOINT`).
4. Add a CORS rule allowing `PUT` from the app's origin (browser uploads need it).
5. Under **Caps & Alerts**, set daily caps on storage, download bandwidth and transactions. Once a
   cap is hit B2 refuses requests instead of billing more — the backstop if the app limits are ever bypassed.
