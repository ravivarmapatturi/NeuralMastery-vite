# Diagram migration progress — platform-vite-38's scope

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

Next queued task from lead (high
priority, sent 2026-08-20): expand `agents/mcp/protocol-deep-dive.mdx` from a
63-line skeleton into real step-by-step depth across its existing 8 sections
(Transport, Sessions/Lifecycle, Tool Discovery/Schemas, Errors, Auth, Security,
Enterprise Deployment, Building an MCP Server) — outline is already right, don't
restructure it. User's complaint: "full info step by step info is not there."
Lead + user were explicit: fetch the REAL spec content via WebFetch from
modelcontextprotocol.io/specification and github.com/modelcontextprotocol
(JSON-RPC message shapes, initialize handshake, capability negotiation, session
lifecycle) rather than reconstructing from memory — accuracy matters for a real,
evolving protocol spec. Diagrams still built fresh with our own design system.
Existing reference: McpVsA2aScopeDiagram, agents/a2a/overview.mdx.

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
