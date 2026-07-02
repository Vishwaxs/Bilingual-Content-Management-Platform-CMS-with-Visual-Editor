# Triage run summary — 2026-07-02

Verification-and-triage pass across all four tracked repos. No production
code changed. Purpose: confirm the last night run is sound and identify the
single next step.

## What was verified

**bilingual-cms PR #17** ("test: fix red RBAC test to match super-admin-only
settings boundary", created 2026-07-01) is the most recent night-run change
across all repos. Verified locally against its branch:

- `npx vitest run` → **5/5 passing** (main is currently 1 failed / 4 passed —
  `cms-hardening.test.ts` still asserts `canAccessSection('admin', 'settings')
  === true` on `main`, which contradicts `SECTION_ACCESS.settings =
  ['superadmin']` in `src/lib/auth/permissions.ts`)
- `npx eslint src/test/cms-hardening.test.ts` → clean
- `npm run build` → succeeds

The fix itself is correct. It is, however, functionally the same fix already
made independently in PRs #2, #5, #8, and #10 — none of which ever merged.
The duplication loop is intact: every automated run branches from `main`,
`main` still has the stale assertion, so it gets "discovered" and re-fixed
again. This is now the 6th PR carrying this identical fix.

**unieasy PR #3** (`test(useSyncUser): fix stale assertion to include
last_active_at`, created 2026-06-21) — re-checked CI: still **4/4 green**.
Now **11 days old** with no merge. Its diff also already strips the
hardcoded Google Maps key literal from `AccommodationItemDetails.tsx` and
`FoodRestaurantDetails.tsx` (though not the fallback UI). Confirmed against
current `master`: `MerchantAuth.tsx` still has the `useState` called after an
early `return null` — the real Rules-of-Hooks bug PR #6 fixes — so that fix
is still needed and unmerged too.

**unieasy PR #7** (created 2026-06-30, newest here) is also **4/4 green**
and is a more complete version of the key-leak fix (adds a `hasMapsEmbedKey`/
`getMapEmbedUrl` helper, a graceful fallback link when no key is configured,
`.env` documentation, and 16 new `reviewStats` tests). It does not include
the `useSyncUser` test fix that PR #3 has.

**campus-flow-43 PR #3** — unchanged since 2026-06-27, still open, still a
clean, low-risk DB-untrack change. No new night-run activity in this repo.

**vv-s-portfolio PR #10** — unchanged since 2026-06-19, still an open draft
full-stack rebuild awaiting an owner decision (too large to action here).

## State

- **Ready:** bilingual-cms PR #17 is verified correct and safe to merge on
  its own merits (independent of the duplicate-fix issue).
- **Broken:** nothing new. The only "break" is procedural — `main`/`master`
  on bilingual-cms and unieasy have not advanced in over a week, so every
  autonomous run keeps re-deriving fixes that already exist on unmerged
  branches.
- **Not actioned (repeated across at least 6 prior triage summaries):**
  unieasy PR #3 has been CI-green for 11 days and remains unmerged.

## Next smallest step

Merge **unieasy PR #3** (or, since it's more complete, PR #7 followed by a
one-line reapplication of PR #3's `useSyncUser` test fix). Merging either
one to `master` is what stops the loop: it removes the hardcoded Maps key,
fixes the last failing test, and unblocks PR #6 (which needs the key fix to
go green) and PR #4/#5 to be closed as duplicates. This is an owner decision
(merging is outside the scope of an automated verification pass) and has now
been flagged unchanged for over a week.

Second-priority, same shape of problem: merge one of bilingual-cms PRs
#2/#5/#8/#10/#17 (any one — they are equivalent) to stop that repo's
duplication loop too.

No commits were made to any repo's production code this run; this file is
the only change.
