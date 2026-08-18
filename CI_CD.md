# CI/CD

How platform-vite is built, tested, and (eventually) deployed. Every command below has been run locally against this exact repo state; anything that couldn't be checked without a GitHub remote is called out explicitly rather than assumed.

## Required Node version

**Node 22** (`.nvmrc` pins `22`). CI uses `actions/setup-node@v4` with `node-version: '22'`. All local verification in this document ran under Node v22.23.1 (`nvm use` picks this up automatically if you have nvm installed).

> The sibling Docusaurus app (`platform/`) pins Node 20 in its own workflow. That's an independent, unrelated app/repo and wasn't changed to match — no reconciliation between the two was requested.

## VERIFIED LOCALLY vs. REQUIRES GITHUB REMOTE

This distinction matters because there is currently no GitHub remote for this repository — see "Repository status" below.

**VERIFIED LOCALLY** (actually run on this machine, not assumed):
- `npm run typecheck`, `npm run build`, `npm run check:links`, `npm run pagefind`, `npm run test:smoke` — the exact commands `.github/workflows/ci.yml` runs, in the exact same order, against a clean `dist/`.
- The GitHub Pages deep-link fallback (`dist/404.html`), by serving `dist/` through a custom static server that reproduces GitHub Pages' actual behavior (real 404s, no SPA-fallback rewrite — see "Why not `vite preview`" below) and loading a deep URL directly in a headless browser, including a page **refresh** on that URL.
- The Vite `base` path (`/NeuralMastery/`) is already correctly applied to every built asset reference — checked in `dist/index.html`'s actual output.
- That the link-checker and the "no console errors" test filter both actually fire on real failures, not just pass vacuously — each was deliberately fed a broken link / broken asset reference and confirmed to fail before being confirmed clean against the real content.
- The full 14-visualization-component regression suite and the 33-check responsive-navigation suite both still pass after these CI/CD changes (no regressions).

