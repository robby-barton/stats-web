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

### 1. [x] XSS via unsafe JSON serialization

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

  **Fixed** on `chore/design-security-cleanup`: `eleventy/lib/serialize.js` +
  regression tests; `json` filter rewired.

### 2. [x] CI never builds or type-checks

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
- **[x] Won't do (decided 2026-09-07):** no fixture-DB CI job. The full
  `yarn build` (Eleventy + DB) is verified manually after dependency updates
  and significant merges instead.

  **Fixed** on `chore/design-security-cleanup`: `yarn typecheck` script
  (`moduleResolution: "bundler"`, `css-modules.d.ts`); new `typecheck` and
  `build-assets` reusable workflows wired into `ci.yml`.

### 3. [x] Dead duplicate data layer in the client tree

- `lib/utils.ts` + `lib/dbFuncs.ts` are a stale, partial ESM mirror of the live
  CJS layer (`eleventy/lib/utils.js` + `db.js`); the only reference to either is
  `lib/utils.ts` importing `@lib/dbFuncs`. Both pull the Node `postgres` driver
  into the `@lib` browser tree — an accidental island import would break the
  browser build.
- **Fix:** delete both files; add an ESLint `no-restricted-imports` guard
  (`postgres`/`dotenv`/`eleventy/*`) for the client tree to enforce the
  CJS/ESM boundary.

  **Fixed** on `chore/design-security-cleanup`: both files deleted;
  `no-restricted-imports` guard added to `eslint.config.mjs` for the client
  tree.

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

- [x] Security headers absent — `public/_headers` is cache-control only. Add
      CSP (requires hashing/externalizing the three inline scripts in
      `src/_includes/layouts/base.njk`), `X-Content-Type-Options: nosniff`,
      `Referrer-Policy`, `frame-ancestors 'none'`.

      **Fixed** on `chore/hardening`: headers + strict script-src CSP added;
      menu/theme scripts externalized to `public/js/site.js`, theme-paint
      script hashed (`sha256-…` in `_headers`, regeneration documented there).
- [x] DB-controlled logo URLs assigned directly to `img.src`
      (`components/teamNameRenderer.ts:18-24`, `src/client/team.ts:22-27`) —
      third-party visitor-tracking vector. Allowlist hosts or enforce via
      CSP `img-src`.

      **Fixed** on `chore/hardening`: shared `lib/logoHosts.ts` https-host
      allowlist (enforced at both call sites and mirrored in CSP `img-src`);
      non-allowlisted URLs fall back to the error images.
- [ ] Rotate/verify local credentials: `.env` holds a Cloudflare token; a
      production-looking DB credential sits in ignored
      `.next/standalone/.env`. Bounded git-history scan found no committed
      secrets, but rotation status unverified. Delete stale `.next/`, `.swc/`,
      `.wrangler/` leftovers.

      Note: stale `.next/` artifacts deleted 2026-09-07; rotation still to
      verify.
- [x] Pin GitHub Actions to commit SHAs (`.github/workflows/lint.yml:10`,
      `test.yml:10` — currently floating `@v4` tags); enable Dependabot.

      **Fixed** on `chore/hardening`: all `actions/*` uses pinned to full
      commit SHAs; `.github/dependabot.yml` added (weekly github-actions +
      npm, minor/patch grouped).
- [x] Cache promises for one Eleventy build instead of a 5-minute TTL
      (`eleventy/lib/utils.js`) — TTL and the `eleventy.before` cache clear
      can disagree mid-build; in-flight promises aren't shared.

      **Fixed** on `chore/hardening`: caches now store promises for one build
      (concurrent calls share one fetch), cleared by `clearCaches()`; TTL
      logic removed; cache tests added.
