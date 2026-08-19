// Real, live-computed numbers for the Attention & Transformers page's
// worked example -- 3 tokens ("The cat sat"), d_model = 4, one head.
// Computed once at module load via plain matrix arithmetic (not hand-picked
// to look nice, not a screenshot of someone else's numpy run) so the
// worked-example visualization and the surrounding prose's specific number
// callouts stay honestly in sync with what this file actually computes.
export const TOKENS = ['The', 'cat', 'sat'];

const X = [
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 1, 2, 2],
];
const Wq = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];
const Wk = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];
const Wv = [
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [1, 0, 0, 1],
];

function matmul(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const m = B[0].length;
  const k = B.length;
  const out = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let x = 0; x < k; x++) out[i][j] += A[i][x] * B[x][j];
  return out;
}
function transpose(A: number[][]): number[][] {
  return A[0].map((_, c) => A.map((r) => r[c]));
}
function softmaxRow(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

export const D_K = 4;
export const SCALE = Math.sqrt(D_K);

export const EMBEDDINGS = X;
export const Q = matmul(X, Wq);
export const K = matmul(X, Wk);
export const V = matmul(X, Wv);
export const RAW_SCORES = matmul(Q, transpose(K));
export const SCALED_SCORES = RAW_SCORES.map((r) => r.map((v) => v / SCALE));
export const ATTENTION_WEIGHTS = SCALED_SCORES.map(softmaxRow);
export const ATTENTION_WEIGHTS_UNSCALED = RAW_SCORES.map(softmaxRow);
export const OUTPUT = matmul(ATTENTION_WEIGHTS, V);
