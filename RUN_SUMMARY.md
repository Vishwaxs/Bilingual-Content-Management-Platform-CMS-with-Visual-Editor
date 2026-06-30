# Triage Run Summary — 2026-06-30

## Night run (2026-06-29) created 1 new PR

| Repo | PR | Title | CI | Verdict |
|------|-----|-------|----|--------|
| unieasy | #6 | fix(merchant-auth): hoist useState above conditional return | 3/4 (frontend-ci ❌) | **Genuine fix — keep, but blocked** |

## PR #6 detail

unieasy PR #6 fixes a real React Rules-of-Hooks crash: `touched` `useState` was declared **after** the early `return null` (`if (isSignedIn && role === "merchant")`). When a user's role transitions to `"merchant"` the hook count drops and React throws *"Rendered fewer hooks than expected"*, crashing the page. Fix: move `useState` above the conditional return. This is genuinely new work — not a duplicate.

**Why CI is red**: `frontend-ci` exits with `KEY LEAK DETECTED`. The hardcoded `AIzaSy…` Google Maps key is still present on `master`. The CI check flags it on every PR that doesn't include PR #3's key-removal commit. This is unrelated to the hooks fix itself.

**Dependency**: PR #6 cannot be merged until PR #3 lands on master (PR #3 removes the key and is 4/4 CI green). After PR #3 merges, PR #6 needs a rebase and a re-run to confirm green.

## State across all repos

### unieasy-web-platform
- **PR #3** — 4/4 CI green — 9 days waiting — fixes useSyncUser test + removes hardcoded `AIzaSy…` key — **MERGE THIS FIRST**
- **PR #4** — duplicate useSyncUser fix, frontend-ci failing — close
- **PR #5** — 3rd duplicate useSyncUser fix, frontend-ci failing — close
- **PR #6** — genuine React hooks fix (MerchantAuth crash), frontend-ci failing (key leak) — keep; needs rebase onto master after PR #3 merges

### bilingual-content-management-platform-cms-with-visual-editor
- **PR #1** — dep fix (vite 8 ↔ plugin-react-swc) — foundational — merge first
- **PR #5** — 43 sanitize.ts tests + RBAC fix — best test PR — merge after #1 (needs rebase)
- **PR #12** — 12 rate-limit tests — merge after #5
- **PR #14** — 28 validate.ts Zod tests — merge after #12
- **PRs #2–#4, #6–#13, #15** — superseded / housekeeping — close all
- **Duplication loop**: resolved since PR #12. No new autonomous work available until merges happen.

### campus-flow-43
- **PR #3** — untrack SQLite DB files — low risk, correct — merge
- **No tests exist**. The only remaining autonomous value here is a minimal server smoke test (`GET /api/health`). This can be done in the next run if no other progress has been made.

### vv-s-portfolio
- **PR #10** — large Next.js 15 + Supabase rebuild — draft, no CI failures — awaiting owner review

## Owner actions (priority order)

1. **Merge unieasy PR #3** — 4/4 CI green, removes hardcoded API key, 9 days waiting. Stops the CI-blocking loop for PRs #4/#5/#6.
2. **After PR #3 merges**: rebase unieasy PR #6 and re-run CI — should turn green (hooks fix is correct).
3. **Close unieasy PRs #4 and #5** — duplicates, CI red.
4. **Merge bilingual-cms PR #1** — makes the project installable without `--legacy-peer-deps`.
5. **Rebase + merge bilingual-cms PR #5** — 43 sanitize tests (after #1).
6. **Close bilingual-cms PRs #2–#4, #6–#13, #15** — superseded/housekeeping.
7. **Merge bilingual-cms PRs #12 and #14** (after #5) — rate-limit and validate.ts coverage.
8. **Set `VITE_GOOGLE_MAPS_EMBED_KEY`** in Vercel/Netlify env for unieasy production.
9. **Merge campus-flow-43 PR #3** — DB cleanup, safe.
10. **Review portfolio PR #10** — owner decision required (large rebuild).

## Next autonomous run

If no merges have occurred: add a campus-flow-43 server smoke test (`GET /api/health`). This is the only remaining autonomous increment across all four repos.

If PR #3 (unieasy) has merged: rebase and verify unieasy PR #6, then close PRs #4 and #5.
