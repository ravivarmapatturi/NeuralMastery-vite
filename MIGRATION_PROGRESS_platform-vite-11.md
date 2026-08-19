# Diagram migration progress — this session's scope

Tracking interactive-diagram conversion (≥10 custom `.tsx` components per page,
`src/viz/diagrams/`, following `diagramSystem.ts` conventions — same standard as
`deep-learning/attention-transformers.mdx`) for this session's assigned folders.

Other sessions (confirmed via cross-session coordination on 2026-08-19):
- `vite-react-visualization-migration` owns `deep-learning/`, `machine-learning/`.
- `platform-vite-38` owns `databases/`, `ml-system-design/`, `llms-genai/`, `agents/` (incl. `agents/mcp/`).
- This session owns `speech-audio/`, `computer-vision/`, `mlops/` — 35 pages.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (≥10 components, committed)

## speech-audio/ (4 content pages)
- [ ] overview.mdx — check for thin-stub content first (user policy 2026-08-19: expand stubs into real prose before adding diagrams)
- [ ] roadmap.mdx — same check
- [x] audio-fundamentals.mdx — 7 components (commit 386f71d): SamplingNyquistDiagram, BitDepthQuantizationDiagram, FourierSumOfSinesDiagram, WaveformSpectrogramDiagram (raster replacement), StftWindowTradeoffDiagram, MelScaleDiagram, MfccPipelineDiagram. Below the aspirational ≥10 target -- 7 genuinely content-tied diagrams, no padding.
- [ ] speech-audio-tasks.mdx

## computer-vision/ (5 content pages)
- [x] overview.mdx — 10 content-tied interactive diagrams, substantive prose expansion, and browser/build validation (commits ae5c29d + pending follow-up)
- [ ] roadmap.mdx
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
