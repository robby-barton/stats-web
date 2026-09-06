# Design & Security Review — 2026-09-06

**Scope:** Full repo at commit `ed6adda`.
**Method:** Parallel architecture and security audits (independent review passes), spot-verified against source.
**Checklist status:** `[ ]` open · `[x]` fixed · `[~]` deferred by decision

## Verdict

The architecture is fundamentally sound (Eleventy build-time data → static HTML +
vanilla TS islands); no restructuring needed. SQL injection, DOM injection,
workflow injection, and committed secrets were all checked and found **clean**.
Four major findings were identified; items 1–3 are batched cleanup, item 4 needs
a product decision.

## Major findings

### 1. [ ] XSS via unsafe JSON serialization

- `eleventy.config.cjs:7` registers the `json` filter as bare `JSON.stringify`,
  embedded as `{{ data | json | safe }}` inside
  `<script type="application/json">` on six pages:
  `src/index.njk:5`, `src/ranking/index.njk:5`, `src/team/index.njk:6`,
  `src/teams/index.njk:5`, `src/game-count/index.njk:5`, `src/404.njk:10`.
- A `</script>` sequence in any DB string (team name, conference, logo URL)
  terminates the script element → persistent XSS baked into every affected page.
  Not visitor-exploitable directly (Postgres is written only by stats-go), but a
  single compromised upstream source defaces every page.
- **Fix:** escape `<` → `\u003c` (plus `>`, `&`, U+2028, U+2029) in the filter;
  extract to a testable CJS module; add a regression test with a
  `</script><script>` payload and a `JSON.parse` round-trip check.

### 2. [ ] CI never builds or type-checks

- `.github/workflows/ci.yml` → `lint.yml` + `test.yml` run lint and 5 unit
  tests only. Vite bundling, manifest lookups, and SQL-backed template
  assembly are unverified — a stats-go schema change could break the build and
  pass CI.
- There is no `typecheck` script; Vite transpiles TS without checking, and
  `tsc --noEmit` currently fails (CSS module imports untyped;
  `moduleResolution: "node"` cannot resolve modern package exports such as
  `@tailwindcss/vite`).
- **Fix:** add a `typecheck` script (moduleResolution `bundler` or scoped
  config; add `*.module.css` ambient declaration); run `typecheck` and
  `yarn build:assets` in CI.
- **[~] Deferred:** an Eleventy fixture-DB build job in CI (needs a schema
  fixture; coordinate with stats-go).

### 3. [ ] Dead duplicate data layer in the client tree

- `lib/utils.ts` + `lib/dbFuncs.ts` are a stale, partial ESM mirror of the live
  CJS layer (`eleventy/lib/utils.js` + `db.js`); the only reference to either is
  `lib/utils.ts` importing `@lib/dbFuncs`. Both pull the Node `postgres` driver
  into the `@lib` browser tree — an accidental island import would break the
  browser build.
- **Fix:** delete both files; add an ESLint `no-restricted-imports` guard
  (`postgres`/`dotenv`/`eleventy/*`) for the client tree to enforce the
  CJS/ESM boundary.

### 4. [~] Islands are not statically rendered (needs product decision)

- Ranking, teams, and game-count pages emit props JSON into empty island roots
  (`src/ranking/index.njk:5-9`, `src/teams/index.njk:5-9`,
  `src/game-count/index.njk:5-9`): all tables/lists exist only after JS runs,
  despite the build-time-DB architecture. Weakens SEO, accessibility, and
  progressive enhancement; contradicts ARCHITECTURE.md's "static fallback
  content" claim.
- **Options:** render baseline HTML in Nunjucks and let islands enhance it, or
  consciously document the site as JS-required. Deferred to a separate
  discussion.

## Hardening (nice to have)

- [ ] Security headers absent — `public/_headers` is cache-control only. Add
      CSP (requires hashing/externalizing the three inline scripts in
      `src/_includes/layouts/base.njk`), `X-Content-Type-Options: nosniff`,
      `Referrer-Policy`, `frame-ancestors 'none'`.
- [ ] DB-controlled logo URLs assigned directly to `img.src`
      (`components/teamNameRenderer.ts:18-24`, `src/client/team.ts:22-27`) —
      third-party visitor-tracking vector. Allowlist hosts or enforce via
      CSP `img-src`.
- [ ] Rotate/verify local credentials: `.env` holds a Cloudflare token; a
      production-looking DB credential sits in ignored
      `.next/standalone/.env`. Bounded git-history scan found no committed
      secrets, but rotation status unverified. Delete stale `.next/`, `.swc/`,
      `.wrangler/` leftovers.
- [ ] Pin GitHub Actions to commit SHAs (`.github/workflows/lint.yml:10`,
      `test.yml:10` — currently floating `@v4` tags); enable Dependabot.
- [ ] Cache promises for one Eleventy build instead of a 5-minute TTL
      (`eleventy/lib/utils.js`) — TTL and the `eleventy.before` cache clear
      can disagree mid-build; in-flight promises aren't shared.
- [ ] Better build-failure diagnostics: validate `DATABASE_URL` explicitly,
      include sport/year context in data errors, make `manifest.js` report
      missing entries. (Failing the build is correct; the messages aren't.)
- [ ] Decide the fate of `src/500.njk` (built but mapped by nothing) — host
      error-page config or delete.

## Minor cleanup

- [ ] Delete `src/_data/availableTeams.js` — consumed by no template.
- [ ] `src/client/team.ts` bypasses the `data-island`/`data-props-id` contract
      (reads `#team-data` directly) and duplicates logo selection/ESPN-URL
      logic from `teamNameRenderer.ts` — unify.
- [ ] Constants drift: unused exports in `lib/constants.ts` (`REVALIDATE`,
      `DIVISIONS`, `CHART_MAX_Y`, `SITE_TITLE`) and `eleventy/lib/constants.js`
      (`DIVISIONS`); division lists hard-coded a third time in `404.njk`
      inline JS.
- [ ] Test coverage: `lib/teamChart.ts` (633 lines), `lib/tableSort.ts`,
      `components/selector.ts`, and all components are untested (suite is 5
      tests over `eleventy/lib/utils.js`).
- [ ] `sourcemap: true` ships source maps to production (`vite.config.ts`) —
      disable or upload privately.
- [ ] Doc drift: README still says React/`cfb`/`cbb` and references a
      nonexistent progress script; ARCHITECTURE.md omits `manifest.js`/
      `viteManifest.js`, presents the dead `lib` files as client modules, and
      overstates static fallback; CLAUDE.md lists a nonexistent `scripts/` dir.
- [ ] `src/ncaaf/index.njk` / `src/ncaam/index.njk` interpolate `sportNav`
      values into JS string literals and a meta-refresh attribute — inputs are
      currently hardcoded/integer, but the pattern is fragile.
- [ ] Sitemap `lastmod` uses `new Date().toISOString()` — builds are
      non-reproducible.

## Verified clean (do not re-audit without cause)

- SQL injection: all 9 queries in `eleventy/lib/db.js` use postgres.js
  tagged-template parameterization; conditional fragment is nested `sql``` —
  no string concatenation or dynamic identifiers.
- Client DOM injection: no `eval`/`document.write`/`postMessage`/`fetch`;
  `innerHTML` used only to clear nodes; DB strings land in `textContent`,
  attributes, or autoescaped Nunjucks.
- CI workflow injection: no `pull_request_target`, no untrusted interpolation
  into `run:`, no secrets, `--frozen-lockfile` installs.
- Committed secrets: bounded history scan clean; no credential literals found
  (see hardening item on local ignored files).
