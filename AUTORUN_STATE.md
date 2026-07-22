# Autonomous Run State

_Last updated: 2026-07-22_

## This run — Harden CMS permission guard + lock in access matrix with tests

**What changed**
- `src/lib/auth/permissions.ts` — `canAccessSection()` now **fails closed** for an
  unknown/dynamic section instead of throwing `undefined.includes(...)` mid-render
  (which would blank the admin UI). Unknown section → access denied.
- `src/test/permissions.test.ts` — new suite (12 tests) covering `isCmsRole`,
  `hasCmsAccess`, `isSuperAdminRole`, and the full `canAccessSection` matrix for
  every role/section, including the new fail-closed path.
- `src/test/cms-hardening.test.ts` — fixed a **pre-existing failing assertion**
  that expected `admin` to access `settings`; the access matrix documents
  `settings` as superadmin-only, so the corrected assertion denies `admin` and
  confirms `superadmin` access.

**Commands run**
- `npm install --legacy-peer-deps` — succeeded (see note below).
- `npx vitest run` — **17 passed (3 files)**.
- `npx eslint <changed files>` — clean (exit 0).
- `npx tsc -p tsconfig.app.json --noEmit` — no errors in changed files.

**Now ready:** the permission access matrix is a security boundary that is fully
test-covered and regression-protected; the vitest suite is fully green.

## Known issue (not addressed this run — larger scope)
`npm install` fails with default resolution: `package.json` pins `vite@^8.0.8`,
but `@vitejs/plugin-react-swc@^3.11.0` peer-requires vite `^4||^5||^6||^7`
(`vite-plugin-pwa` / `jsdom@^29` versions also look suspect). Installs currently
require `--legacy-peer-deps`.

**Next smallest step:** reconcile the build toolchain versions so a plain
`npm install` / CI succeeds — likely downgrade `vite` to `^7` (or bump the
react-swc plugin to a vite-8-compatible release) and verify `npm run build`.
Do this as its own run since it needs iterating over version combos.