**REQUIRES GITHUB REMOTE** (cannot be validated until one exists — see item 9 below for the full list):
- The workflows actually running on GitHub Actions' hosted runners (ubuntu-latest image, real network conditions, real `GITHUB_TOKEN` permissions).
- The GitHub Pages "Source: GitHub Actions" repository setting.
- `actions/deploy-pages@v4` actually publishing to a live Pages URL.
- Whether platform-vite ends up as its own standalone repository or as a subdirectory of the existing `NeuralMastery` monorepo (this changes `ci.yml`'s trigger paths and working directory — see the note in that file and item 9 below).

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

`vite preview` (and the Vite dev server) silently rewrite any unmatched path to `index.html` as a development convenience. **GitHub Pages does not do this.** It serves whatever file is at `404.html` (if present) with a real HTTP 404 status for any path that isn't a literal file on disk. Testing against `vite preview` would never have caught that a direct/refreshed load of `/docs/machine-learning/...` needs `dist/404.html` to exist at all. `scripts/static-server.cjs` is a small dependency-free static server that reproduces both of GitHub Pages' relevant behaviors: the `/NeuralMastery/` base path, and 404-not-fallback. It's used for local `npm run serve:dist` and as Playwright's `webServer` in `playwright.config.ts`, so the smoke suite tests the same shape of server GitHub Pages actually is.

### The full 14-visualization regression suite

`npm run test:smoke` is a **fast critical-path suite** (10 tests, ~6s), run on every PR/push. It deliberately does not re-verify all 14 visualization components on every commit. For that, run the full regression pass built during Phase 1.5 (not part of CI, run manually before larger merges or when touching `src/viz/`):

```bash
npm run dev &                              # needs the Vite dev server, not dist/
node .verify-scripts/verify.cjs            # all 14 components: render/interaction/animation/theme/responsive/console
node .verify-scripts/verify-mobilenav.cjs  # 33 checks: mobile drawer + desktop nav regression
```

Both scripts print PASS/FAIL per check and write a JSON results file into `.verify-scripts/` (gitignored). See `MIGRATION_STATUS.md` for the last full run's results.

## What CI actually does (`.github/workflows/ci.yml`)

Triggers: every pull request, every push to `main`. Fails the workflow (and blocks merge, once branch protection is configured — see item 8) if any step fails.

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

`scripts/prerender-for-pagefind.mjs` fixes this without changing what's deployed: it boots the real production build via `static-server.cjs`, visits every real `/docs/*` route (derived from the actual `src/content/docs/**/*.mdx` file tree, the same source of truth `src/lib/contentTree.ts` uses) in headless Chromium, and saves each route's fully-rendered HTML into a throwaway `.pagefind-prerender/` directory (gitignored). Pagefind then indexes *that* directory and writes the resulting search bundle into `dist/pagefind` via `--output-path`. `dist/` itself is unchanged — still the plain SPA shell + assets + `404.html` — only `dist/pagefind/*` is added. Verified locally: 3 pages, 754 words indexed from real content.

**Wiring an actual search UI into the app is not part of this phase** — the index is generated and validated as a build artifact, ready for that later work (originally scoped as a Phase 3 "platform capabilities" item).

## Internal link validation

`scripts/check-internal-links.mjs` scans every `src/content/docs/**/*.mdx` file's prose for `[text](/docs/...)`, `href="/docs/..."`, and `<Link to="/docs/...">` references, and checks each against the real route set derived from the content-tree file structure. Scoped deliberately:
- **Checked**: internal `/docs/...` links in MDX prose content.
- **Not checked**: external (`http`/`https`) links — no network calls in CI, by design; in-page anchors (`#heading-id`) — would need a rendered DOM, not just source text; links generated at runtime from component data (`AlgorithmSelector`'s decision-tree hrefs, `LearningPathMap`'s section hrefs) — those intentionally point at not-yet-migrated routes right now (see `MIGRATION_STATUS.md`'s "Special attention" section) and are a content-migration-phase concern, not a broken-prose-link one.

Verified locally to actually catch a broken link (deliberately introduced one, confirmed the script fails with the right exit code and message, then removed it) rather than passing vacuously.

## GitHub Pages deployment (`.github/workflows/deploy.yml`)

**Deliberately manual-only** (`workflow_dispatch`, no `push` trigger). This is a safety decision, not an oversight — see the comment at the top of that file. GitHub Pages via Actions has exactly one live deployment per repository (the `github-pages` environment); whichever workflow run deploys to it most recently is what's actually live, regardless of which workflow triggered it. The existing Docusaurus site (`platform/`) already deploys to that same environment on every push to `main` via its own `deploy.yml`. If this workflow also triggered on push to `main`, the moment a remote is connected and something is pushed, it would silently race with — and could overwrite — the current live production site. That's explicitly out of scope until an approved cutover. Until then, this workflow only runs when someone deliberately clicks "Run workflow" in the Actions tab.

Steps: checkout → Node 22 → `npm ci` → typecheck → `npm run build` → install Playwright Chromium → `npm run pagefind` → validate `dist/index.html` + `dist/404.html` + `dist/pagefind/pagefind.js` exist → `actions/upload-pages-artifact@v3` with `path: dist` → `actions/deploy-pages@v4`.

Deploys `dist/` (the Vite build output), never `platform/`'s `build/` (the Docusaurus output) — a separate app, separate workflow, separate artifact.

## React Router + GitHub Pages deep links

The real risk called out for this phase: a user directly opening or refreshing a URL like `/NeuralMastery/docs/machine-learning/linear-regression` must not 404. Fixed and verified:

1. `vite.config.ts` sets `base: '/NeuralMastery/'`, matching the repo name; confirmed every built asset reference in `dist/index.html` correctly includes that prefix.
2. `App.tsx` uses `<BrowserRouter basename="/NeuralMastery">` — matches (1) exactly.
3. `scripts/copy-404.mjs` (run as part of `npm run build`) copies `dist/index.html` to `dist/404.html`. GitHub Pages serves `404.html` (HTTP 404 status) for any path that isn't a literal file — since it's a copy of the real SPA shell, and GitHub Pages doesn't rewrite the requested URL, BrowserRouter reads the correct `location.pathname` once the shell's JS boots and renders the right page.
4. Verified end-to-end in a headless browser against the GitHub-Pages-shaped static server: a direct load of a deep `/docs/...` URL returns HTTP 404 at the network level (expected — that's the fallback mechanism, not a failure) but renders the correct page content; a **refresh** on that same URL renders correctly again. `tests/smoke.spec.ts`'s "directly opening a deep link works" test asserts exactly this, and is part of the CI smoke suite.

One consequence worth knowing, not a bug: because every direct load of a `/docs/...` URL genuinely gets a 404 HTTP status for the top-level document (that's inherent to the technique — GitHub Pages doesn't support server-side rewrites), browser devtools will show a "Failed to load resource: 404" network entry on every such load. `tests/helpers.ts`'s `collectConsoleErrors()` accounts for this precisely (it independently tracks which *responses* actually failed, and only discounts resource-load console noise when the only failure was the top-level document itself — a genuinely broken asset still fails the test; verified by deliberately injecting one).

## Build quality

- **Node version**: pinned via `.nvmrc` (22) and `actions/setup-node`'s `node-version` input — not a floating range.
- **Deterministic installs**: `npm ci` everywhere in CI, never `npm install`.
- **TypeScript errors fail the build**: `noEmit: true` in both `tsconfig.app.json`/`tsconfig.node.json` means `tsc -b` (run standalone as `typecheck`, and again inside `build`) is a pure typecheck gate; both scripts exit non-zero on any TS error.
- **Broken internal routes fail the build where practical**: `check:links` (see above) — scoped to what's actually checkable without a rendered DOM or network calls.
- **Clear CI logs**: each pipeline stage is a separate, named step; the static-output and Pagefind-output validation steps use `::error::` annotations naming exactly which file is missing.
- **Caching**: npm dependencies (`actions/setup-node`'s built-in `cache: npm`) and Playwright's downloaded browser binary (`actions/cache@v4`, keyed on `package-lock.json`'s hash) are both cached.
- **Not done, deliberately**: bundle-size optimization (main chunk is ~819KB/258KB gzipped, known, unchanged this phase — route/component code-splitting is separately tracked future work per `MIGRATION_STATUS.md`) and `oxlint` is not wired into CI (it wasn't in the requested stage list; it still runs fine locally via `npm run lint` and reports only pre-existing warnings, zero errors).

## Repository status and required GitHub settings

**Repository**: local git repo, 4 commits on `main`, no remote configured, nothing ever pushed. Per instruction, no remote was created and nothing was pushed while doing this work.

**Once a remote exists, before CI/deploy will function, these need manual setup (cannot be done or verified without the remote):**

1. **Push the code** to the new remote.
2. **Settings → Pages → Source**: set to "GitHub Actions" (not "Deploy from a branch") — required for `actions/deploy-pages@v4` to have anywhere to publish to.
3. **Settings → Actions → General → Workflow permissions**: needs at least read access; `deploy.yml` requests `pages: write` and `id-token: write` explicitly in its `permissions` block, which should be sufficient without changing the repo-wide default, but this can't be confirmed without a real run.
4. **Decide platform-vite's repository structure** — this repo becomes its own standalone GitHub repo, or gets merged into the existing `NeuralMastery` monorepo as a subdirectory alongside `platform/`. `ci.yml` currently assumes the former (no `working-directory`, no path filters). If it's the latter, `ci.yml` needs `defaults.run.working-directory: platform-vite` and `paths: ['platform-vite/**']` trigger filters added — flagged in a comment at the top of that file, not assumed either way here.
5. **Branch protection** (optional but recommended before Phase 2): require the `CI` workflow to pass before merging to `main`, once there's a `main` on the remote to protect.
6. Confirm the eventual live URL is genuinely `https://ravivarmapatturi.github.io/NeuralMastery/` (matching `vite.config.ts`'s `base` and `App.tsx`'s `basename`, and matching the existing Docusaurus site's `docusaurus.config`'s `url`/`baseUrl` — both already point at the same org/repo name, which is why no path config changes were needed here).

None of the above can be exercised until a remote exists; nothing here was assumed to already be correct without the local verification described earlier in this document actually backing it up.
