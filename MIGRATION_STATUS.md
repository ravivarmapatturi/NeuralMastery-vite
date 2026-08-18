# Visualization Component Migration Status

Tracks the port of all 14 existing `platform/src/components/viz/*` components into `platform-vite/src/viz/*`. Updated after a full real-browser verification pass (Playwright, headless Chromium) closed the Phase 1.5 verification gap flagged in the previous checkpoint.

## Browser verification results

Ran against the local Vite dev server, two content pages (`attention-demo.mdx` for RagPipelineSimulator, `component-porting-check.mdx` for the other 13), via `.verify-scripts/verify.cjs` (Playwright, headless Chromium — installed as a devDependency scoped to this verification task).

Methodology per component: **Render** = mounts without runtime errors, expected DOM shape present (node/element counts), no `NaN`/`undefined` in displayed values. **Interaction** = every meaningful control (slider, pill/button, click-on-canvas/SVG/node, dropdown, text input) was driven programmatically and a specific downstream value/text/attribute was asserted to actually change, not just that the click succeeded. **Animation** = for play/pause/step/reset components, play was confirmed to advance state, pause was confirmed to stop it (re-sampled, not single-shot), and reset was confirmed to return to the initial value. **Theme** = dark, light, and all 5 page skins (sepia/rosé/sage/lavender/sky), checked via a DOM contrast scan (any text-color === container-background pair) plus a full-page screenshot per state, visually spot-checked. **Responsive** = desktop (1280px) / tablet (768px) / mobile (375px), checked for `document.documentElement.scrollWidth` exceeding `clientWidth` and for runtime console errors at each width. **Console** = zero `console.error`/uncaught-exception across the entire pass (interaction + theme sweep + responsive sweep) for that component's page.

| Component | Render | Interaction | Animation | Theme | Responsive | Console | Status |
|---|---|---|---|---|---|---|---|
| RagPipelineSimulator | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| LinearRegressionStudio | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| RidgeRegressionStudio | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| LassoRegressionStudio | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| LogisticRegressionStudio | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| DecisionBoundaryPlayground | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| EmbeddingSpaceExplorer | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified (fixed — see below) |
| NeuralNetworkPlayground | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| AgentExecutionGraph | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| InferenceFlowVisualizer | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| AttentionStepThrough | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified |
| AlgorithmSelector | PASS | PASS | N/A (no animation) | PASS | PASS | PASS | ✅ Verified |
| LearningPathMap | PASS | PASS | N/A (no animation) | PASS | PASS | PASS | ✅ Verified — see "Special attention" below |
| GradientDescentExplorer | PASS | PASS | PASS | PASS | PASS | PASS | ✅ Verified (fixed — see below) |

**All 14 components: PASS on every dimension. Zero BLOCKED.** No environment limitation prevented testing any component or dimension — the Chrome extension being unavailable was worked around by installing Playwright (headless Chromium) rather than leaving anything unverified.

## Special attention: LearningPathMap and AlgorithmSelector

Both were verified to behave correctly on their own terms, per the instruction not to paper over the missing-content-routes issue with fake pages:

- **AlgorithmSelector**: walked the real decision tree (Predict a number → roughly linear → independent features), reached a real recommendation panel, and the generated link's `href` is `/docs/machine-learning/linear-regression` — syntactically correct, resolves to nothing right now because that doc hasn't been migrated yet. Back/Start Over both work.
- **LearningPathMap**: all 7 section nodes render in the React Flow graph, all 7 footer `<a>` links carry correctly-generated `/docs/category/*` hrefs, and clicking a node correctly triggers an SPA navigation attempt via `useNavigate()` to `/docs/category/foundations`. That route isn't wired up yet (no such content page exists), so it lands on the app's "Page not found" state — which is the expected, correct behavior given content migration hasn't happened, not a bug in the component.

No fake content pages were created to mask this, per instruction.

## Bugs found and fixed during this verification pass

Three real, user-facing bugs were found and fixed — all responsive-layout bugs, none of them logic/math bugs in the ported visualizations themselves:

