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
- Use the shared styling primitives and design tokens in `src/`; never hardcode colors.
- SEO matters: keep per-page `<Seo>` (canonical/OG/Twitter) and the sitemap current when adding/removing routes.
