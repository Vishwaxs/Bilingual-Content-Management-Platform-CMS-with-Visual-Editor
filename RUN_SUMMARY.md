# Deep-work run summary

## 2026-06-26 — add rate-limit.ts test coverage

**Change:** Added `src/test/rate-limit.test.ts` — 12 deterministic unit tests
(fake timers) for the client-side rate limiter `src/lib/security/rate-limit.ts`,
which was security-critical but had **zero coverage**. This gap was flagged as
"the natural next increment" back in PR #2 and never picked up.

Coverage: first-attempt allowance, per-attempt `remaining` countdown, `resetIn`
decay within the window, blocking past the limit, default-`windowMs` vs explicit
`blockMs` block durations, the shrinking blocked countdown, recovery after a
block expires, window reset after `windowMs`, per-key isolation, `Math.ceil`
second-rounding in the message, and `clearRateLimit` (reset + unknown-key no-op).

**Why this and not another RBAC fix:** PRs #2, #5, #8, #10 all re-fix the same
stale `cms-hardening` assertion (`admin` → `settings`). Nothing has merged to
`main` since 2026-05-01, so each run re-discovers and re-fixes it — a duplication
loop. This run deliberately breaks the loop with genuinely new coverage and does
**not** touch that assertion.

**Verification**
- `npx vitest run src/test/rate-limit.test.ts` → **12 passed**
- `npx eslint src/test/rate-limit.test.ts` → clean
- Full suite: `16 passed | 1 failed` — the one failure is the pre-existing stale
  `cms-hardening.test.ts:50` RBAC assertion (out of scope; see PRs #2/#5/#8/#10).
- `npm install` still requires `--legacy-peer-deps` (vite 8 ↔
  `@vitejs/plugin-react-swc@3.11` peer range); PR #1 fixes that.

**Next smallest step:** `src/lib/security/validate.ts` (the Zod admin schemas) is
the remaining untested security module — a focused suite there is the next
increment. Beyond tests, the highest-leverage owner action remains merging the
backlog (PR #1 deps fix, then one RBAC-fix PR) so `main` advances and the
duplication loop ends.
