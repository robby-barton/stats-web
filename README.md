# stats-web

Static site for college sports computer rankings. Built with Eleventy and React
islands for client-side interactivity. Data is updated by a scheduler in
[stats-go](https://github.com/robby-barton/stats-go).

## Sports

- **Football** — FBS and FCS divisions
- **Basketball** — D1

Team pages aggregate ranking history across all sports and provide tabs to switch
between them. Ranking links include a `#sport` hash (e.g.
`/team/123#basketball`) so the correct tab opens by default.

## Local Dev

Prereqs:
- Node `>=24.13.0 <25.0.0` (use `nvm use` to read `.nvmrc`)
- Yarn `1.22.19` (via Corepack)

Install dependencies:

```sh
yarn
```

Build assets + Eleventy:

```sh
yarn build
```

Run dev watcher (assets + Eleventy serve):

```sh
yarn dev
```

Lint and test:

```sh
yarn lint
yarn test
```

## Environment

Provide a `.env` file with `DATABASE_URL` or `DEV_DATABASE_URL` for build-time
data.

Note: `yarn build:11ty` uses a lightweight progress ticker (see
`scripts/eleventy-progress.mjs`).

### Optional: build all years per division

By default, rankings are fetched per division per year. To fetch all years per
division in one query (fewer DB round trips, more memory), set:

```sh
ELEVENTY_ALL_YEARS=1
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed data flow, component
hierarchy, and database schema information.
