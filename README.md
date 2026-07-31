# ABHM UP — Bilingual CMS with Visual Editor

Official website and content-management platform for **Akhil Bharat Hindu Mahasabha (Uttar Pradesh)**.
A bilingual (English / हिन्दी) single-page application with an in-page **visual editor**, role-based admin
console, and a Supabase backend for content, media, submissions, and real-time sync.

> **Tech stack:** Vite · React 18 · TypeScript · Tailwind CSS · shadcn/ui (Radix) · TanStack Query ·
> React Router · TipTap · Supabase (Postgres + Auth + Storage + Edge Functions) · PWA (Workbox)

---

## Features

- **Bilingual UI** — every string is available in English and Hindi via a central dictionary
  (`src/lib/i18n.ts`) and a `LanguageContext`; the site defaults to Devanagari-friendly typography.
- **Visual editor** — superadmins can toggle edit mode and change page content in place through a
  floating toolbar and edit panel (`src/components/editor/`), backed by TipTap rich text.
- **Role-based access control (RBAC)** — four roles (`superadmin`, `admin`, `editor`, `viewer`) mapped
  to admin sections through a single access matrix in `src/lib/auth/permissions.ts`. Routes are guarded
  both client-side (`AdminGate` / `ProtectedRoute` in `src/App.tsx`) and by Postgres RLS policies.
- **Admin console** (`/admin`) — manage News, Events, Leadership, Documents, Focus Areas, Contacts,
  Memberships, Media, Users, Site Settings, Edit History, and System Health.
- **Public site** — Home, About, Organization, Leadership, News (+ detail), Events (+ detail, RSVP),
  Documents, Join/Membership, and Contact pages.
- **Secure public submissions** — membership and contact forms post to Supabase Edge Functions that
  apply CORS, per-IP rate limiting, honeypot checks, and input sanitization
  (`supabase/functions/`).
- **Progressive Web App** — installable, offline-capable shell with runtime caching for the Supabase
  REST/storage APIs and Google Fonts (see `vite.config.ts`).
- **Hardened hosting headers** — security headers and long-lived asset caching configured for Vercel
  (`vercel.json`).

## Project structure

```
.
├── index.html                 # App shell, SEO / Open Graph meta, fonts
├── src/
│   ├── App.tsx                # Routes + auth/section guards
│   ├── pages/                 # Public pages
│   │   └── admin/             # Admin console pages
│   ├── components/            # NavLink, admin/, editor/, layout/, public/, ui/ (shadcn)
│   ├── contexts/              # Language, EditMode, AdminAccess providers
│   ├── hooks/                 # Data hooks (useNews, useEvents, useUsers, …)
│   ├── lib/                   # auth (permissions), cms, security, i18n, api, utils
│   └── integrations/supabase/ # Generated client + database types
├── supabase/
│   ├── migrations/            # Postgres schema, RLS policies, seed data
│   ├── functions/             # Edge Functions: membership, upload, contact, _shared
│   └── config.toml
├── scripts/seed.ts            # Seed site settings / demo content (service-role)
├── vite.config.ts             # Vite + PWA config, "@" → src alias
├── vitest.config.ts           # Unit-test config
└── vercel.json                # Build + security headers for Vercel
```

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- A **Supabase** project (for full functionality: auth, database, storage, edge functions)

### 1. Install

```bash
npm install
```

> **Note:** the checked-in `package.json` targets `vite@^8`. If your npm version reports an
> `ERESOLVE` peer-dependency conflict for `@vitejs/plugin-react-swc` / `vite-plugin-pwa`, install with
> `npm install --legacy-peer-deps` (a dependency alignment is in progress).

### 2. Configure environment

Copy the example file and fill in your Supabase project values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase **anon / publishable** key (safe for the browser) |
| `VITE_SUPABASE_PROJECT_ID` | optional | Project ref, used by tooling |

> Only the anon key belongs in `VITE_`-prefixed variables — it is shipped to the browser and is
> protected by Row-Level Security. **Never** put the `service_role` key in a `VITE_` variable; it is
> used server-side only (Edge Functions / the seed script) and is set in the Supabase dashboard.

### 3. Run

```bash
npm run dev        # start the dev server on http://localhost:8080
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (port 8080) |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm test` | Run the Vitest unit test suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Backend (Supabase)

- **Schema & policies** live in `supabase/migrations/` (tables, indexes, RLS policies, and seed data).
  Apply them with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db push`.
- **Edge Functions** live in `supabase/functions/` and can be served locally with
  `supabase functions serve`:
  - `membership` — validated, rate-limited membership applications
  - `contact` — validated, rate-limited contact-form submissions
  - `upload` — server-side validated media/document uploads (allow-listed MIME types)
  - `_shared` — shared CORS, rate-limit, and sanitization helpers
- **Seeding** — `npx tsx scripts/seed.ts` populates site settings and demo content. It requires
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment (service-role key, **not** committed).

### Roles & access

Access is centralized in `src/lib/auth/permissions.ts`:

| Section | superadmin | admin | editor | viewer |
| --- | :---: | :---: | :---: | :---: |
| Dashboard, Leadership, Events, Documents, Focus Areas, Contacts, Memberships | ✓ | ✓ | | |
| News | ✓ | ✓ | ✓ | |
| Media | ✓ | ✓ | | |
| Users, Site Settings, Content, Edit History, System Health, Visual Editor | ✓ | | | |

## Deployment

The app is a static SPA and is configured for **Vercel** (`vercel.json`): build command
`npm run build`, output `dist/`, SPA rewrites to `index.html`, and hardened response headers. Any static
host works — pair it with a Supabase project for the backend.

## License

No license file is currently present. All rights reserved by the project owner unless a license is added.
