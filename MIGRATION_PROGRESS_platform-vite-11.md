# Diagram migration progress — this session's scope

Tracking interactive-diagram conversion (≥10 custom `.tsx` components per page,
`src/viz/diagrams/`, following `diagramSystem.ts` conventions — same standard as
`deep-learning/attention-transformers.mdx`) for this session's assigned folders.

Other sessions (confirmed via cross-session coordination on 2026-08-19):
- `vite-react-visualization-migration` owns `deep-learning/`, `machine-learning/`.
- `platform-vite-38` owns `databases/`, `ml-system-design/`, `llms-genai/`, `agents/` (incl. `agents/mcp/`).
- This session owns `speech-audio/`, `computer-vision/`, `mlops/` — 35 pages.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (≥10 components, committed)

**Scope calibration (decided after checking the established precedent in deep-learning/, the most mature folder):** `overview.mdx` and `roadmap.mdx` pages that already contain real explanatory prose (not a bare link-list stub) stay as lightweight navigation — no forced diagram count. deep-learning/overview.mdx (23 lines, guiding-questions + path-through-section, same shape as mlops/overview.mdx and speech-audio/overview.mdx) has zero diagrams even in the most actively-worked folder, and no roadmap.mdx sitewide has diagrams. The "expand stubs first" directive applies to genuinely bare pages (just links, no prose) like ml-system-design/overview.mdx was before platform-vite-38 expanded it — not to already-substantive overview/roadmap pages. computer-vision/overview.mdx already got the full 10-diagram treatment before this was decided; leaving it as-is (good work, not reverting), but not replicating that pattern on the remaining overview/roadmap pages in this scope. Diagram effort goes to the real topic pages instead.

## speech-audio/ (4 content pages)
- [~] overview.mdx — has real explanatory prose already (not a bare stub); leaving as lightweight nav per scope calibration above, no diagrams needed
- [~] roadmap.mdx — pure checklist by design (matches deep-learning/roadmap.mdx); no diagrams needed
- [x] audio-fundamentals.mdx — 7 components (commit 386f71d): SamplingNyquistDiagram, BitDepthQuantizationDiagram, FourierSumOfSinesDiagram, WaveformSpectrogramDiagram (raster replacement), StftWindowTradeoffDiagram, MelScaleDiagram, MfccPipelineDiagram. Below the aspirational ≥10 target -- 7 genuinely content-tied diagrams, no padding.
- [ ] speech-audio-tasks.mdx

## computer-vision/ (5 content pages)
- [x] overview.mdx — 10 content-tied interactive diagrams, substantive prose expansion, and browser/build validation (commits ae5c29d, b212122, e55e039)
- [~] roadmap.mdx — pure checklist by design; no diagrams needed
- [ ] vision-fundamentals.mdx — has 1 raster (convolution-demo.png)
- [ ] vision-tasks-and-models.mdx
- [ ] modern-vision-and-multimodal.mdx

## mlops/ (26 content pages)
- [ ] overview.mdx
- [ ] roadmap.mdx
- [ ] mlops-architecture-and-roadmap.mdx — has 2 rasters (data-pipeline.png/light)
- [ ] engineering-foundations.mdx
- [ ] data-engineering-and-versioning.mdx
- [ ] experiment-tracking.mdx
- [ ] feature-stores-and-model-registry.mdx
- [ ] pipeline-orchestration.mdx
- [ ] gpu-and-distributed-training.mdx
- [ ] containers.mdx
- [ ] kubernetes.mdx
- [ ] infrastructure-as-code.mdx
- [ ] cicd-and-ml-cicd.mdx
- [ ] cloud-computing.mdx
- [ ] deployment-strategies.mdx
- [ ] model-serving.mdx
- [ ] llm-hosting-and-serving-patterns.mdx
- [ ] llm-inference-engines.mdx
- [ ] llm-inference-optimization.mdx
- [ ] llm-evaluation-and-ragops.mdx
- [ ] monitoring-and-drift.mdx
- [ ] observability.mdx
- [ ] production-reliability.mdx
- [ ] ml-and-llm-testing.mdx
- [ ] security-and-reproducibility.mdx
- [ ] ai-cost-engineering.mdx
- [ ] legal-licensing-and-governance.mdx

**Total: 35 pages.** Working smallest-folder-first (speech-audio → computer-vision → mlops) to dial in the pattern before the big mlops batch. Committing per page.
