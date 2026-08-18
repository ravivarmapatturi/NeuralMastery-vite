// A small, dependency-free attention engine for the Attention Step-Through
// visualization. Deliberately simplified in one specific, clearly-labeled
// way: tokenization here is whitespace/punctuation-level, not real subword
// BPE -- adding a full BPE vocabulary/merge table would be the single
// biggest bundle-size cost of this component for a detail that isn't what
// this visualization is actually teaching (attention mechanics, not
// tokenization specifically). Embeddings and Q/K/V projection weights are
// deterministically seeded pseudo-random vectors/matrices (not trained) --
// real enough to show the actual QKV -> scores -> softmax -> weighted-sum
// computation with real numbers, not real enough to claim any linguistic
// meaning in the result.

export interface AttentionHead {
  Wq: number[][];
  Wk: number[][];
  Wv: number[][];
}

export interface AttentionResult {
  embeddings: number[][];
  Q: number[][];
  K: number[][];
  V: number[][];
  scores: number[][];
  weights: number[][];
  output: number[][];
}

export function tokenize(text: string): string[] {
  const matches: string[] = text.match(/[\w']+|[.,!?;]/g) ?? [];
  return matches.slice(0, 12);
}

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DIM = 4;

/** A deterministic pseudo-embedding for a token: same word -> same vector. */
export function embed(token: string): number[] {
  const rand = mulberry32(hashString(token.toLowerCase()));
  return Array.from({ length: DIM }, () => rand() * 2 - 1);
}

function randMatrix(rows: number, cols: number, seed: number): number[][] {
  const rand = mulberry32(seed);
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() * 2 - 1) * 0.6));
}

/** One attention head's fixed (untrained, seeded) Q/K/V projection weights. */
export function makeHead(seed: number): AttentionHead {
  return {
    Wq: randMatrix(DIM, DIM, seed * 3 + 1),
    Wk: randMatrix(DIM, DIM, seed * 3 + 2),
    Wv: randMatrix(DIM, DIM, seed * 3 + 3),
  };
}

function matVec(W: number[][], v: number[]): number[] {
  return W.map((row) => row.reduce((s, w, i) => s + w * v[i], 0));
}
function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}
function softmax(xs: number[]): number[] {
  const m = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Runs one attention head over a token sequence.
 * Returns { Q, K, V, scores, weights, output } where `weights[i]` is the
 * softmax attention distribution for query token i over all key tokens.
 */
export function runAttention(tokens: string[], head: AttentionHead): AttentionResult {
  const embeddings = tokens.map(embed);
  const Q = embeddings.map((e) => matVec(head.Wq, e));
  const K = embeddings.map((e) => matVec(head.Wk, e));
  const V = embeddings.map((e) => matVec(head.Wv, e));
  const scale = Math.sqrt(DIM);

  const scores = Q.map((q) => K.map((k) => dot(q, k) / scale));
  const weights = scores.map(softmax);
  const output = weights.map((w) => V[0].map((_, d) => w.reduce((s, wij, j) => s + wij * V[j][d], 0)));

  return { embeddings, Q, K, V, scores, weights, output };
}
