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

## Design tokens

The colour block in `src/styles/theme.css` is **generated**, not hand-written. The
values come from the QYNE design kit (Urmi's Figma tokens), which lives in
`qyne-app` at `packages/tokens/src/palettes.ts` and is shared with the native app
and the product web app. Everything else in `theme.css` — type, spacing, radii,
shadows, motion — is owned by this repo and edited normally.

```bash
npm run tokens:sync    # pull the latest colours down from the kit
npm run tokens:check   # fail if theme.css has drifted from the kit
```

Both read `qyne-app` from `../qyne-app` by default; set `QYNE_APP_PATH` if your
checkout lives elsewhere. Don't edit the generated block by hand — the next sync
will overwrite it, and CI will flag the difference in the meantime.

To change a colour, change it in `qyne-app`'s palette and re-sync here. That's
what stops the three apps drifting apart, which is how they ended up with three
different palettes in the first place.

**CI:** the drift check needs to read a second private repo, which the default
`GITHUB_TOKEN` can't do. Until an `ORG_READ_TOKEN` repository secret is set (a
PAT or app token with read access to `qyne-app`), the step logs a warning and
passes. Set it to make the check real.

## Definition of done

- Lint and build (type-check) pass; CI is green.
- No secrets or PII in code, logs, or fixtures.
- **README is current** — updated in this PR, or explicitly confirmed unaffected.
- **No backend / Supabase reintroduced** — this stays a pure marketing site.
