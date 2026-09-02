// Late-interaction (ColBERT-style) MaxSim scoring: for each query token,
// the single highest-similarity doc token (real per-token dot products, no
// pooling), summed across query tokens. Extracted from
// MaxSimWorkedExample.tsx so the computation can be unit-tested in
// isolation from the diagram's rendering.

export type Matrix = number[][];

export interface MaxSimResult {
  similarityMatrix: Matrix;
  maxSims: number[];
  maxIndices: number[];
  score: number;
}

export function computeMaxSim(Q: Matrix, D: Matrix): MaxSimResult {
  const similarityMatrix = Q.map((qRow) => D.map((dRow) => qRow.reduce((sum, qv, i) => sum + qv * dRow[i], 0)));
  const maxSims = similarityMatrix.map((row) => Math.max(...row));
  const maxIndices = similarityMatrix.map((row) => row.indexOf(Math.max(...row)));
  const score = maxSims.reduce((a, b) => a + b, 0);
  return { similarityMatrix, maxSims, maxIndices, score };
}

// The worked-example's toy per-token embeddings, small enough to verify by
// hand. Each row is (loosely) one semantic axis so the story is visible in
// the raw numbers: d1~animal, d2~action/verb, d3~furniture/object,
// d4~function-word. Shared by the diagram component and its tests so both
// stay in sync with the exact numbers described in
// retrieval-and-reranking-architectures.mdx.
export const MAXSIM_EXAMPLE_QUERY_TOKENS = ['cat', 'sat', 'mat'];
export const MAXSIM_EXAMPLE_DOC_TOKENS = ['the', 'cat', 'was', 'on', 'mat'];
export const MAXSIM_EXAMPLE_DIM_LABELS = ['d1', 'd2', 'd3', 'd4'];

export const MAXSIM_EXAMPLE_Q: Matrix = [
  [1, 0, 0, 0], // cat
  [0.2, 0.8, 0, 0], // sat -- mostly "action", a little "animal-agent"
  [0, 0, 1, 0], // mat
];
export const MAXSIM_EXAMPLE_D: Matrix = [
  [0, 0, 0, 1], // the
  [1, 0, 0, 0], // cat
  [0, 1, 0, 0], // was
  [0, 0, 0, 1], // on
  [0, 0, 1, 0], // mat
];
