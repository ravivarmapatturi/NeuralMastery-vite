# Diagram migration progress — platform-vite-38's scope

## SESSION HANDOFF (2026-08-21) — this session is leaving platform-vite

Org change from the user: this session (`platform-vite-38`) is now leading a new
department — optimizing the user's personal GitHub RAG project
(`qa_rag_application`) — and is stepping off platform-vite entirely.
`platform-vite-5d` is now sole owner of platform-vite going forward.

**Everything below in the deep-learning/ + llms-genai/ 9-page batch that is
still unchecked is now unassigned and up for grabs by `platform-vite-5d`:**
- [ ] deep-learning/training-deep-networks.mdx — flagged high-value (norm/reg/residual)
- [ ] deep-learning/generative-models.mdx — flagged high-value (GANs/diffusion)
- [ ] llms-genai/prompt-engineering.mdx
- [ ] llms-genai/multimodal-generative-models.mdx
- [ ] llms-genai/evaluation-and-serving.mdx

Also still unassigned/incomplete from this session's original scope further
down this file (databases/, ml-system-design/, remaining llms-genai/ and
agents/ pages) — all of it reverts to `platform-vite-5d`.

## CURRENT STATUS (updated 2026-08-20, read this first on resume)

Ownership below is stale — as of 2026-08-19/20 this session has been taking
direct task assignments from the lead session `vite-react-visualization-migration`
via cross-session messages, not from the static folder split further down.
Actual current work: `mlops/` diagram coverage, in batches of 6 pages, assigned
live by the lead. Do not re-derive from git log — this file is the source of truth.

**mlops/ batch 4 (6 pages), in progress:**
- [x] infrastructure-as-code.mdx — 7 diagrams, commit 78c066a
- [x] security-and-reproducibility.mdx — 7 diagrams, commit a777eb7
- [x] legal-licensing-and-governance.mdx — 7 diagrams, commit b5ac68a
- [x] ai-cost-engineering.mdx — 7 diagrams, commit ace7bc8
- [x] engineering-foundations.mdx — 7 diagrams (1 reused: DependencyPinningDiagram), commit b3ac193
- [x] llm-hosting-and-serving-patterns.mdx — 8 diagrams, commit ee3437a

**mlops/ batch 3 (done, prior checkpoint):**
- [x] llm-evaluation-and-ragops.mdx — commit 25de4ef
- [x] production-reliability.mdx — commit 82ffaa9
- [x] cloud-computing.mdx — commit 2cb2e5e

**mlops/ folder is now COMPLETE — 24/24 pages, batch 4 done 2026-08-20.**

**MCP protocol-deep-dive.mdx task: DONE.** Expanded from 63-line skeleton into
real step-by-step depth across all 8 existing sections, grounded in the actual
spec (fetched 2025-06-18 revision from modelcontextprotocol.io/specification:
lifecycle, transports, tools, authorization pages) plus the official Python
quickstart server example for the "Building an MCP Server" section. 9 new
diagrams. Commit 96b5606, pushed + deployed.
**agents/mcp/overview.mdx: DONE too** (lead approved doing it next). Expanded
from 37-line stub with one raster ThemedImage into full section-level
coverage (M×N-to-M+N problem, client/server architecture replacing the
raster image, capability types, roles, real-world servers, local vs remote,
agent-loop tie-in, A2A tie-in). 7 new diagrams + 1 reused
(McpVsA2aScopeDiagram). PNG pair deleted. Commit 8731904 (pushed after a
pathspec snag from re-adding an already-git-rm'd file — resolved by not
re-adding already-staged deletions). Pushed + deployed.

mcp/ subfolder (overview.mdx + protocol-deep-dive.mdx) is now fully
consistent with the rest of the site.

