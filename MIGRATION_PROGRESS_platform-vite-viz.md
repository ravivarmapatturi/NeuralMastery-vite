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

## Status: full queue complete

Everything assigned across this session is shipped: original 7-section
assignment, mathematics-for-ai/ (4 pages), machine-learning/ (20 pages),
ai-for-science/, domain-applications/, frameworks/, build-from-scratch/,
research-engineering/, interview-prep/, agents/multi-agent-systems.mdx.
Checked in with coordinator for further assignment or sign-off.

Remaining known page-level TODOs (not mine, don't touch): python-engineering/,
cs-fundamentals/ (platform-vite-91). roadmaps/suggested-paths.mdx,
resources/open-source-ai-resources.mdx, projects/the-project-ladder.mdx were
checked and judged nav/list content, not deep-dive material -- fine as-is.

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
