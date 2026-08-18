# CI/CD

How platform-vite is built, tested, and deployed. Every command below has actually been run, either locally or on real GitHub Actions runners — nothing here is assumed.

## Live deployment

- **Repository**: https://github.com/ravivarmapatturi/NeuralMastery-vite (standalone, separate from the existing Docusaurus production repo `ravivarmapatturi/NeuralMastery`)
- **GitHub Pages URL**: https://ravivarmapatturi.github.io/NeuralMastery-vite/
- **Vite `base`** (`vite.config.ts`) and **React Router `basename`** (`src/App.tsx`) are both `/NeuralMastery-vite/` / `/NeuralMastery-vite`, matching the actual repo name the site is served under.

This is a **new, separate site** from the production Docusaurus deployment at `ravivarmapatturi.github.io/NeuralMastery/`. Nothing about the existing production site changes because this one exists or deploys.

## Required Node version

**Node 22** (`.nvmrc` pins `22`). CI uses `actions/setup-node@v4` with `node-version: '22'`. All local verification ran under Node v22.23.1.

> The sibling Docusaurus app (`platform/`, separate repo) pins Node 20 in its own workflow — independent, unrelated, not reconciled with this one.

## VERIFIED LOCALLY vs. VERIFIED ON GITHUB

Everything below has been verified one way or the other — nothing is assumed.

**VERIFIED LOCALLY:**
- `npm run typecheck`, `npm run build`, `npm run check:links`, `npm run pagefind`, `npm run test:smoke` — the exact commands `.github/workflows/ci.yml` runs, in the exact same order, against a clean `dist/`.
- The GitHub Pages deep-link fallback (`dist/404.html`), by serving `dist/` through a custom static server that reproduces GitHub Pages' actual behavior (real 404s, no SPA-fallback rewrite — see "Why not `vite preview`" below) and loading a deep URL directly in a headless browser, including a page **refresh** on that URL.
- That the link-checker and the "no console errors" test filter both actually fire on real failures, not just pass vacuously — each was deliberately fed a broken link / broken asset reference and confirmed to fail before being confirmed clean against the real content.
- The full 14-visualization-component regression suite and the 33-check responsive-navigation suite both still pass after these CI/CD changes (no regressions).

**VERIFIED ON GITHUB (real Actions runners, not local approximation):**
- `gh repo create` → push → real CI run on `ubuntu-latest`, all stages green (run `32183608217`, ~4m19s).
- GitHub Pages configured (`Settings → Pages → Source: GitHub Actions`, confirmed via the Pages API).
- The real `deploy.yml` run and the live URL — see the deployment report for this phase for the specific run ID and live-site verification results.

## Local commands

```bash
npm ci                 # deterministic install (what CI uses, not `npm install`)
npm run typecheck      # tsc -b, noEmit -- fails on any TS error
npm run build           # typecheck + vite build + dist/404.html (GH Pages deep-link fallback)
npm run check:links     # internal MDX prose links vs. the real content-tree route set
npm run pagefind        # prerenders every /docs/* route, builds the search index into dist/pagefind
npm run serve:dist      # serves dist/ exactly the way GitHub Pages would (see below)
npm run test:smoke      # playwright test -- the CI smoke suite (tests/smoke.spec.ts)
```

Full local pipeline, exactly matching CI's stage order:

```bash
rm -rf dist test-results playwright-report .pagefind-prerender
npm run typecheck
npm run build
test -f dist/index.html && test -f dist/404.html && test -d dist/assets
npm run check:links
npm run pagefind
test -f dist/pagefind/pagefind.js
npx playwright install --with-deps chromium   # first time only
npm run test:smoke
```

### Why not `vite preview`?

`vite preview` (and the Vite dev server) silently rewrite any unmatched path to `index.html` as a development convenience. **GitHub Pages does not do this.** It serves whatever file is at `404.html` (if present) with a real HTTP 404 status for any path that isn't a literal file on disk. Testing against `vite preview` would never have caught that a direct/refreshed load of `/docs/machine-learning/...` needs `dist/404.html` to exist at all. `scripts/static-server.cjs` is a small dependency-free static server that reproduces both of GitHub Pages' relevant behaviors: the `/NeuralMastery-vite/` base path, and 404-not-fallback. It's used for local `npm run serve:dist` and as Playwright's `webServer` in `playwright.config.ts`, so the smoke suite tests the same shape of server GitHub Pages actually is.

### The full 14-visualization regression suite

