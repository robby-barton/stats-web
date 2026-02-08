# Site for my college football rankings.

This version is built with Eleventy and React islands for client-side interactivity.

Data is updated by a scheduler in [stats-go](https://github.com/robby-barton/stats-go).

## Local Dev

Install dependencies:

```sh
yarn
```

Build assets + Eleventy:

```sh
yarn build:eleventy
```

Run dev watcher (assets + Eleventy serve):

```sh
yarn dev:eleventy
```

## Environment

Provide a `.env` file with `DATABASE_URL` or `DEV_DATABASE_URL` for build-time data.

### Optional: build all years per division

By default, rankings are fetched per division per year. To fetch all years per division in one query (fewer DB round trips, more memory), set:

```sh
ELEVENTY_ALL_YEARS=1
```
