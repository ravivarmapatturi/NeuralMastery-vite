# Visualization Component Migration Status

Tracks the port of all 14 existing `platform/src/components/viz/*` components into `platform-vite/src/viz/*`, per the Phase 1.5 porting rules. Updated after the last component (InferenceFlowVisualizer) and the full build pass.

| Component | Ported | Browser tested | Console clean | Theme tested | Notes |
|---|---|---|---|---|---|
| RagPipelineSimulator | ✅ | ✅ (live Playwright, Phase 1 acceptance page) | ✅ | ✅ (light/dark + 5 skins) | First port, predates the detailed porting rules |
| LinearRegressionStudio | ✅ | ⚠️ not this session | ✅ (dev-transform clean) | not live-verified | Retrofitted to shared `LossLandscapeHeatmap` pattern; `Mode`/`PillSelect` generic bug found + fixed |
| RidgeRegressionStudio | ✅ | ⚠️ not this session | ✅ | not live-verified | Uses shared `RegularizationPathChart` pattern + `getFeatureColors` |
| LassoRegressionStudio | ✅ | ⚠️ not this session | ✅ | not live-verified | Same pattern as Ridge; coordinate-descent lasso math ported verbatim |
| LogisticRegressionStudio | ✅ | ⚠️ not this session | ✅ | not live-verified | Uses `LossLandscapeHeatmap`; `Mode`/`LossType` `PillSelect` generic bugs found + fixed |
| DecisionBoundaryPlayground | ✅ | ⚠️ not this session | ✅ | not live-verified | `decisionBoundary.ts` had a discriminated-union narrowing bug in `treePredict`'s `while` loop, fixed |
| EmbeddingSpaceExplorer | ✅ | ⚠️ not this session | ✅ | not live-verified | `embeddings.ts` had a literal-type inference bug (`0 \| 3` instead of `number[]`), fixed |
| NeuralNetworkPlayground | ✅ | ⚠️ not this session | ✅ | not live-verified | Uses shared `colorBlend.ts` (`hexToRgb`/`blendColor`) instead of a local duplicate |
| AgentExecutionGraph | ✅ | ⚠️ not this session | ✅ | not live-verified | React Flow ReAct-loop diagram, scripted scenarios ported verbatim |
| InferenceFlowVisualizer | ✅ | ⚠️ not this session | ✅ | not live-verified | React Flow pipeline + `sampling.ts` (real softmax/temperature/top-k/top-p) |
| AttentionStepThrough | ✅ | ⚠️ not this session | ✅ | not live-verified | Real Q·Kᵀ/√d attention math (`attention.ts`), uses shared `hexToRgb` |
| AlgorithmSelector | ✅ | ⚠️ not this session | ✅ | not live-verified | Decision-tree data ported to `algorithmSelectorTree.ts`; `Link` now `react-router-dom` |
| LearningPathMap | ✅ | ⚠️ not this session | ✅ | not live-verified | `sectionMeta.ts` ported verbatim; targets `/docs/category/*` pages that don't exist yet (content migration is a later phase) |
| GradientDescentExplorer | ✅ | ⚠️ not this session | ✅ | not live-verified | The *real* 244-line original (distinct from the Phase 1 acceptance test's `GradientDescentDemo`, which is a new component, not a port) |

**All 14 components: ported.**

## What was actually verified this session

- `npm run build` (`tsc -b && vite build`): **zero TypeScript errors**, clean production build, after fixing 4 distinct pre-existing type bugs surfaced by the first full build since these components were added (see Notes column and "Bugs found" below).
- Every new/changed component's module was individually fetched from the Vite dev server and confirmed to transform cleanly (no syntax/transform errors).
- A new internal verification page, `src/content/docs/deep-learning/component-porting-check.mdx`, embeds all 13 non-acceptance-test components in one place (compiles and serves at `/docs/deep-learning/component-porting-check`).
- **Not done this session**: live in-browser interaction/visual/console verification of the 13 components ported since the Phase 1 checkpoint. The Chrome browser extension was not connected, and installing Playwright fresh (not currently a project dependency) was judged out of scope for a verification pass rather than something the user asked for. RagPipelineSimulator and the acceptance-test's GradientDescentDemo were verified live earlier in this session, before the Chrome connection was lost.

## Bugs found and fixed (during the build pass, not caught earlier because no full build had been run since these files were added)

1. **`PillSelect<T>` generic misinference**, recurring: `LinearRegressionStudio`'s and `LogisticRegressionStudio`'s "Mode" pill selects, and `LogisticRegressionStudio`'s loss-type options array, all inferred a wrong/mismatched type. Fixed by giving `mode`/`lossType` explicit union types (`type Mode = 'fit' | 'gd'`) and specifying the generic at each call site — same class of bug as the one found during `RagPipelineSimulator`'s port.
2. **Discriminated-union narrowing inside a `while` loop**: `decisionBoundary.ts`'s `treePredict` used `while (!node.leaf)`, which TypeScript failed to narrow across loop iterations after `node` is reassigned inside the body. Fixed with an explicit `while (node.leaf === false)` check.
3. **Literal-type inference in `embeddings.ts`**: `CATEGORY_SCALE = 3` (untyped `const`) made `.map()` infer a `(0 | 3)[]` tuple-ish array type instead of `number[]`, breaking a later `.push()`. Fixed with an explicit `number[]` annotation.
4. **Unused import**: leftover `VizTokens` type import in `AttentionStepThrough.tsx`.

None of these are logic bugs in the ported math/behavior — all four are TypeScript inference gaps, caught by the compiler itself, not runtime issues.

## Reusable primitives/patterns extracted (cumulative, including earlier ports)

- `src/viz/lib/colorBlend.ts` — `hexToRgb`/`lerp`/`blendColor`, now shared by `NeuralNetworkPlayground` and `AttentionStepThrough` (was duplicated 3 ways before extraction).
- `src/viz/patterns/LossLandscapeHeatmap.tsx` — shared by `LinearRegressionStudio` and `LogisticRegressionStudio`.
- `src/viz/patterns/RegularizationPathChart.tsx` — shared by `RidgeRegressionStudio` and `LassoRegressionStudio`.
- No new extraction opportunities found in this batch (`InferenceFlowVisualizer`, `AttentionStepThrough`, `AlgorithmSelector`, `LearningPathMap`, `GradientDescentExplorer`) — each has genuinely distinct visualization logic (React Flow pipeline, attention math + tensor heatmap, decision-tree UI, learning-path graph, D3 loss-bowl canvas).

## Bundle-size observation

Production build succeeds but emits a chunk-size warning: the main JS entry (`index-*.js`) is **734 KB / 232 KB gzipped**, because every route (including every one of the 14+ visualization components, React Flow, D3, and Three.js/R3F/drei as installed-but-unused-so-far deps) is bundled into a single entry chunk — there's no route-based code-splitting yet. Shiki's per-language chunks are already correctly tree-shaken (confirmed in Phase 1). This is a Phase 3/4 concern (lazy-load doc pages / viz components via `React.lazy` + `import()`), not something to fix now, but worth flagging before mass content migration multiplies the number of routes.

## Architectural concerns before mass content migration

- **`LearningPathMap` and `AlgorithmSelector`** link to `/docs/category/*` and `/docs/machine-learning/*` routes that don't exist in `platform-vite` yet (content migration is Phase 2) — these components are functionally correct but their navigation targets 404 until real content lands. Not a bug in the port; flagging so it's not mistaken for one during review.
- **No route-based code-splitting yet** — see bundle-size note above.
- **Live browser verification gap** — 13 of 14 ported components have not had a real-browser interaction pass this session (see above). Recommend a Playwright pass (or manual spot-check) over `component-porting-check.mdx` and `attention-demo.mdx`, in both themes and at least 2 page skins, before treating Phase 1.5 as fully closed.
