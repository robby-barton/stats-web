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
eleventy/lib/constants.js          lib/utils.ts
eleventy.config.cjs                lib/dbFuncs.ts
src/_data/*.js                     components/*.ts
                                   src/client/*.ts
```

The CJS tree runs in Node during `yarn build`. The ESM tree is bundled by Vite
for the browser. They share the same database schema expectations but are
otherwise independent.

## Vanilla TS Island Pattern

Instead of a full SPA, individual interactive components ("islands") are
initialized into server-rendered HTML using vanilla TypeScript.

```
1. Eleventy renders:

   <div data-island="ranking" data-props-id="ranking-props">
     <!-- static fallback content -->
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

The theme toggle is implemented as vanilla JS in `base.njk` (not an island).

## Eleventy Data Pipeline

```
src/_data/availableRankings.js ──> utils.availableRankings()
src/_data/availableTeams.js    ──> utils.availableTeams()
src/_data/rankingPaths.js      ──> utils.getRankingPathParams()
src/_data/teamPaths.js         ──> utils.getTeamPathParams()
src/_data/site.js              ──> { title, url } constants
```

These data files make their results available as Eleventy global data. Template
data files (`*.11tydata.js`) in each page directory use the utils functions
to load page-specific data.

### Caching

`eleventy/lib/utils.js` caches DB results in module-level variables with a
300-second TTL. This avoids redundant queries across pages during a single
build but ensures fresh data on rebuilds.

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
| `/team/{teamId}/[#sport]`      | `src/team/` + pagination over `teamPaths` (union across sports; sport = cfb or cbb) |
| `/teams/`                      | `src/teams/index.njk`                            |
| `/game-count/`                 | `src/game-count/`                                |
| `/about/`                      | `src/about/`                                     |

Divisions are defined in `eleventy/lib/constants.js` and `lib/constants.ts`.

## Key Dependencies

| Package              | Purpose                          |
|----------------------|----------------------------------|
| `@11ty/eleventy`     | Static site generator            |
| `vite`               | Asset bundling for TS islands    |
| `postgres`           | Build-time PostgreSQL queries    |
| `vitest`             | Test runner                      |
