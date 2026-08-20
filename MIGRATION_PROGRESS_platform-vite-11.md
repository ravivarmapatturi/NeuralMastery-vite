# Diagram migration progress — this session's scope

Tracking interactive-diagram conversion (≥10 custom `.tsx` components per page,
`src/viz/diagrams/`, following `diagramSystem.ts` conventions — same standard as
`deep-learning/attention-transformers.mdx`) for this session's assigned folders.

Other sessions (confirmed via cross-session coordination on 2026-08-19, updated 2026-08-20):
- `vite-react-visualization-migration` — lead, platform strategy/homepage/cross-cutting fixes, assigns work.
- `platform-vite-38` owns `databases/`, `ml-system-design/`, `llms-genai/`, `agents/` (incl. `agents/mcp/`).
- `platform-vite-ad` owns `cs-fundamentals/` (APIs page) and, as of 2026-08-20, `mlops/` diagram coverage (reassigned from this session — mlops/message-queues-and-async-processing.mdx below was already shipped by this session before the reassignment and stays as-is, but no further mlops/ pages).
- This session owns `speech-audio/`, `computer-vision/` (original scope) plus ad-hoc lead assignments: homepage, getting-started/intro.mdx, per-route document.title, intro.mdx deletion, message-queues page (all shipped), and next: `databases/vector/overview.mdx` + `databases/graph/overview.mdx`.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (≥10 components, committed)

**Scope calibration, revised 2026-08-20:** superseded by the lead's sitewide audit — 34 of 60 section overview.mdx/roadmap.mdx pages (15-28 lines) are a tracked P0 gap, since these are the homepage topic-grid's actual landing pages. speech-audio/overview.mdx (20 lines) and speech-audio/roadmap.mdx (24 lines) fall in that bucket and are claimed by this session (confirmed to the lead 2026-08-20) — will expand into real content, then diagram, once the message-queues page (next task, assigned by lead) is done. roadmap.mdx pages specifically may still end up staying closer to a checklist (matches deep-learning/roadmap.mdx precedent) even after a content pass — judgment call per page, not a blanket rule either way anymore. computer-vision/roadmap.mdx not yet claimed/decided; revisit after speech-audio.

