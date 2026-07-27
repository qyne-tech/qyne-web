# qyne-web

The QYNE marketing and product website — a Vite + React single-page app that
explains the platform to athletes and academies, and hosts the public-facing
pages (pricing-free product tour, legal, support).

> See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and
> [SECURITY.md](SECURITY.md) for data-handling rules.

---

## Stack

| Concern | Choice |
|---|---|
| Build | Vite + TypeScript |
| UI | React 19, `react-router-dom` |
| Styling | Tailwind CSS v4 (CSS-first config — see `src/styles/theme.css`) |
| Motion | `framer-motion`, `lenis` (smooth scroll) |
| Icons | `lucide-react` |
| Fonts | Inter + JetBrains Mono (`@fontsource`) |
| Variants | `class-variance-authority`, `clsx`, `tailwind-merge` |

> **Node 20.19+ or 22.12+ is required** — Vite 7 depends on APIs (`styleText`)
> that older 20.x builds don't have. CI pins Node 22.

---

## Getting started

```bash
npm install     # installs deps AND wires the git hooks (prepare script)
npm run dev     # Vite dev server
npm run build   # tsc -b && vite build (type-checks, then bundles)
npm run preview # serve the production build locally
npm run lint    # eslint
```

### Environment

The auth flow needs the Supabase project (the **same** one the mobile app uses).
Copy `.env.example` → `.env` and fill in:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

Vite only exposes vars prefixed `VITE_` to the client. `.env` is gitignored;
`.env.example` is tracked. The rest of the marketing site is static and needs no
env.

---

## Project layout

```
src/
  components/
    layout/      Nav, footer, page shells, auth screen scaffolding
    sections/    composed page sections (Hero, HealthTrends, …)
    primitives/  Button, Card, Logo, Eyebrow, Tag
    animations/  ScrollReveal, Stagger, AnimatedCounter
    visuals/     product mockups (dashboard, phone, recovery ring)
  pages/         one component per route
  hooks/         shared React hooks
  lib/           site config/nav (`site.ts`), sports data, `cn()` helper
  styles/        theme.css — the Tailwind v4 design tokens
```

### Routes

| Area | Pages |
|---|---|
| Product | `Home`, `HowItWorks`, `Performance`, `Periodization`, `Assessments`, `ExerciseLibrary`, `Wearable`, `CricketIntelligence` |
| Audience | `ForAthletes`, `ForAcademies` |
| Company | `About`, `Support` |
| Legal | `Privacy`, `Terms`, `Security` |
| Auth (Supabase OTP) | `Login`, `Signup` |
| Fallback | `NotFound` |

### Styling

Tailwind v4 configures itself from CSS, so there is **no `tailwind.config.js`** —
the design tokens (colours, spacing, radii) live in
[`src/styles/theme.css`](src/styles/theme.css). Change tokens there rather than
hardcoding values in components, and keep them aligned with the shared Figma
design kit that also drives the mobile app's theme.

Shared styling helpers:
- `cn()` in `src/lib/utils.ts` merges class names (`clsx` + `tailwind-merge`).
- `buttonVariants` (`components/primitives/Button.tsx`) is the shared button
  styling, reused by link-buttons across the site.
- `EASE` (`components/animations/ScrollReveal.tsx`) is the shared motion curve —
  reveals stay under 600ms.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production bundle (the CI gate) |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint |
| `npm run prepare` | Wires `core.hooksPath` (runs automatically on install) |

CI runs lint (currently non-blocking) and build on every PR into
`develop`/`main`.

## Workflow

`develop` is staging, `main` is production — **both are PR-only**. Work on
`feat/*`, `fix/*` or `chore/*` branches and open a PR into `develop`. A
client-side `pre-push` hook blocks direct pushes; see
[CONTRIBUTING.md](CONTRIBUTING.md).

**Keep this README current.** If a change adds a route, dependency, environment
variable or build step, update this file **in the same PR**.
