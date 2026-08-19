# Diagram migration progress — this session's scope

Tracking interactive-diagram conversion (≥10 custom `.tsx` components per page,
`src/viz/diagrams/`, following `diagramSystem.ts` conventions — same standard as
`deep-learning/attention-transformers.mdx`) for this session's assigned folders.

Other sessions (confirmed via cross-session coordination on 2026-08-19):
- `vite-react-visualization-migration` owns `deep-learning/`, `machine-learning/`.
- `platform-vite-38` owns `databases/`, `ml-system-design/`, `llms-genai/`, `agents/` (incl. `agents/mcp/`).
- This session owns `speech-audio/`, `computer-vision/`, `mlops/` — 35 pages.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (≥10 components, committed)

**Scope calibration, revised 2026-08-20:** superseded by the lead's sitewide audit — 34 of 60 section overview.mdx/roadmap.mdx pages (15-28 lines) are a tracked P0 gap, since these are the homepage topic-grid's actual landing pages. speech-audio/overview.mdx (20 lines) and speech-audio/roadmap.mdx (24 lines) fall in that bucket and are claimed by this session (confirmed to the lead 2026-08-20) — will expand into real content, then diagram, once the message-queues page (next task, assigned by lead) is done. roadmap.mdx pages specifically may still end up staying closer to a checklist (matches deep-learning/roadmap.mdx precedent) even after a content pass — judgment call per page, not a blanket rule either way anymore. computer-vision/roadmap.mdx not yet claimed/decided; revisit after speech-audio.

**Cross-project work done in this session outside the original 35-page diagram scope** (tracked here since it's the same session): built the homepage (src/components/Home.tsx, commit 313f1d9), rewrote getting-started/intro.mdx (3607bd1), added per-route document.title (270ef45), deleted the redundant src/content/docs/intro.mdx (d4e7c84). All pushed + deployed.

## speech-audio/ (4 content pages)
- [ ] overview.mdx — claimed, P0 stub-expansion queued after message-queues page
- [ ] roadmap.mdx — claimed, same
- [x] audio-fundamentals.mdx — 7 components (commit 386f71d): SamplingNyquistDiagram, BitDepthQuantizationDiagram, FourierSumOfSinesDiagram, WaveformSpectrogramDiagram (raster replacement), StftWindowTradeoffDiagram, MelScaleDiagram, MfccPipelineDiagram. Below the aspirational ≥10 target -- 7 genuinely content-tied diagrams, no padding.
- [ ] speech-audio-tasks.mdx

## computer-vision/ (5 content pages)
- [x] overview.mdx — 10 content-tied interactive diagrams, substantive prose expansion, and browser/build validation (commits ae5c29d, b212122, e55e039)
- [ ] roadmap.mdx — status TBD, see scope calibration note above
- [ ] vision-fundamentals.mdx — has 1 raster (convolution-demo.png)
- [ ] vision-tasks-and-models.mdx
- [ ] modern-vision-and-multimodal.mdx

## New: mlops/message-queues-and-async-processing.mdx (assigned by lead, 2026-08-20)
- [x] Done. 6 components: SyncVsAsyncDiagram, ProducerQueueConsumerDiagram (live producer/consumer-rate simulation, genuinely accumulates/drains), PubSubVsPointToPointDiagram, DeliverySemanticsDiagram (at-most/at-least/exactly-once stepper), PartitionOrderingDiagram, QueueToolComparisonDiagram (Kafka/Celery/Redis/SQS). Cross-linked from pipeline-orchestration.mdx (updated its "Next:" to route through this page) and model-serving.mdx's streaming-inference section. Verified via headless browser (all 6 diagrams interact correctly) + full smoke suite (10/10).
- Next queued (lead, 2026-08-20): databases/vector/overview.mdx and databases/graph/overview.mdx expansion -- both thin stubs, cross-linked from llms-genai/rag.mdx for RAG context, focus on DB mechanics (ANN/HNSW, Cypher, Neo4j) not duplicating retrieval-pipeline content.

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