**Cross-project work done in this session outside the original 35-page diagram scope** (tracked here since it's the same session): built the homepage (src/components/Home.tsx, commit 313f1d9), rewrote getting-started/intro.mdx (3607bd1), added per-route document.title (270ef45), deleted the redundant src/content/docs/intro.mdx (d4e7c84). All pushed + deployed.

## speech-audio/ (4 content pages)
- [x] overview.mdx — commit 9c5d237, pushed+deployed. 4 components (RawAudioCompressionDiagram, AudioTaskIODiagram, LatencyBudgetDiagram, AudioEvaluationMetricsDiagram)
- [~] roadmap.mdx — decided: stays a checklist, matches sitewide precedent (no roadmap.mdx anywhere has been expanded)
- [x] audio-fundamentals.mdx — 7 components (commit 386f71d): SamplingNyquistDiagram, BitDepthQuantizationDiagram, FourierSumOfSinesDiagram, WaveformSpectrogramDiagram (raster replacement), StftWindowTradeoffDiagram, MelScaleDiagram, MfccPipelineDiagram. Below the aspirational ≥10 target -- 7 genuinely content-tied diagrams, no padding.
- [x] speech-audio-tasks.mdx — commit 34f79e2, pushed, deploy triggered (run 32330037695). 5 components (CtcAlignmentDiagram -- real CTC collapse rule -- TtsPipelineDiagram, SpeakerVerificationDiagram, DiarizationTimelineDiagram, SpeechEnhancementDiagram).

**speech-audio/ complete.**

## computer-vision/ (5 content pages)
- [x] overview.mdx — 10 content-tied interactive diagrams, substantive prose expansion, and browser/build validation (commits ae5c29d, b212122, e55e039)
- [~] roadmap.mdx — same decision as speech-audio/roadmap.mdx: stays a checklist
- [x] vision-fundamentals.mdx — commit 21e720b, pushed+deployed. 5 components (ConvolutionSlideDiagram -- raster replacement, real computed convolution -- RgbChannelDecompositionDiagram, MorphologicalOpsDiagram, HogFeatureDiagram, DataAugmentationDiagram).
- [x] vision-tasks-and-models.mdx — commit 1c660cc, pushed+deployed. 5 components (PoseEstimationApproachDiagram, OcrPipelineDiagram, TrackingAssociationDiagram, StereoDepthDiagram -- real disparity geometry -- OpticalFlowFieldDiagram).
- [x] modern-vision-and-multimodal.mdx — commit e6f8d2e, pushed+deployed. 4 components (TemporalConsistencyDiagram, VideoUnderstandingArchitectureDiagram, PointCloudDiagram -- live 3D rotation -- NerfRayMarchingDiagram -- real volume-rendering accumulation).

**computer-vision/ complete.**

# ORIGINAL 35-PAGE SCOPE COMPLETE (2026-08-20)

All of speech-audio/ and computer-vision/ done. Plus, along the way: homepage, getting-started/intro.mdx, per-route document.title, intro.mdx deletion, mlops/message-queues-and-async-processing.mdx, databases/vector+graph overview.mdx expansions -- all shipped, pushed, and deployed. Awaiting next assignment from the lead.

**computer-vision/ complete** (all 5 pages: overview + 3 content pages with diagrams, roadmap.mdx staying a checklist by design).

## New: mlops/message-queues-and-async-processing.mdx (assigned by lead, 2026-08-20)
- [x] Done. 6 components: SyncVsAsyncDiagram, ProducerQueueConsumerDiagram (live producer/consumer-rate simulation, genuinely accumulates/drains), PubSubVsPointToPointDiagram, DeliverySemanticsDiagram (at-most/at-least/exactly-once stepper), PartitionOrderingDiagram, QueueToolComparisonDiagram (Kafka/Celery/Redis/SQS). Cross-linked from pipeline-orchestration.mdx (updated its "Next:" to route through this page) and model-serving.mdx's streaming-inference section. Verified via headless browser (all 6 diagrams interact correctly) + full smoke suite (10/10).
## databases/vector/overview.mdx + databases/graph/overview.mdx (assigned by lead, 2026-08-20)
- [x] Done, commit 60cde0f, pushed + deployed. vector/overview.mdx: 4 components (EmbeddingSimilaritySearchDiagram, HnswSearchDiagram -- real greedy multi-layer graph search -- AnnVsExactTradeoffDiagram, VectorDbToolComparisonDiagram). graph/overview.mdx: 4 components (PropertyGraphDiagram, RelationalVsGraphTraversalDiagram, CypherPatternMatchDiagram, DatabaseChoiceDecisionDiagram), plus an explicit note distinguishing it from graph-ml/graph-ml-fundamentals.mdx per the lead's ask. Verified headless (both pages, all 8 diagrams) + tsc -b + build, all clean at verification time.

Note on pace: mlops/ is now platform-vite-ad's (reassigned 2026-08-20, see top-of-file ownership note) -- this session's remaining original scope is speech-audio/ (overview.mdx, roadmap.mdx, speech-audio-tasks.mdx) and computer-vision/ (roadmap.mdx, vision-fundamentals.mdx, vision-tasks-and-models.mdx, modern-vision-and-multimodal.mdx), plus whatever the lead assigns next.

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

## python-engineering/ + cs-fundamentals/ (assigned by lead, 2026-08-20)
- [x] python-engineering/overview.mdx (ff57605)
- [x] python-engineering/language-fundamentals-and-oop.mdx (46d8d75)
- [x] python-engineering/concurrency-memory-and-performance.mdx (4ead237)
- [x] python-engineering/packaging-testing-and-tooling.mdx (13980f8)
- [~] python-engineering/roadmap.mdx — checklist, stays as-is
**python-engineering/ complete.**
- [ ] cs-fundamentals/overview.mdx
- [ ] cs-fundamentals/operating-systems-and-concurrency.mdx — next
- [ ] cs-fundamentals/networking-and-distributed-systems.mdx — HTTP section already trimmed to point at apis-http-and-protocols.mdx; other sections (TCP/UDP, DNS, load balancing, CAP, consensus) still need diagrams
- [ ] cs-fundamentals/linux-git-and-tooling.mdx
- [ ] cs-fundamentals/software-engineering-practices.mdx
- [x] cs-fundamentals/apis-http-and-protocols.mdx — already done (ad, 11 diagrams)
- [~] cs-fundamentals/roadmap.mdx — checklist, stays as-is
- [x] cs-fundamentals/overview.mdx (ba3d43a)
- [x] cs-fundamentals/operating-systems-and-concurrency.mdx (755ec70)
- [x] cs-fundamentals/networking-and-distributed-systems.mdx (fde20c3)
- [x] cs-fundamentals/linux-git-and-tooling.mdx (33f030c)
- [x] cs-fundamentals/software-engineering-practices.mdx (7602ebb)
**cs-fundamentals/ complete.**

# python-engineering/ + cs-fundamentals/ ASSIGNMENT COMPLETE (2026-08-20)

Also shipped in this window (shared-primitive/bugfix work for the lead, interleaved):
- Watermark on VisualizationContainer (58e10da)
- Sidebar collapsible-tree fix, resolves the empty-gap bug too (0720ef1)
