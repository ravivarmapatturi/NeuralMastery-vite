# Migration progress tracker (this session)

Coordinator: `vite-react-visualization-migration`. Mission: bring stub/zero-diagram
pages up to the Intuition → Interactive Viz → Math → Code bar with real-computation
interactive diagrams (see attention-transformers.mdx as the quality reference).

## Done (all committed, typechecked, dev-server-verified)

**Original 7-section assignment** (interpretability, graph-ml, reinforcement-learning,
ai-safety, ai-security, ai-evaluation, nlp) — 14 pages, ~65 diagrams. Complete.

**mathematics-for-ai/** — all 4 pages complete (linear-algebra, calculus-optimization,
probability-statistics, algorithms-data-structures) — 26 diagrams.

**machine-learning/** — all 18 algorithm deep-dive pages complete, batched by family:
- Regression: elastic-net.mdx (ElasticNetStudio, reuses RegularizationPathChart)
- Tree/ensemble: random-forest, boosting, xgboost-lightgbm-catboost
- Classification: support-vector-machines, naive-bayes-lda-qda, sgd-classifier-regressor
- Specialized supervised: time-series-forecasting, survival-analysis,
  recommender-systems, learning-to-rank
- Clustering: dbscan-hdbscan, gmm-spectral-clustering (kmeans already had 1 diagram)
- Dim reduction: pca-svd, ica-tsne-umap
- Other unsupervised: association-rules, topic-modeling, anomaly-detection

Shared lib files created (src/viz/lib/): linalg, calculus, probstat, algorithms,
ensembles, classifiers, specializedSupervised, clustering, dimreduction,
unsupervisedMisc, elasticNet — reused across diagrams within a page/family
instead of each component reinventing math.

**machine-learning/ is now 100% complete**, including model-evaluation-metrics.mdx
and ml-workflow-fundamentals.mdx (both meta pages). supervised-learning.mdx and
unsupervised-learning.mdx were skipped deliberately (pure hub/survey pages,
coordinator's call).

**ai-for-science/** — complete (ai-for-science-fundamentals.mdx: real screening
funnel, real PINN loss, real neural-operator heat-equation demo).

**domain-applications/** — complete (healthcare-ai.mdx: real cost-weighted
threshold; other-domain-applications.mdx: real sim-to-real domain-randomization
gain comparison).

**frameworks/** — complete (core-ml-dl-frameworks.mdx reuses ChainRuleBackpropDiagram
for autograd; serving-mlops.mdx: real static-vs-continuous-batching simulation).
llm-agent-frameworks.mdx intentionally skipped -- pure tool-selection prose.

INCIDENT (self-caught, fixed, pushed as 1d652b0): created a new
ContinuousBatchingDiagram.tsx without checking for an existing file of that
name first -- collided with and overwrote another session's component (from
49830f5) used by mlops/llm-inference-optimization.mdx. Restored the original,
renamed mine to ContinuousBatchingSimulationDiagram.tsx. **New standing
practice: `ls src/viz/diagrams/ | grep -i <PlannedName>` before writing any
new diagram file, not just before touching shared infra files.**

Also fixed an unrelated CI-breaking TS6133 error on main in
NdcgRankingDiagram.tsx (not mine, but trivial + blocking everyone) and pushed.

**build-from-scratch/** — complete (the-build-list.mdx: reused
ChainRuleBackpropDiagram + BpeTokenizationDiagram rather than duplicating
already-well-illustrated concept pages -- this is a checklist page, light
touch is correct here).

**research-engineering/** — complete (how-to-read-ai-papers.mdx: clickable
paper-structure walkthrough; paper-timeline.mdx: clickable lineage diagram).
Both are methodology pages, not technical math -- click-through structural
diagrams, not real-computation ones, and that's the right call for this
content type.

**interview-prep/** — complete. dsa-coding.mdx and ml-coding.mdx reuse
existing diagrams (HashMapVsArrayDiagram, ChainRuleBackpropDiagram,
QkvProjectionDiagram); technology-comparisons.mdx got a new clickable
6-category tradeoff rehearsal tool. system-design-practice.mdx,
behavioral.mdx, knowledge-qa-strategy.mdx intentionally skipped (pure
advice, no technical content to visualize).

**agents/multi-agent-systems.mdx** — complete (bonus item from
coordinator). Reused CoordinationPatternsDiagram (already existed,
built for this exact page per its own doc comment, was living on
agents/overview.mdx) + new real greedy-scheduling parallel-speedup sim.

## Status: sole owner of platform-vite content (ad and 91 pivoted to other departments)

Original queue (above) shipped and signed off. Self-QA pass done (code-level
+ server-level; browser-extension-dependent checks -- both-theme render,
console, mobile -- still blocked by a Chrome extension connection failure,
retrying opportunistically). Found and fixed one unrelated CI-blocking
TS6133 in ClipDualEncoderDiagram.tsx (not mine), pushed as 80e981a.

**Handoff batch from ad/91, all shipped** (7 pages):
- deep-learning/training-deep-networks.mdx -- 4 diagrams, all reused
- deep-learning/generative-models.mdx -- 2 new (GanMinimaxDiagram,
  DiffusionForwardProcessDiagram) + new lib src/viz/lib/generativeModels.ts
- llms-genai/prompt-engineering.mdx -- 2 new (SelfConsistencyVotingDiagram,
  LostInTheMiddleDiagram) + 1 reused
- llms-genai/multimodal-generative-models.mdx -- 1 new
  (AutoregressiveVsDiffusionGenerationDiagram) + 2 reused
- llms-genai/evaluation-and-serving.mdx -- 4 diagrams, all reused
- databases/relational/overview.mdx -- 1 new (IndexScanComparisonDiagram)
  + 2 reused
- agents/agent-architectures.mdx -- 1 new (HumanInTheLoopDiagram) + 3 reused

A pre-handoff survey found most of the "older unfinished scope" list ad
flagged was already done by someone (databases/ 4-of-6, ml-system-design/
all 5, llms-genai/overview+training-pipeline, agents/overview+
agent-fundamentals, agents/a2a/overview) -- only the 2 above were actually
open. Worth re-verifying state before assuming a list is current, next time.

Remaining known page-level TODOs (not mine, don't touch): python-engineering/,
cs-fundamentals/ (platform-vite-91, though 91 has now pivoted -- may be
unowned, don't touch without checking). roadmaps/suggested-paths.mdx,
resources/open-source-ai-resources.mdx, projects/the-project-ladder.mdx,
and all `*/roadmap.mdx` pages (databases, llms-genai, agents) were checked
and judged nav/list content, not deep-dive material -- fine as-is.

Still open: sitewide regression sweep (sidebar collapse/watermark/console/
mobile across sections other sessions touched) -- not started, blocked on
Chrome extension connectivity for the visual parts.

Feedback applied going forward: for well-known concepts, check for a
known-good reference visualization/paper figure first and adapt its
structure rather than designing from a blank page (still re-skinned to
this platform's diagramSystem tokens always).

## Working pattern (keep doing this)

- Read the mdx page fully before planning diagrams.
- 1 diagram per page for individual family-member deep-dives; more (4-8) for
  flagship/foundational pages. Scale to the page's role, not a fixed count.
- Every diagram computes real values live (no decorative placeholders) —
  reuse shared lib math within a family where it fits.
- `npx tsc -b 2>&1 | grep -E "MyFile1|MyFile2"` — narrow typecheck, not full dump.
- Verify via dev server (`npm run dev`, curl the diagram .tsx and the .mdx page
  for 200s), not a `dist/` build — other sessions' concurrent builds can race it.
- `git commit -m "..." -- <explicit paths>` always — never bare `git commit`,
  it can sweep up another session's staged concurrent WIP.
- Checkpoint-commit + update this file at natural stopping points.
