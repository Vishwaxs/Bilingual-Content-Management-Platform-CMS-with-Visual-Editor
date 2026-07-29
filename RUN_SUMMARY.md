# Run summary — 2026-07-29

## Change made this run
Added `.github/workflows/ci.yml` — the repository's **first CI pipeline**. No
prior open PR (#26–#37) introduces CI; every recent triage summary flags its
absence as the reason each run re-verifies the same things by hand.

Design: `build` (install + `npm run build`) is the **blocking** gate — the one
pipeline verified green on `main`. Lint, type-check and unit tests run as
**advisory** steps (`continue-on-error: true`) so their known, already-fixed
debt is visible in CI without blocking, and can be promoted to blocking once
the relevant fix-PRs merge.

## Verified locally (Node 22, `npm install --legacy-peer-deps`)
| Check | Result |
| --- | --- |
| `npm run build` | ✅ pass (vite build + PWA generateSW) |
| `npm run lint` | ❌ 32 errors — `no-explicit-any` (open PRs #26, #30) |
| `npx tsc -p tsconfig.app.json --noEmit` | ❌ errors in UsersManager / FocusAreasManager |
| `npm test` | ❌ 1 stale assertion `cms-hardening.test.ts:50` (open PRs #32, #35) |

The CI matches this reality: build blocks (green), the rest is advisory.

## Files changed
- `.github/workflows/ci.yml` (new)
- `RUN_SUMMARY.md` (this file)

## Repo state / blocker (needs owner)
`main` is still the initial commit; **PRs #30, #32, #33, #35, #37 are all open,
verified, and unmerged.** Because nothing merges, runs keep re-fixing the same
debt (see the duplicate chains noted in earlier summaries and in unieasy). The
single highest-leverage action is owner review + merge of that backlog — not
more PRs.

## Next smallest step
Once PRs #37 (vite pin), #30/#26 (lint/types) and #32/#35 (RBAC test) merge,
drop the three `continue-on-error: true` lines in `ci.yml` to make lint,
type-check and tests blocking gates. Optionally switch `npm install
--legacy-peer-deps` to `npm ci` after #37 lands.