**New batch from lead (2026-08-20), 9 pages, deep-learning/ + llms-genai/
(lead's own originally-claimed folder, "no folder gets quietly exempted"):**
- [x] deep-learning/cnns.mdx — 9 diagrams, commit 1860d46
- [x] deep-learning/vision-architectures.mdx — 8 diagrams, commit 609fb7d
- [x] deep-learning/advanced-architectures.mdx — 8 diagrams, commit 29812e5
- [x] deep-learning/nn-layers-reference.mdx — 7 diagrams, commit d8434fa
- [ ] deep-learning/training-deep-networks.mdx — lead flagged as high-value (norm/reg/residual) — UNASSIGNED, see handoff note at top
- [ ] deep-learning/generative-models.mdx — lead flagged as high-value (GANs/diffusion)
- [ ] llms-genai/prompt-engineering.mdx
- [ ] llms-genai/multimodal-generative-models.mdx
- [ ] llms-genai/evaluation-and-serving.mdx

Per-page workflow established this session (repeat every time): read page →
design 6-7 diagram concepts tied to actual section content (reuse an existing
component when a page elsewhere already covers the same concept) → write .tsx
files in src/viz/diagrams/ (VisualizationContainer + useVizTokens +
getConceptColor, watch for unused imports) → add MDX imports + placements
after the relevant bullet/section → `npx tsc --noEmit -p .` filtered to just
the new files/page → `npx vite build` (bypass tsc -b, shared repo has other
sessions' WIP) → `npm run check:links` → `git add` exact paths + `git commit
-- ` exact paths (never broad `git add -A`, shared working directory) → `git
push origin main` → `gh workflow run deploy.yml --repo
ravivarmapatturi/NeuralMastery-vite` → SendMessage status to
`vite-react-visualization-migration`.


Tracking interactive-diagram conversion (≥10 custom `.tsx` components per page,
`src/viz/diagrams/`, following `diagramSystem.ts` conventions — same standard as
`deep-learning/attention-transformers.mdx`) for this session's assigned folders.

Other sessions (confirmed via cross-session coordination on 2026-08-19):
- `vite-react-visualization-migration` owns `deep-learning/`, `machine-learning/`.
- `platform-vite-11` owns `mlops/`, `speech-audio/`, `computer-vision/`.
- This session (`platform-vite-38`) owns `databases/`, `ml-system-design/`,
  `llms-genai/`, `agents/` (incl. `agents/mcp/`) — 27 pages.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (≥10 components, committed)

**2026-08-19 scope decision (user, applies site-wide, relayed to both other sessions):**
thin nav/index stubs (most `overview.mdx`/`roadmap.mdx` — a few lines of links,
no real explanatory content) do NOT get diagrams forced onto them as-is. They
get expanded into real substantive content first (matching the depth of a page
like `attention-transformers.mdx`), THEN ≥10 diagrams. Marked `[stub]` below
until checked; `[content]` = content-expansion done, diagrams still needed.

**2026-08-19 ~22:30 note:** session hit an API usage-limit outage that killed 4 in-flight
forks mid-task. A recovery process (commit a402920) picked up their partial work and
finished/committed most of it cleanly — verified below by actually checking each page's
component count + a clean `tsc -b`, not by trusting fork self-reports. One fork
(training-pipeline.mdx) went off-script investigating databases/ instead of doing its
assigned page and never actually did it — still open.

## databases/ (6 pages)
- [ ] overview.mdx (15 lines) — check stub status
- [ ] roadmap.mdx (36 lines) — check stub status
- [ ] graph/overview.mdx (30 lines) — substantive per earlier fork assessment, not a stub
- [ ] relational/overview.mdx (40 lines) — substantive per earlier fork assessment, not a stub
- [ ] vector/overview.mdx (37 lines) — substantive per earlier fork assessment, not a stub
- [x] relational/postgresql.mdx — has 2 bespoke diagrams from a separate task (platform-vite-11, commit 0f64b61); leaving as-is, not part of the >=10 standard (different task)

## ml-system-design/ (5 pages)
- [x] overview.mdx — done, 10 components, verified (commit a402920 recovery batch)
- [x] roadmap.mdx — done, 2 components (deliberately, this is a checklist/index page), commit e55e039/993342c
- [ ] the-9-step-framework.mdx (58 lines)
- [ ] case-studies.mdx (47 lines)
- [ ] model-catalog-and-benchmarking.mdx (70 lines)

## llms-genai/ (8 pages)
- [stub] overview.mdx (18 lines) — confirmed nav stub, needs content expansion then diagrams
- [ ] roadmap.mdx (71 lines) — check stub status
- [x] foundation-model-internals.mdx — done, 11 components, verified (commit a402920 recovery batch)
- [ ] training-pipeline.mdx (101 lines) — NOT done despite earlier fork claim; that fork went off-script, 0 components wired, substantive page, needs full pass
- [ ] prompt-engineering.mdx
- [x] rag.mdx — done, 11 components, commit 215e2f1
- [ ] evaluation-and-serving.mdx
- [ ] multimodal-generative-models.mdx

## agents/ (8 pages)
- [stub] overview.mdx (17 lines) — confirmed nav stub, needs content expansion then diagrams
- [ ] roadmap.mdx (48 lines) — check stub status
- [x] agent-fundamentals.mdx — done, 10 components, verified (commit a402920 recovery batch)
- [ ] agent-architectures.mdx
- [ ] multi-agent-systems.mdx
- [ ] a2a/overview.mdx (27 lines) — check stub status
- [ ] mcp/overview.mdx (37 lines) — check stub status
- [ ] mcp/protocol-deep-dive.mdx

**Total: 27 pages** (speech-audio/, computer-vision/, mlops/ handed off to `platform-vite-11` — tracked in its own session, not here).
