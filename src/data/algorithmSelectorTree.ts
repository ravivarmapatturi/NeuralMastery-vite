// A real branching decision tree over this site's own ML pages -- inspired
// by tatwan.github.io's static "Algorithm Selector" decision tool (the most
// differentiated single idea found across six competitor sites researched),
// but built as an actual interactive component rather than a static image.
// Every leaf links to a real page on this site.

export interface TreeOption {
  label: string;
  next?: string;
  result?: string;
}

export interface TreeNode {
  question: string;
  options: TreeOption[];
}

export interface ResultEntry {
  label: string;
  href: string;
  reason: string;
}

export const TREE: Record<string, TreeNode> = {
  root: {
    question: 'What kind of problem are you solving?',
    options: [
      { label: 'Predict a number (regression)', next: 'reg1' },
      { label: 'Predict a category (classification)', next: 'clf1' },
      { label: 'Find groups in unlabeled data (clustering)', next: 'clu1' },
      { label: 'Reduce/compress the number of features', next: 'dimred' },
    ],
  },

  reg1: {
    question: 'Is the relationship between your features and target roughly linear?',
    options: [
      { label: 'Yes, roughly linear', next: 'reg2' },
      { label: 'No / not sure, or I need maximum accuracy', next: 'reg3' },
    ],
  },
  reg2: {
    question: 'Do you have many correlated features, or want automatic feature selection?',
    options: [
      { label: 'Not really — features are mostly independent', result: 'linear-regression' },
      { label: 'Yes, several features are correlated', result: 'ridge-regression' },
      { label: 'Yes, and I want irrelevant ones dropped automatically', result: 'lasso-regression' },
    ],
  },
  reg3: {
    question: 'Do you need the model to be interpretable (explain individual predictions)?',
    options: [
      { label: 'Yes, interpretability matters', result: 'decision-tree' },
      { label: 'No, I care most about raw accuracy', result: 'xgboost-lightgbm-catboost' },
    ],
  },

  clf1: {
    question: 'What does your input data look like?',
    options: [
      { label: 'Structured / tabular features', next: 'clfTabular1' },
      { label: 'Text, images, audio, or other unstructured data', result: 'neural-network-fundamentals-deep-learning' },
    ],
  },
  clfTabular1: {
    question: 'Is the relationship roughly linear and you have limited data?',
    options: [
      { label: 'Yes', result: 'logistic-regression' },
      { label: 'No — complex patterns, or plenty of data', next: 'clfTabular2' },
    ],
  },
  clfTabular2: {
    question: 'Do you need the model to be interpretable?',
    options: [
      { label: 'Yes, interpretability matters', result: 'decision-tree' },
      { label: 'No, want the best accuracy on tabular data', result: 'xgboost-lightgbm-catboost' },
    ],
  },

  clu1: {
    question: 'Do you know roughly how many clusters to expect?',
    options: [
      { label: 'Yes, I have a good estimate', result: 'kmeans-hierarchical-clustering' },
      { label: 'No', next: 'clu2' },
    ],
  },
  clu2: {
    question: 'Do you expect irregularly-shaped clusters, or need to detect outlier/noise points?',
    options: [
      { label: 'Yes', result: 'dbscan-hdbscan' },
      { label: 'No, roughly round/blob-shaped clusters', result: 'kmeans-hierarchical-clustering' },
    ],
  },

  dimred: {
    question: "What's the goal?",
    options: [
      { label: 'Compress features for a downstream model / remove noise', result: 'pca-svd' },
      { label: 'Visualize high-dimensional data in 2D/3D', result: 'ica-tsne-umap' },
    ],
  },
};

export const RESULTS: Record<string, ResultEntry> = {
  'linear-regression': {
    label: 'Linear Regression',
    href: '/docs/machine-learning/linear-regression',
    reason: 'The right default for a roughly linear relationship with independent features — simplest model that fits, easiest to interpret.',
  },
  'ridge-regression': {
    label: 'Ridge Regression',
    href: '/docs/machine-learning/ridge-regression',
    reason: 'Penalizes large weights to stabilize coefficients when features are correlated, without dropping any of them.',
  },
  'lasso-regression': {
    label: 'Lasso Regression',
    href: '/docs/machine-learning/lasso-regression',
    reason: 'The L1 penalty drives irrelevant coefficients to exactly zero — automatic feature selection built into training.',
  },
  'decision-tree': {
    label: 'Decision Tree',
    href: '/docs/machine-learning/decision-tree',
    reason: 'A sequence of readable if/else rules — the most directly interpretable model on this list.',
  },
  'xgboost-lightgbm-catboost': {
    label: 'Gradient Boosting (XGBoost / LightGBM / CatBoost)',
    href: '/docs/machine-learning/xgboost-lightgbm-catboost',
    reason: 'The practical default for best accuracy on tabular data — wins the large majority of tabular ML competitions and production benchmarks.',
  },
  'logistic-regression': {
    label: 'Logistic Regression',
    href: '/docs/machine-learning/logistic-regression',
    reason: 'A strong, fast, well-calibrated baseline for linearly-separable classification, especially with limited data.',
  },
  'neural-network-fundamentals-deep-learning': {
    label: 'Neural Networks',
    href: '/docs/deep-learning/neural-network-fundamentals',
    reason: 'Unstructured data (text/images/audio) needs learned feature representations — hand-crafted tabular features don’t apply.',
  },
  'kmeans-hierarchical-clustering': {
    label: 'K-Means / Hierarchical Clustering',
    href: '/docs/machine-learning/kmeans-hierarchical-clustering',
    reason: 'K-Means when you have a cluster-count estimate and expect round clusters; hierarchical when you want a dendrogram instead of committing to k upfront.',
  },
  'dbscan-hdbscan': {
    label: 'DBSCAN / HDBSCAN',
    href: '/docs/machine-learning/dbscan-hdbscan',
    reason: "Density-based clustering finds irregularly-shaped clusters and naturally labels outliers as noise — K-Means can't do either.",
  },
  'pca-svd': {
    label: 'PCA / SVD',
    href: '/docs/machine-learning/pca-svd',
    reason: 'The standard linear dimensionality-reduction tool for compression, noise reduction, or feeding a downstream model fewer, decorrelated features.',
  },
  'ica-tsne-umap': {
    label: 't-SNE / UMAP',
    href: '/docs/machine-learning/ica-tsne-umap',
    reason: 'Nonlinear projections built specifically for 2D/3D visualization — PCA often collapses interesting structure that these preserve.',
  },
};
