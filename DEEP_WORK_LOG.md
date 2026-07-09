# Deep Work Log

Continuity notes for autonomous maintenance runs. Newest entry first.

## 2026-07-09 — Fix broken dependency install (vite 8 peer conflict)

**Problem:** A fresh `npm install` failed with `ERESOLVE`. `package.json` pinned
`vite@^8.0.8`, but two dev plugins declared peer ranges capped at vite 7:
- `@vitejs/plugin-react-swc@^3.11.0` → peer `vite ^4 || ^5 || ^6 || ^7`
- `vite-plugin-pwa@^1.2.0` → peer `vite … || ^7.0.0`

So the project could not be installed without `--force` / `--legacy-peer-deps`.

**Change:** Bumped both plugins to versions that add vite 8 to their peer range,
keeping the intended `vite@^8`:
- `@vitejs/plugin-react-swc` `^3.11.0` → `^4.3.1` (peer now includes `^8`)
- `vite-plugin-pwa` `^1.2.0` → `^1.3.0` (peer now includes `^8.0.0`)

Files changed: `package.json`, `package-lock.json`.

**Verification:**
- `npm install` (no flags) → exit 0, 854 packages, no ERESOLVE ✓
- `npm run build` → built in ~2.2s, PWA v1.3.0 service worker generated ✓
- `npm test` → 4 passed, 1 failed (pre-existing, unrelated — see below)
- Config (`vite.config.ts`, `vitest.config.ts`) uses `react()` / `VitePWA()`
  in the standard way; both bumps are drop-in for this usage.

**Next smallest step:** `src/test/cms-hardening.test.ts` has one pre-existing
failing assertion — `canAccessSection('admin', 'settings')` expects `true` but
the RBAC logic returns `false`. Decide whether the test or the access-control
map is wrong, then fix that one in a focused follow-up. Separately, `npm run
lint` reports 32 pre-existing errors (mostly `@typescript-eslint/no-explicit-any`)
that can be cleared file-by-file.
