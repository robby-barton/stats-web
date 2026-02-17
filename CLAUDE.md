# stats-web

Static site for college sports computer rankings. Built with Eleventy and vanilla
TypeScript islands for client-side interactivity. Data is written to PostgreSQL by
[stats-go](https://github.com/robby-barton/stats-go) and read at build time via
direct SQL queries.

## Repo Responsibilities

This repo owns **frontend rendering and UX only**. It defers to
[stats-go](https://github.com/robby-barton/stats-go) for:

- Database schema and all migrations
- API contracts (field names, types, response shapes)
- Docker Compose configuration
- Runtime behavior and business logic

All API and schema decisions are made in stats-go. Do not negotiate contracts
here. If the frontend surfaces a data problem, fix it in the backend. See
[stats-go/docs/multi-repo-workflow.md](https://github.com/robby-barton/stats-go/blob/master/docs/multi-repo-workflow.md)
for the full cross-repo process.

## Quick Reference

- **Runtime:** Node `>=24.13.0 <25.0.0` (use `nvm use`)
- **Package Manager:** Yarn `1.22.19` (via Corepack)
- **Install:** `yarn`
- **Build:** `yarn build`
- **Dev:** `yarn dev`
- **Test:** `yarn test`
- **Lint:** `yarn lint`

## Repository Layout

```
src/
  _data/              Eleventy global data files (DB queries at build time)
  _includes/          Nunjucks layout templates
  client/             Vanilla TS island entry points
    island-utils.ts   Shared island props utility
    ranking.ts        Ranking page island
    team.ts           Team page island
    teams.ts          Teams list island
    game-count.ts     Game count island
  ranking/            Ranking page (Eleventy template + data)
  team/               Team detail page
  teams/              Teams list page
  game-count/         Game count page
  about/              About page
  assets/
    css/              Stylesheets
    build/            Vite output (JS bundles, generated)
components/           Vanilla TS components (shared across islands)
lib/                  TypeScript types, constants, and utilities
eleventy/lib/         CJS modules for Eleventy build-time data
  db.js               SQL queries (postgres package)
  utils.js            Business logic and data transforms
  constants.js        DIVISIONS, CHART_MAX_Y
scripts/              Build helper scripts
styles/               Shared CSS modules
public/               Static assets (copied to output root)
_site/                Build output (generated)
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full data flow and component
hierarchy.

Key patterns:
- **Eleventy + vanilla TS islands** — Eleventy generates static HTML at build
  time; vanilla TypeScript initializes interactive components client-side
- **Build-time DB access** — `eleventy/lib/db.js` queries PostgreSQL directly
  during `yarn build`. No runtime API server.
- **Dual module systems** — `eleventy/lib/` is CJS (required by Eleventy);
  `lib/` and `components/` are ESM/TypeScript (bundled by Vite)
- **Island initialization** — Templates mark DOM nodes with `data-island` and
  `data-props-id` attributes; `island-utils.ts` reads serialized JSON props
  and each island script initializes its DOM into the target node
- **Vite builds assets independently** — `yarn build:assets` produces JS
  bundles in `src/assets/build/`; Eleventy copies them to `_site/`
- **Path aliases** — `@components`, `@lib`, `@styles` (configured in
  `vite.config.ts`)

## Conventions

- CSS modules (`*.module.css`) for component styles.
- Prettier + ESLint for formatting and linting.
- TypeScript for all `components/`, `lib/`, and `src/client/` files.
- CJS for `eleventy/lib/` (Eleventy does not support ESM config).
- Tests use Vitest. Test files live alongside source as `*.test.mjs`.
- Use path aliases (`@components`, `@lib`, `@styles`) in TypeScript/Vite code.
  Use relative paths in CJS Eleventy code.

## Data Flow

1. `stats-go` writes ranking and game data to PostgreSQL.
2. At build time, Eleventy data files (`src/_data/*.js`) call
   `eleventy/lib/utils.js`, which calls `eleventy/lib/db.js`.
3. SQL results are transformed into page data (ranking lists, team paths, etc.).
4. Eleventy renders Nunjucks templates with the data, embedding serialized JSON
   for vanilla TS islands.
5. Vite bundles island entry points into `src/assets/build/`.
6. At page load, each island reads its `data-props-id` JSON and initializes.

## Database Queries

All queries are in `eleventy/lib/db.js`. They read from tables written by
stats-go:

- **`team_week_results`** — ranking data per team per week
- **`team_names`** — team display info (name, logos)
- **`games`** — game schedule (used for game-count feature)

Schema changes are made in stats-go. If a column is added, renamed, or removed,
update the queries here only after the backend migration has landed.

## Environment

Provide a `.env` file:

- `DATABASE_URL` or `DEV_DATABASE_URL` — PostgreSQL connection string for
  build-time data access
- `ELEVENTY_ALL_YEARS=1` (optional) — fetch all years per division in one query
  instead of per-year queries

## Branching & PR Rules

- **Never commit directly to `master`.** Always branch.
- Branch naming: `<type>/<short-description>`.
- Do not open a stats-web PR until the corresponding stats-go backend change
  has been merged (or at minimum, the contract is frozen).
- PRs must pass lint and test CI checks before merging.
- Do not add frontend workarounds for backend bugs — fix them in stats-go.

## CI

GitHub Actions runs lint and test on every PR to `master`:

- **Lint:** `yarn lint` (ESLint + Prettier)
- **Test:** `yarn test` (Vitest)

## Anti-Patterns

- **Do not negotiate API contracts here.** All schema and data decisions are
  made in stats-go.
- **Do not add workarounds for backend data issues.** Fix the backend.
- **Do not duplicate stats-go rules here.** This repo defers to stats-go. Link
  to its docs, do not copy them.
- **Do not import from `eleventy/lib/` in client code** (or vice versa). The
  CJS and ESM module trees are separate.
