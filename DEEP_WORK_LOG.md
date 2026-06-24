# Deep Work Log

Autonomous deep-work runs. Newest entry first. One small, buildable change per run.

## 2026-06-24 — Fix stale role-permission test (suite was red)

**Problem found:** A fresh `npm test` failed. `cms-hardening.test.ts` asserted
`canAccessSection('admin', 'settings') === true`, but the permission model in
`src/lib/auth/permissions.ts` deliberately scopes `settings` (and `users`,
`system`, `content`, `history`, `visualEditor`) to `superadmin` only. The test
predated the `superadmin`/`admin` role split and was never updated.

**Change:** Updated the `enforces role-section permissions` test to match the
intended access matrix — admins manage content but not settings, settings is
superadmin-only — and added coverage for the `superadmin` and `null` (unauthenticated)
cases.

- Files changed: `src/test/cms-hardening.test.ts`
- Commands: `npm install --legacy-peer-deps`, `npm test` (5 passed), `npx eslint <file>` (clean)
- Result: Test suite is green again.

**Note for next run (not done — out of scope this run):** `npm install` fails
without `--legacy-peer-deps` because `vite@8` exceeds the peer range of
`@vitejs/plugin-react-swc@3.11.0` (`vite ^4||^5||^6||^7`). Worth resolving the
peer conflict (e.g. move to a vite-8-compatible react plugin) so CI installs
cleanly. The security primitives in `src/lib/security/sanitize.ts` also still
have no direct unit tests — a good candidate for a future run.