1. **No mobile breakpoint in the doc shell at all.** `Sidebar` (fixed `width: 260`) and `TableOfContents` (fixed `width: 220`), both `flexShrink: 0`, never collapsed below any viewport width — at 375px they alone consumed more width than the viewport, squeezing the actual content column to near-zero and causing horizontal page overflow on *every* doc page, not just ones with visualizations. This was the root cause of most of the mobile-responsive failures found, including a downstream bug in GradientDescentExplorer (see #3). **Fix at the time**: added `.nm-sidebar`/`.nm-toc` classes and a `@media (max-width: 900px) { display: none }` rule in `theme.css` as an emergency stopgap for verification. **Superseded** by the proper responsive navigation system below — the rails are still hidden below 900px, but now via `MobileNavDrawer` rather than simply disappearing with no replacement.
2. **`EmbeddingSpaceExplorer`'s SVG had a hardcoded `width={420} height={420}`**, the only one of the 14 components not using a responsive container (every other canvas/SVG component uses `VisualizationCanvas`'s ResizeObserver or a `viewBox`-based scale). This alone caused ~86px of horizontal overflow on mobile after fixing #1. **Fix**: switched to `viewBox="0 0 420 420"` with `width: 100%; height: auto` and a `maxWidth: 420` wrapper — same internal coordinate math, now scales down responsively.
3. **`GradientDescentExplorer` threw a runtime SVG error at mobile widths**: `<ellipse> attribute rx: A negative value is not valid`, repeated 7 times (once per contour level). Root cause was downstream of bug #1 — with the sidebar/TOC bug in place, the component's `VisualizationCanvas` container measured a width narrower than its `24px` margin on each side, flipping the D3 x-scale's output range and producing negative radii. **Fix**: this resolved itself once bug #1 was fixed (container width no longer collapses), confirmed by rerunning the mobile pass — zero console errors afterward. No change needed in the component itself.

One suspected bug turned out to be a test-harness timing flake, not a real bug: an initial run flagged `NeuralNetworkPlayground`'s Pause as not stopping the training loop. Re-tested in isolation with 5 repeated trials, sampling epoch count every 100ms for 600ms after clicking Pause — stable (no further epoch changes) in all 5 trials. The original failure was a single too-tight timing check in the test script, not the component. No component change made.

## Responsive navigation architecture

Replaces the "hide below 900px" stopgap with a real tablet/mobile navigation system, built before Phase 2 per instruction (204+ pages all need to be navigable on a phone).

**Design**: the desktop docked `Sidebar` (260px) and `TableOfContents` (220px) are unchanged in code and behavior above 900px. Below 900px they're hidden (same CSS rule as before) and replaced by `MobileNavDrawer` — a hamburger button in `Navbar`, a backdrop, and a slide-in panel. Critically, the drawer does **not** duplicate the navigation structure: it renders the exact same `Sidebar` and `TableOfContents` components (now accepting a `variant="mobile"` prop that only changes chrome — full width, no border, no fixed pixel width — never the data or structure) against the exact same `getSidebar()` content-tree data every page already uses. A new page added to `src/content/docs/` needs zero navigation-specific configuration to show up correctly in both places, per instruction.

**Files**: `src/components/layout/MobileNavDrawer.tsx` (new), `Sidebar.tsx` (added `variant`/`onNavigate` props + active-section highlighting), `TableOfContents.tsx` (added `variant`/`onNavigate` props), `Navbar.tsx` (added hamburger button + `onMenuClick`/`menuButtonRef` props), `DocLayout.tsx` (wires drawer open/close state, closes automatically on route change), `theme.css` (`.nm-navbar-toggle` visibility rules).

**Accessibility**: `role="dialog"` + `aria-modal="true"` + `aria-label="Site navigation"` on the panel; focus moves into the panel on open and returns to the hamburger button on close; Escape closes; backdrop click closes; Tab is trapped inside the panel while open (manual first/last-focusable-element wrap, verified by tabbing 30 times and confirming focus never left the panel); background scroll is locked while open; the slide/fade transitions inherit the app's existing global `prefers-reduced-motion` rule (zeroed `transition-duration`) with no component-specific work needed.

