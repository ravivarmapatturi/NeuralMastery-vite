# Diagram migration progress — platform-vite-38's scope

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

## databases/ (6 pages)
- [ ] overview.mdx — check stub status
- [ ] roadmap.mdx — check stub status
- [ ] graph/overview.mdx — check stub status
- [ ] relational/overview.mdx — check stub status
- [ ] vector/overview.mdx — check stub status
- [ ] relational/postgresql.mdx — has 2 bespoke diagrams from a separate task (platform-vite-11, committed 0f64b61); real content, likely needs more diagrams to reach 10, not content expansion

## ml-system-design/ (5 pages)
- [stub] overview.mdx — confirmed 4-line nav stub by fork; needs content expansion, then diagrams
- [ ] roadmap.mdx — check stub status
- [ ] the-9-step-framework.mdx
- [ ] case-studies.mdx
- [ ] model-catalog-and-benchmarking.mdx

## llms-genai/ (8 pages)
- [ ] overview.mdx — check stub status
- [ ] roadmap.mdx — check stub status
- [~] foundation-model-internals.mdx — fork in progress
- [~] training-pipeline.mdx — fork in progress (retry; first attempt returned bogus summary, no work done)
- [ ] prompt-engineering.mdx
- [x] rag.mdx — done, 11 components, commit 215e2f1
- [ ] evaluation-and-serving.mdx
- [ ] multimodal-generative-models.mdx

## agents/ (8 pages)
- [ ] overview.mdx — check stub status
- [ ] roadmap.mdx — check stub status
- [~] agent-fundamentals.mdx — fork in progress
- [ ] agent-architectures.mdx
- [ ] multi-agent-systems.mdx
- [ ] a2a/overview.mdx — check stub status
- [ ] mcp/overview.mdx — check stub status
- [ ] mcp/protocol-deep-dive.mdx

**Total: 27 pages** (speech-audio/, computer-vision/, mlops/ handed off to `platform-vite-11` — tracked in its own session, not here).