`npm run test:smoke` is a **fast critical-path suite** (10 tests, ~6-9s), run on every PR/push. It deliberately does not re-verify all 14 visualization components on every commit. For that, run the full regression pass built during Phase 1.5 (not part of CI, run manually before larger merges or when touching `src/viz/`):

```bash
npm run dev &                              # needs the Vite dev server, not dist/
node .verify-scripts/verify.cjs            # all 14 components: render/interaction/animation/theme/responsive/console
node .verify-scripts/verify-mobilenav.cjs  # 33 checks: mobile drawer + desktop nav regression
```

Both scripts print PASS/FAIL per check and write a JSON results file into `.verify-scripts/` (gitignored). See `MIGRATION_STATUS.md` for the last full run's results.

## What CI actually does (`.github/workflows/ci.yml`)

Triggers: every pull request, every push to `main`. Fails the workflow if any step fails.

1. **Checkout** (`actions/checkout@v4`)
2. **Set up Node 22** (`actions/setup-node@v4`, `cache: npm` for deterministic, cached dependency installs)
3. **`npm ci`** — not `npm install`, so CI always installs exactly what `package-lock.json` specifies
4. **Typecheck** (`npm run typecheck`) — fails the build on any TypeScript error, as a fast, separate stage before the slower full build
5. **Production build** (`npm run build`) — `tsc -b && vite build && node scripts/copy-404.mjs`
6. **Validate static output** — asserts `dist/index.html`, `dist/404.html`, and `dist/assets/` exist; fails with a clear `::error::` annotation naming exactly what's missing if not
7. **Internal link validation** (`npm run check:links`)
8. **Playwright browser cache** (`actions/cache@v4`, keyed on OS + `package-lock.json` hash) — installs Chromium + OS deps only on a cache miss
9. **Generate Pagefind index** (`npm run pagefind`)
10. **Validate Pagefind output** — asserts `dist/pagefind/pagefind.js` exists
11. **Playwright smoke tests** (`npm run test:smoke`)
12. **Upload Playwright HTML report** as a workflow artifact (`if: always()`, so it's available even on failure)

## Pagefind: why it needs a prerender step

platform-vite is a client-side-only SPA — `vite build` produces exactly one real HTML file (`dist/index.html`); every `/docs/*` route is resolved by React Router after that shell's JS runs. Running `pagefind --site dist` directly against that (verified locally) indexes **zero words** — there's no server-rendered content in the raw HTML for Pagefind's static crawler to find.

`scripts/prerender-for-pagefind.mjs` fixes this without changing what's deployed: it boots the real production build via `static-server.cjs`, visits every real `/docs/*` route (derived from the actual `src/content/docs/**/*.mdx` file tree, the same source of truth `src/lib/contentTree.ts` uses) in headless Chromium, and saves each route's fully-rendered HTML into a throwaway `.pagefind-prerender/` directory (gitignored). Pagefind then indexes *that* directory and writes the resulting search bundle into `dist/pagefind` via `--output-path`. `dist/` itself is unchanged — still the plain SPA shell + assets + `404.html` — only `dist/pagefind/*` is added.

**Wiring an actual search UI into the app is not part of this phase** — the index is generated and validated as a build artifact, ready for that later work.

## Internal link validation

`scripts/check-internal-links.mjs` scans every `src/content/docs/**/*.mdx` file's prose for `[text](/docs/...)`, `href="/docs/..."`, and `<Link to="/docs/...">` references, and checks each against the real route set derived from the content-tree file structure. Scoped deliberately:
- **Checked**: internal `/docs/...` links in MDX prose content.
- **Not checked**: external (`http`/`https`) links — no network calls in CI, by design; in-page anchors (`#heading-id`) — would need a rendered DOM, not just source text; links generated at runtime from component data (`AlgorithmSelector`'s decision-tree hrefs, `LearningPathMap`'s section hrefs) — those intentionally point at not-yet-migrated routes right now (see `MIGRATION_STATUS.md`'s "Special attention" section) and are a content-migration-phase concern, not a broken-prose-link one.

Verified locally to actually catch a broken link (deliberately introduced one, confirmed the script fails with the right exit code and message, then removed it) rather than passing vacuously.

## GitHub Pages deployment (`.github/workflows/deploy.yml`)

**Deliberately manual-only** (`workflow_dispatch`, no `push` trigger) — see the comment at the top of that file. This repo has its own independent `github-pages` Actions environment (separate from the Docusaurus repo's), so an automatic deploy here couldn't collide with production even if it wanted to; the manual gate exists instead so a broken/incomplete commit during content migration never becomes the live preview without someone deliberately choosing that moment. Revisit once content migration is complete.

Steps: checkout → Node 22 → `npm ci` → typecheck → `npm run build` → install Playwright Chromium → `npm run pagefind` → validate `dist/index.html` + `dist/404.html` + `dist/pagefind/pagefind.js` exist → `actions/upload-pages-artifact@v3` with `path: dist` → `actions/deploy-pages@v4`.

Deploys `dist/` (the Vite build output), never `platform/`'s `build/` (the Docusaurus output) — a separate app, separate repo, separate workflow, separate artifact, separate live site.

## React Router + GitHub Pages deep links

The real risk called out for this phase: a user directly opening or refreshing a URL like `/NeuralMastery-vite/docs/machine-learning/linear-regression` must not 404. Fixed and verified, both locally and against the real live deployment:

1. `vite.config.ts` sets `base: '/NeuralMastery-vite/'`, matching the actual repo name; confirmed every built asset reference in `dist/index.html` correctly includes that prefix.
2. `App.tsx` uses `<BrowserRouter basename="/NeuralMastery-vite">` — matches (1) exactly.
3. `scripts/copy-404.mjs` (run as part of `npm run build`) copies `dist/index.html` to `dist/404.html`. GitHub Pages serves `404.html` (HTTP 404 status) for any path that isn't a literal file — since it's a copy of the real SPA shell, and GitHub Pages doesn't rewrite the requested URL, BrowserRouter reads the correct `location.pathname` once the shell's JS boots and renders the right page.
4. Verified end-to-end, twice: once against the GitHub-Pages-shaped local static server, and once against the real live `github.io` URL — a direct load of a deep `/docs/...` URL returns HTTP 404 at the network level (expected — that's the fallback mechanism, not a failure) but renders the correct page content; a **refresh** on that same URL renders correctly again.

One consequence worth knowing, not a bug: because every direct load of a `/docs/...` URL genuinely gets a 404 HTTP status for the top-level document (that's inherent to the technique — GitHub Pages doesn't support server-side rewrites), browser devtools will show a "Failed to load resource: 404" network entry on every such load. `tests/helpers.ts`'s `collectConsoleErrors()` accounts for this precisely (it independently tracks which *responses* actually failed, and only discounts resource-load console noise when the only failure was the top-level document itself — a genuinely broken asset still fails the test; verified by deliberately injecting one).

## Build quality

- **Node version**: pinned via `.nvmrc` (22) and `actions/setup-node`'s `node-version` input — not a floating range.
- **Deterministic installs**: `npm ci` everywhere in CI, never `npm install`.
- **TypeScript errors fail the build**: `noEmit: true` in both `tsconfig.app.json`/`tsconfig.node.json` means `tsc -b` (run standalone as `typecheck`, and again inside `build`) is a pure typecheck gate; both scripts exit non-zero on any TS error.
- **Broken internal routes fail the build where practical**: `check:links` (see above) — scoped to what's actually checkable without a rendered DOM or network calls.
- **Clear CI logs**: each pipeline stage is a separate, named step; the static-output and Pagefind-output validation steps use `::error::` annotations naming exactly which file is missing.
- **Caching**: npm dependencies (`actions/setup-node`'s built-in `cache: npm`) and Playwright's downloaded browser binary (`actions/cache@v4`, keyed on `package-lock.json`'s hash) are both cached.
- **Not done, deliberately**: bundle-size optimization (main chunk is ~819KB/258KB gzipped, known, unchanged this phase) and `oxlint` is not wired into CI (it wasn't in the requested stage list; it still runs fine locally via `npm run lint` and reports only pre-existing warnings, zero errors).

## Repository and GitHub Pages settings

- **Repository**: https://github.com/ravivarmapatturi/NeuralMastery-vite — standalone, `main` as default branch, created and pushed with full commit history intact (no rewrite/squash).
- **Pages source**: `GitHub Actions` (configured via the Pages API — confirmed `build_type: "workflow"`).
- **Actions permissions**: `deploy.yml` requests `pages: write` and `id-token: write` explicitly in its own `permissions` block, which is sufficient regardless of the repo-wide default — confirmed by a successful real deploy run.
- **Branch protection**: not configured (optional, recommended once content migration is further along and merges become routine).
