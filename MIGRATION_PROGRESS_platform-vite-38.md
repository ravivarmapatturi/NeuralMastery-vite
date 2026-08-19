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

## databases/ (6 pages)
- [ ] overview.mdx
- [ ] roadmap.mdx
- [ ] graph/overview.mdx
- [ ] relational/overview.mdx
- [ ] vector/overview.mdx
- [ ] relational/postgresql.mdx — already has 2 bespoke diagrams from a separate task (platform-vite-11); may already be near/at standard, check before adding more

## ml-system-design/ (5 pages)
- [ ] overview.mdx
- [ ] roadmap.mdx
- [ ] the-9-step-framework.mdx
- [ ] case-studies.mdx
- [ ] model-catalog-and-benchmarking.mdx

## llms-genai/ (8 pages)
- [ ] overview.mdx
- [ ] roadmap.mdx
- [ ] foundation-model-internals.mdx
- [ ] training-pipeline.mdx
- [ ] prompt-engineering.mdx
- [ ] rag.mdx
- [ ] evaluation-and-serving.mdx
- [ ] multimodal-generative-models.mdx

## agents/ (8 pages)
- [ ] overview.mdx
- [ ] roadmap.mdx
- [ ] agent-fundamentals.mdx
- [ ] agent-architectures.mdx
- [ ] multi-agent-systems.mdx
- [ ] a2a/overview.mdx
- [ ] mcp/overview.mdx
- [ ] mcp/protocol-deep-dive.mdx

**Total: 27 pages** (speech-audio/, computer-vision/, mlops/ handed off to `platform-vite-11` — tracked in its own session, not here).