- [x] Better build-failure diagnostics: validate `DATABASE_URL` explicitly,
      include sport/year context in data errors, make `manifest.js` report
      missing entries. (Failing the build is correct; the messages aren't.)

      **Fixed** on `chore/hardening`: `db.js` names both expected env vars,
      `utils.js` "Not found" errors include sport (and division/year context
      where available), `manifest.js` names the missing entry key and path.
- [x] Decide the fate of `src/500.njk` (built but mapped by nothing) — host
      error-page config or delete.

      **Decided** on `chore/hardening`: keep it — built to `500.html` for
      host error-page mapping; no code change.

## Minor cleanup

- [x] Delete `src/_data/availableTeams.js` — consumed by no template.

      **Fixed** on `chore/minor-cleanup`: data file deleted; the underlying
      `utils.availableTeams()` util stays (used internally by the ranking/team
      path loaders).
- [x] `src/client/team.ts` bypasses the `data-island`/`data-props-id` contract
      (reads `#team-data` directly) and duplicates logo selection/ESPN-URL
      logic from `teamNameRenderer.ts` — unify.

      **Fixed** on `chore/minor-cleanup`: team page mounts via
      `data-island`/`data-props-id` and uses `getIslandProps`; shared logo
      helper extracted to `lib/logo.ts`.
- [x] Constants drift: unused exports in `lib/constants.ts` (`REVALIDATE`,
      `DIVISIONS`, `CHART_MAX_Y`, `SITE_TITLE`) and `eleventy/lib/constants.js`
      (`DIVISIONS`); division lists hard-coded a third time in `404.njk`
      inline JS.

      **Fixed** on `chore/minor-cleanup`: unused exports removed;
      `public/js/404.js` (externalized by the hardening batch) now derives its
      sport list from the serialized `#available-rankings` JSON. The per-sport
      division lists stay hard-coded in 404.js — that JSON carries no division
      info; serializing a sport→divisions map into the page would be needed to
      remove them.
- [~] Test coverage: `lib/tableSort.ts`,
      `components/selector.ts`, and all components are untested (suite is 5
      tests over `eleventy/lib/utils.js`).

      **Partially fixed** on `chore/minor-cleanup`: `lib/tableSort.ts`, the
      selector URL builders, and the shared logo helper (`lib/logo.ts`) are
      covered. **Fixed** on `refactor/chart-math`: the pure chart math
      (coordinate scales, window/brush/zoom clamping, tick generation) was
      extracted from `createChart` into `lib/chartMath.ts` and is covered by
      unit tests in `lib/chartMath.test.mjs`; the canvas renderer in
      `lib/teamChart.ts` remains untested by design (DOM/canvas glue).
- [ ] `sourcemap: true` ships source maps to production (`vite.config.ts`) —
      disable or upload privately.
- [x] Doc drift: README still says React/`cfb`/`cbb` and references a
      nonexistent progress script; ARCHITECTURE.md omits `manifest.js`/
      `viteManifest.js`, presents the dead `lib` files as client modules, and
      overstates static fallback; CLAUDE.md lists a nonexistent `scripts/` dir.

      **Fixed** on `chore/minor-cleanup`.
- [ ] `src/ncaaf/index.njk` / `src/ncaam/index.njk` interpolate `sportNav`
      values into JS string literals and a meta-refresh attribute — inputs are
      currently hardcoded/integer, but the pattern is fragile.
- [x] Sitemap `lastmod` uses `new Date().toISOString()` — builds are
      non-reproducible.

      **Fixed** on `chore/minor-cleanup`: `lastmod` is now the HEAD commit
      timestamp (`git log -1 --format=%cI`); falls back to the epoch when git
      is unavailable.
- [x] Tailwind v4 automatic content detection scans every non-gitignored
      file — adding `docs/design-security-review.md` changed the CSS bundle
      (added unused `.fixed`/`.inline`/`.filter` utilities, new hash) because
      the prose contains those words. Scope sources explicitly with `@source`
      in `src/assets/css/global.css` (src/, components/, lib/, styles/) so
      build output only depends on actual source files.

      **Fixed** on `chore/minor-cleanup`: `@import 'tailwindcss' source(none)`
      plus explicit `@source` directives; the four doc-prose utilities are
      gone from the bundle and all source-derived classes are unchanged.

## Build verification (2026-09-06, PR branch vs master @ ed6adda)

Full `yarn build` against the dev database on both trees, then compared all
3,746 generated pages:

- **Props:** 3,742 `<script type="application/json">` blocks — 0 parse
  failures, 0 raw `<` sequences (escaping active), 0 semantic diffs vs master
  (`deepStrictEqual` on every parsed block).
- **HTML outside props blocks:** 0 diffs after normalizing the CSS asset hash
  (the hash changed only because of the Tailwind content-detection item above;
  JS bundles byte-identical).
- `yarn build:11ty` is not exercised in CI (see finding 2: fixture-DB job
  declined); verify with a manual full build after dependency updates.

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
