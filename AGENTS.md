# AGENTS.md — qyne-web

The authoritative standards are the QYNE org docs — read them first and follow them exactly:
- Coding standards: https://github.com/qyne-tech/.github/blob/main/CODING_STANDARDS.md
- Contributing / workflow: https://github.com/qyne-tech/.github/blob/main/CONTRIBUTING.md
- Cross-agent rules: https://github.com/qyne-tech/.github/blob/main/AGENTS.md

Single source of truth for naming, functions, modules, errors, tests, security, git,
commit identity (your own org `@qyne.one` account), and PRs (a human maintainer merges — agents never merge).
Do not restate them here.

## Repo-specific rules (qyne-web — marketing site)
- Vite + React + Tailwind. **Marketing site: no Supabase, no auth. The one backend call is the public `GET /articles` catalogue via `apiUrl()`.** "Log in"/"Sign up" hand off to the app via `appUrl()` (see `src/lib/site.ts`).
- **Exception: the article CMS at `/cms` — dev and staging, never production.** It is built only in `npm run dev` or with `VITE_ENABLE_CMS=true`, which the deploy workflow allows on `develop` (staging) and forces off on `main`. In dev its calls go through the `/cms-api` proxy to a local service; on staging, to the staging API via `apiUrl()`. Send every CMS request through `cmsRequest` in `src/lib/cms-api.ts`, where the admin token (CMS-S1) will be attached.
- Article bodies are sanitised HTML from the service: render them with `RichText`, never as text and never with HTML from anywhere else.
- Tests: Vitest, colocated `*.spec.ts`, run with `npm test` (and in CI).
- Use the shared styling primitives and design tokens in `src/`; never hardcode colors.
- SEO matters: keep per-page `<Seo>` (canonical/OG/Twitter) and the sitemap current when adding/removing routes.
