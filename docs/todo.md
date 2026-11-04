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
