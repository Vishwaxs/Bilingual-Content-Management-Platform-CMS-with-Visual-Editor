# Deep-Work Run Log

Autonomous, one-small-buildable-change-per-run improvements.

## 2026-07-01 — Fix red RBAC test (privilege-boundary correctness)

**Problem:** The committed test suite was red. `cms-hardening.test.ts` asserted
`canAccessSection('admin', 'settings') === true`, but the RBAC model
deliberately scopes `settings` to Super Admin only:
- `src/lib/auth/permissions.ts` → `SECTION_ACCESS.settings = ['superadmin']`
- `src/components/admin/AdminSidebar.tsx` → the Settings link lives inside the
  `isSuperAdmin ? [...]` group.

Making the production code satisfy the test would have been a privilege
escalation (admins reaching the restricted Settings section), so the **test**
was corrected to match the intended, UI-enforced security boundary.

**Change:**
- `src/test/cms-hardening.test.ts` — assert `superadmin` can access `settings`
  and `admin` cannot; added an explanatory comment.

**Commands:**
- `npm install --legacy-peer-deps` (baseline; note peer-dep conflict below)
- `npx vitest run` → 5 passed (was 1 failed / 4 passed)
- `npx eslint src/test/cms-hardening.test.ts` → clean

**Now ready:** Green test suite on the branch; the RBAC privilege boundary for
`settings` is now covered in both directions (allow superadmin, deny admin).

**Next smallest step (candidate):** Resolve the `npm install` peer-dependency
conflict — `package.json` pins `vite@^8` while `@vitejs/plugin-react-swc@^3.11`
only supports `vite@^4||^5||^6||^7`, so a clean `npm install` currently
requires `--legacy-peer-deps`. Align these (e.g. pin `vite@^7` or bump the
plugin) and verify `npm run build`.
