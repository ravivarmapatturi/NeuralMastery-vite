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

## Next up

Check in with coordinator for next assignment. Queued list as of last sync:
ai-for-science, domain-applications, frameworks, build-from-scratch,
research-engineering — python-engineering/cs-fundamentals went to another
session (platform-vite-91), do not touch.

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