### Verification results (Playwright, headless Chromium, `.verify-scripts/verify-mobilenav.cjs`)

**33/33 checks passed** across 375px, 768px, and 1280px:

| # | Check | Result |
|---|---|---|
| 1 | Mobile menu opens | PASS |
| 2 | Sidebar contents appear (section label + real page link from content tree) | PASS |
| 3 | Navigation works (URL changes on link click) | PASS |
| 4 | Current page is highlighted (accent color, both in the drawer and the desktop rail) | PASS |
| 5 | Menu closes correctly after navigating | PASS |
| 6 | Escape closes it (+ focus returns to the hamburger button) | PASS |
| 7 | Desktop layout unchanged (sidebar 260px, TOC 220px, hamburger hidden, active-page highlight, TOC scroll-spy link, prev/next present) | PASS |
| 8 | No console errors (mobile, tablet, desktop passes) | PASS |
| 9 | Representative visualization (Linear Regression Studio) still renders and its slider still updates state at 375px | PASS |
| 10 | No horizontal page overflow at 375px, 768px, or 1280px | PASS |
| — | Backdrop click closes menu | PASS |
| — | Tab key is trapped inside the panel (30 tab-presses, focus never left) | PASS |
| — | Docked sidebar/TOC confirmed hidden at 375px/768px, confirmed visible at 1280px | PASS |

Also reran the full 14-component verification pass (`verify.cjs`) after this change: **all 14 components still PASS on every dimension** (render/interaction/animation/theme/responsive/console) — no regressions from the navigation rework.

## Reusable primitives/patterns extracted (cumulative)

- `src/viz/lib/colorBlend.ts` — `hexToRgb`/`lerp`/`blendColor`, shared by `NeuralNetworkPlayground` and `AttentionStepThrough`.
- `src/viz/patterns/LossLandscapeHeatmap.tsx` — shared by `LinearRegressionStudio` and `LogisticRegressionStudio`.
- `src/viz/patterns/RegularizationPathChart.tsx` — shared by `RidgeRegressionStudio` and `LassoRegressionStudio`.

## Bundle-size observation (not optimized, per instruction)

Main JS entry is now **818.6 KB / 257.9 KB gzipped** (grew marginally from 815 KB after adding `MobileNavDrawer` — a few KB, not a new dependency). No route-based code-splitting yet. Left as-is — explicitly deferred to a later optimization phase.

## Architectural concerns before mass content migration

- **`LearningPathMap` and `AlgorithmSelector`** target `/docs/category/*` and `/docs/machine-learning/*` routes that don't exist in `platform-vite` yet — confirmed working as designed (see "Special attention" above); will resolve automatically once those pages are migrated in Phase 2.
- **No route-based code-splitting** — bundle-size note above; a Phase 3/4 concern.
- **`TableOfContents` mounts twice on mobile** (once inside the hidden desktop rail's would-be slot — actually not mounted since `.nm-toc` is CSS-hidden, not unmounted — and once inside the drawer), each with its own `IntersectionObserver`. Harmless at this page/heading count; worth a `React.memo`/shared-state pass if TOC scroll-spy ever needs to sync across both mounts simultaneously (it doesn't currently, since only one is visible/interactive at a time).

## Phase 1.5 completion

**Complete, including the responsive-navigation follow-up.** All 14 components have been opened in a real browser (headless Chromium via Playwright), every meaningful interaction exercised and asserted to actually change downstream state (not just clickability), animations verified to start/advance/pause/resume/reset cleanly with no runaway loops, all 7 theme states (dark, light, + 5 skins) checked for contrast/console issues, all 3 responsive breakpoints checked for overflow/console issues, 3 real bugs found and fixed. The mobile-nav stopgap from the first verification pass has been replaced with a proper hamburger/drawer system reusing the same content-tree data as desktop, verified with 33/33 automated checks plus a full regression rerun of all 14 components (zero regressions). `npm run build` remains clean (zero TypeScript errors) throughout.
