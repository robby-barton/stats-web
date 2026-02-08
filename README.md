# Site for my college football rankings.

This version is built with Eleventy and React islands for client-side interactivity.

Data is updated by a scheduler in [stats-go](https://github.com/robby-barton/stats-go).

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

## Environment

Provide a `.env` file with `DATABASE_URL` or `DEV_DATABASE_URL` for build-time data.

Note: `yarn build:11ty` uses a lightweight progress ticker (see `scripts/eleventy-progress.mjs`).

### Optional: build all years per division

By default, rankings are fetched per division per year. To fetch all years per division in one query (fewer DB round trips, more memory), set:

```sh
ELEVENTY_ALL_YEARS=1
```
