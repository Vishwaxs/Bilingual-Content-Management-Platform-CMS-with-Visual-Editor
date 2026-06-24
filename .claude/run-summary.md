# Triage Run Summary — 2026-06-24

Newest entry first.

---

## 2026-06-24

### What changed since yesterday

No new commits to any repo since the 2026-06-23 triage run. The owner has not
yet merged any of the pending PRs.

### Key CI finding — regression on unieasy PR #4

The 2026-06-23 triage session (which produced bilingual-cms PR #6) correctly
noted that unieasy PR #3 was 4/4 CI green. However, a second session that same
evening created **unieasy PR #4** — a duplicate test fix — and that PR is
**failing `frontend-ci`**.

Root cause: PR #4 only fixes `src/__tests__/useSyncUser.test.tsx` (the stale
`last_active_at` assertion). It does **not** remove the hardcoded Google Maps
Embed API key `AIzaSyBFw0…` from three page files. The `frontend-ci` job
includes a key-leak check (grep for `AIza`) plus ESLint, and both catch
pre-existing issues not addressed by PR #4.

PR #3, by contrast, also replaces the hardcoded key fallback with
`${import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY}` across
`AccommodationItemDetails.tsx`, `FoodRestaurantDetails.tsx`, and
`PlaceItemDetails.tsx` — which is what makes it pass the key-leak check.

### Current PR state across all repos

#### unieasy-web-platform

| PR | Title | CI | Status |
|----|-------|----|--------|
| #3 | Fix stale `last_active_at` assertion + remove hardcoded Maps key | ✅ 4/4 | **Ready to merge** |
| #4 | Fix stale `last_active_at` assertion only | ❌ frontend-ci fails | Close — duplicate, less complete |

#### bilingual-content-management-platform-cms-with-visual-editor

| PR | Title | CI | Status |
|----|-------|----|--------|
| #1 | fix(deps): vite 8 ↔ plugin-react-swc peer conflict | no CI | **Ready to merge** |
| #5 | test: 43 sanitize tests + fix stale RBAC assertion | no CI | **Merge after #1** |
| #2 | test: fix stale settings assertion | no CI | Close — superseded by #5 |
| #3 | chore: triage summary 2026-06-21 | n/a | Close — housekeeping |
| #4 | chore: triage summary 2026-06-22 | n/a | Close — housekeeping |
| #6 | chore: triage summary 2026-06-23 | n/a | Close — housekeeping |

#### vv-s-portfolio

| PR | Title | CI | Status |
|----|-------|----|--------|
| #10 | Portfolio audit rebuild (Next.js 15 + Supabase) | n/a | Draft — awaiting owner review |

#### campus-flow-43

Nothing active. Last commit 2026-02-07.

### Next action (owner)

1. **Merge unieasy PR #3** — 4/4 CI green, fixes test + removes leaked API key.
2. **Close unieasy PR #4** — duplicate, CI failing, less complete than #3.
3. **Merge bilingual-cms PR #1** — installability fix, no regressions.
4. **Rebase and merge bilingual-cms PR #5** — sanitize tests become mergeable once #1 lands.
5. **Close bilingual-cms PR #2, #3, #4, #6** — housekeeping only.
6. **Set `VITE_GOOGLE_MAPS_EMBED_KEY`** in Vercel/Netlify secrets for unieasy production so the Maps embed works after the hardcoded fallback is removed.
7. **Review portfolio PR #10** when ready — large rebuild, owner decision needed.

### Known pre-existing issues (not introduced by recent changes)

- **bilingual-cms**: 32 `@typescript-eslint/no-explicit-any` lint errors on main. No CI configured, so they don't block.
- **unieasy**: ESLint reports 9 errors (no-explicit-any, no-useless-escape, conditional `useState` in MerchantAuth.tsx:107). The conditional `useState` is a genuine hooks-order bug worth fixing in a dedicated run.
