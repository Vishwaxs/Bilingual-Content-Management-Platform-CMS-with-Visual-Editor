# Autonomous Run Summary

## Latest run — 2026-08-08

### Change made
Hardened image/URL fields against unsafe protocols (`javascript:`, `data:`, etc.).

`documentAdminSchema.file_url` already routed through `sanitizeUrl` (http/https
allowlist), but the three admin image-URL fields relied only on `z.string().url()`.
Zod's `.url()` defers to the URL constructor, which accepts `javascript:` and
`data:` URLs — so a malicious value could be persisted and later rendered into
`<img src>` markup. These fields are now normalised through the same http/https
allowlist:

- `newsAdminSchema.featured_image`
- `leaderAdminSchema.photo_url`
- `eventAdminSchema.cover_image`

A shared `optionalImageUrl` schema (in `src/lib/security/validate.ts`) rejects
non-http(s) values with a clear message, allows blank/omitted values, and stores
the normalised URL.

### Files changed
- `src/lib/security/validate.ts` — added `optionalImageUrl` helper; applied to the 3 image fields.
- `src/test/cms-hardening.test.ts` — added 2 tests (rejects unsafe protocols; accepts valid http(s) / blank).

### Commands run
- `npm install --legacy-peer-deps` — OK (see note below).
- `npm run build` — ✅ builds clean, no TS errors.
- `npx tsc -p tsconfig.app.json --noEmit` — ✅ no errors in changed files.
- `npm test` — new tests pass (6/7). One **pre-existing, unrelated** failure remains (see next step).

### What is now ready
Admin image URLs are validated with the same protocol allowlist as document URLs,
closing a stored-XSS-adjacent inconsistency. Buildable and covered by tests.

### Next smallest step
1. **Fix the pre-existing failing test** `cms hardening guards > enforces role-section permissions`:
   it asserts `canAccessSection('admin', 'settings') === true`, but `permissions.ts`
   defines `settings` as `superadmin`-only. Decide the intended RBAC (code intent is
   superadmin-only per its comments) and align test or matrix. This failure predates
   this run — confirmed by running it on the clean tree.
2. **Dependency conflict**: root pins `vite@^8` while `@vitejs/plugin-react-swc@^3.11`
   peer-requires `vite@^4||^5||^6||^7`; install needs `--legacy-peer-deps`. Consider
   bumping the plugin or pinning vite to ^7.
