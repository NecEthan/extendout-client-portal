# TODO

- [ ] Validate the session on the frontend, not just its existence. `src/proxy.ts` only checks that a
  session cookie exists, not that the session is valid, so an expired/invalid cookie (e.g. after a DB
  reset) gets through and pages just show 401s from `/api/*`. Invalid sessions should redirect to
  `/login`, and users with `requirePasswordChange` should be redirected to `/change-password`.
- [ ] After creating the first admin in prod, remove the `api/admin/create-admin` endpoint. While the
  `User` table is empty it's public, so anyone could create the first admin. Further admins can be
  created by logged-in admins via `POST /api/admin/users` (`role: "ADMIN"`). When removing it, also:
  - delete `createAdmin` from `ApiRoutes.users` in `src/lib/apiRoutes.ts`
  - update the create-admin tests in `playwright-test/auth.spec.ts`
  - update the README auth section and the exceptions line in `CLAUDE.md`
- [ ] Clean up abandoned uploads. If someone starts an upload and never finishes it (tab closed, network
  drop, bucket outage), the `PENDING` `Document` row stays forever and keeps counting towards the
  5 GB project cap in `src/lib/uploadLimits.ts`, so failed uploads permanently eat a project's quota.
  - In `assertCanUpload`, only count `PENDING` rows towards the project cap if they're under ~1 hour
    old (upload URLs expire after 10 minutes, so older ones can never complete).
  - Add a cleanup job that deletes `PENDING` rows older than ~1 day, plus any object already in the
    bucket under their `storageKey`. Cron-triggered route behind a secret for now; move it into the
    worker once there is one. This also catches objects left behind when `deleteObject` fails in
    `/complete` on a size mismatch.
- [ ] Handle the storage bucket being down. Signing upload URLs is offline, so step 1 still succeeds,
  but then:
  - The browser `PUT` fails and the user sees axios's "Network Error". Show a clear message instead,
    e.g. "Couldn't reach file storage, please try again".
  - `/complete` (`src/app/api/documents/[id]/complete/route.ts`): a storage error that isn't
    `NotFound` is rethrown, and `errorResponse` turns it into a generic 500. Throw
    `ApiError(503, "File storage is temporarily unavailable, please try again shortly")` instead, and
    keep the row `PENDING` so a retry still works.
  - The S3 client in `src/lib/storage.ts` has no request timeout, so a hanging bucket hangs the route.
    Set a connection timeout (a few seconds) and a request timeout (~30s).
  - In `useUploadDocument`, retry the `PUT` and the `/complete` call a couple of times with backoff,
    reusing the same upload URL (valid for 10 minutes). Don't retry the whole mutation, because each
    attempt creates a new `PENDING` row.
  - Monitoring: subscribe to Backblaze status and alert on spikes in 503s from `/complete`.
