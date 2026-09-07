# Architecture

## System Context

```
┌──────────────────────┐         ┌────────────────────┐
│      stats-go        │  write  │    PostgreSQL       │
│  (Go backend)        │────────>│  (shared database)  │
│  scheduler + ranker  │         │                     │
└──────────────────────┘         └────────┬───────────┘
                                          │ read (build time)
                                          v
                                 ┌────────────────────┐
                                 │     stats-web       │
                                 │  (Eleventy + vanilla │
                                 │   TypeScript)       │
                                 │  static site        │
                                 └────────┬───────────┘
                                          │ deploy
                                          v
                                 ┌────────────────────┐
                                 │    _site/ output    │
                                 │  (static HTML/JS)   │
                                 └────────────────────┘
```

stats-web has **no runtime dependency** on stats-go or the database. All data
is baked into static HTML at build time.

## Build Pipeline

```
yarn build
  ├─ yarn build:assets    (Vite)
  │    src/client/*.ts ──> src/assets/build/*.js
  │
  └─ yarn build:11ty      (Eleventy)
       src/_data/*.js ──> query PostgreSQL
       src/**/*.njk   ──> render HTML with data
       src/assets/    ──> copy to _site/assets/
       public/        ──> copy to _site/
       ──────────────────> _site/ (final output)
```

Vite runs first so that built JS bundles are available for Eleventy to copy.

## Module System Boundary

The codebase has two separate module trees that must not cross-import:

```
CJS (Eleventy build-time)          ESM/TypeScript (Vite client-side)
─────────────────────────          ─────────────────────────────────
eleventy/lib/db.js                 lib/types.ts
eleventy/lib/utils.js              lib/constants.ts
eleventy/lib/constants.js          lib/logoHosts.ts
eleventy/lib/manifest.js           lib/logo.ts
eleventy.config.cjs                components/*.ts
src/_data/*.js                     src/client/*.ts
src/_data/viteManifest.js
```

The CJS tree runs in Node during `yarn build`. The ESM tree is bundled by Vite
for the browser. They share the same database schema expectations but are
otherwise independent.

`eleventy/lib/manifest.js` (and its `src/_data/viteManifest.js` wrapper) reads
the Vite build manifest so Eleventy templates can reference the hashed asset
filenames produced by `yarn build:assets`.

## Vanilla TS Island Pattern

Instead of a full SPA, individual interactive components ("islands") are
initialized into server-rendered HTML using vanilla TypeScript.

```
1. Eleventy renders:

   <div data-island="ranking" data-props-id="ranking-props">
     <!-- island root: content is rendered client-side by the island
          script; a <noscript> message covers JS-disabled visitors -->
   </div>
   <script id="ranking-props" type="application/json">
     {"rankings": [...], "teams": {...}}
   </script>

2. Vite bundles src/client/ranking.ts which:
   - Calls getIslandProps("ranking") from island-utils.ts
   - Finds the data-island DOM node and its JSON props
   - Calls initRanking(root, props) to build and append DOM elements
```

### Island Entry Points

Each entry point in `src/client/` corresponds to a Vite input in
`vite.config.ts`:

| Entry Point      | Island Name    | Page              |
|------------------|----------------|-------------------|
| `ranking.ts`     | `ranking`      | `/ranking/{d}/{y}/{w}/` |
| `team.ts`        | `team`         | `/team/{id}/`     |
| `teams.ts`       | `teams`        | `/teams/`         |
| `game-count.ts`  | `game-count`   | `/game-count/`    |

## Component Hierarchy

```
src/client/ranking.ts
  └─ components/ranking.ts
       ├─ components/selector.ts           (year/week/division picker)
       └─ components/rankingTable.ts       (sortable table via lib/tableSort.ts)
            └─ components/teamNameRenderer.ts  (logo + name)

src/client/team.ts
  ├─ components/teamNameRenderer.ts        (logo + name)
  └─ lib/teamChart.ts                      (rank history chart, per-sport tab)

src/client/teams.ts
  └─ components/teamSearch.ts              (search/filter + team list)
       └─ components/teamList.ts
            └─ components/teamCard.ts
                 └─ components/teamNameRenderer.ts

src/client/game-count.ts
  └─ components/games.ts
       └─ components/gameTable.ts

```

Static page behavior (404 smart redirects, header menu/theme toggle) lives in
plain JS files in `public/js/` (`404.js`, `site.js`), kept out of the Vite
bundle so it can be served as-is under the strict script-src CSP in
`public/_headers`. The only remaining inline script is the head-less
theme-paint block in `base.njk`, covered by its `sha256-` hash in the CSP.

## Eleventy Data Pipeline

```
src/_data/availableRankings.js ──> utils.availableRankings()
src/_data/rankingPaths.js      ──> utils.getRankingPathParams()
src/_data/teamPaths.js         ──> utils.getTeamPathParams()
src/_data/site.js              ──> { title, url } constants
```

These data files make their results available as Eleventy global data. Template
data files (`*.11tydata.js`) in each page directory use the utils functions
to load page-specific data.

### Caching

`eleventy/lib/utils.js` caches DB results as build-scoped promises (concurrent
calls share one in-flight fetch). The cache is cleared by `clearCaches()` on
Eleventy's `eleventy.before` event, so every build reads fresh data.

## Database Tables Read

| Table                | Columns Used                                                    |
|----------------------|-----------------------------------------------------------------|
| `team_week_results`  | `year`, `week`, `postseason`, `fbs`, `team_id`, `conf`, `final_rank`, `final_raw`, `wins`, `losses`, `ties`, `sos_rank`, `srs_rank` |
| `team_names`         | `team_id`, `name`, `logo`, `logo_dark`                          |
| `games`              | `home_id`, `away_id`, `start_time`, `game_id`                   |

All tables are written by stats-go. Schema changes originate there.

## URL Structure

| Path                           | Generated By             |
|--------------------------------|--------------------------|
| `/{sport}/ranking/{division}/{year}/{week}/` | `src/ranking/` + pagination over `rankingPaths` |
| `/team/{teamId}/[#sport]`      | `src/team/` + pagination over `teamPaths` (union across sports; sport = ncaaf or ncaam) |
| `/teams/`                      | `src/teams/index.njk`                            |
| `/game-count/`                 | `src/game-count/`                                |
| `/about/`                      | `src/about/`                                     |

Divisions are defined per sport in the `SPORTS` constant
(`eleventy/lib/constants.js` and `lib/constants.ts`).

## Key Dependencies

| Package              | Purpose                          |
|----------------------|----------------------------------|
| `@11ty/eleventy`     | Static site generator            |
| `vite`               | Asset bundling for TS islands    |
| `postgres`           | Build-time PostgreSQL queries    |
| `vitest`             | Test runner                      |
