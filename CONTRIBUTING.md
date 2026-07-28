# Contributing — qyne-web

How to work in this repository. Read this and [`AGENTS.md`](AGENTS.md) before writing code.

Org-wide workflow & standards: https://github.com/qyne-tech/.github

## Getting started

```bash
npm install          # installs deps AND wires the git hooks (prepare script)
cp .env.example .env  # if present — fill in local values (never commit .env)
npm run dev          # Vite dev server
npm run lint         # eslint
npm run build        # tsc -b && vite build (type-checks + production build)
```

## Definition of done

- Lint and build (type-check) pass; CI is green.
- No secrets or PII in code, logs, or fixtures.
- **README is current** — updated in this PR, or explicitly confirmed unaffected.
- **No backend / Supabase reintroduced** — this stays a pure marketing site.
