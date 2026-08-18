// A small, hand-authored vocabulary with structured (not randomly trained)
// vectors -- there's no real word2vec/GloVe model running in the browser --
// but cosine similarity, nearest-neighbor lookup, vector-arithmetic analogy,
// and the 2D PCA projection used to plot them are all real, computed live.

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

export const CATEGORIES = ['royalty', 'people', 'animals', 'tech', 'food', 'weather', 'emotion', 'transport'];

const WORDS: [string, string, number][] = [
  ['king', 'royalty', 1],
  ['queen', 'royalty', -1],
  ['man', 'people', 1],
  ['woman', 'people', -1],
  ['boy', 'people', 1],
  ['girl', 'people', -1],
  ['father', 'people', 1],
  ['mother', 'people', -1],
  ['duke', 'people', 1],
  ['duchess', 'people', -1],
  ['dog', 'animals', 0],
  ['cat', 'animals', 0],
  ['wolf', 'animals', 0],
  ['lion', 'animals', 0],
  ['eagle', 'animals', 0],
  ['dolphin', 'animals', 0],
  ['computer', 'tech', 0],
  ['algorithm', 'tech', 0],
  ['network', 'tech', 0],
  ['robot', 'tech', 0],
  ['software', 'tech', 0],
  ['internet', 'tech', 0],
  ['pizza', 'food', 0],
  ['bread', 'food', 0],
  ['apple', 'food', 0],
  ['coffee', 'food', 0],
  ['cheese', 'food', 0],
  ['rice', 'food', 0],
  ['rain', 'weather', 0],
  ['snow', 'weather', 0],
  ['sunshine', 'weather', 0],
  ['storm', 'weather', 0],
  ['wind', 'weather', 0],
  ['fog', 'weather', 0],
  ['joy', 'emotion', 0],
  ['anger', 'emotion', 0],
  ['fear', 'emotion', 0],
  ['sadness', 'emotion', 0],
  ['hope', 'emotion', 0],
  ['calm', 'emotion', 0],
  ['car', 'transport', 0],
  ['train', 'transport', 0],
  ['bicycle', 'transport', 0],
  ['airplane', 'transport', 0],
  ['ship', 'transport', 0],
  ['bus', 'transport', 0],
];

const CATEGORY_SCALE = 3;
const GENDER_SCALE = 1.5;
const JITTER_SCALE = 0.4;

function embedWord(word: string, category: string, gender: number): number[] {
  const rand = mulberry32(hashString(word));
  const vec: number[] = CATEGORIES.map((c) => (c === category ? CATEGORY_SCALE : 0));
  vec.push(gender * GENDER_SCALE);
  vec.push((rand() - 0.5) * 2 * JITTER_SCALE);
  vec.push((rand() - 0.5) * 2 * JITTER_SCALE);
  return vec;
}

export interface VocabEntry {
  word: string;
  category: string;
  vector: number[];
}

export const VOCAB: VocabEntry[] = WORDS.map(([word, category, gender]) => ({
  word,
  category,
  vector: embedWord(word, category, gender),
}));

export function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface SimResult {
  word: string;
  sim: number;
}

export function nearestNeighbors(word: string, k = 5): SimResult[] {
  const target = VOCAB.find((v) => v.word === word);
  if (!target) return [];
  return VOCAB.filter((v) => v.word !== word)
    .map((v) => ({ word: v.word, sim: cosineSim(target.vector, v.vector) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k);
}

/** D = A - B + C in vector space; returns the closest word(s) to D, excluding A/B/C. */
export function analogy(a: string, b: string, c: string, k = 3): SimResult[] {
  const va = VOCAB.find((v) => v.word === a)?.vector;
  const vb = VOCAB.find((v) => v.word === b)?.vector;
  const vc = VOCAB.find((v) => v.word === c)?.vector;
  if (!va || !vb || !vc) return [];
  const target = va.map((_, i) => va[i] - vb[i] + vc[i]);
  return VOCAB.filter((v) => ![a, b, c].includes(v.word))
    .map((v) => ({ word: v.word, sim: cosineSim(target, v.vector) }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, k);
}

// --- Real PCA (power iteration + deflation) down to 2D, for the scatter plot ---

function mean(vectors: number[][]): number[] {
  const d = vectors[0].length;
  const m = new Array(d).fill(0);
  vectors.forEach((v) => v.forEach((x, i) => { m[i] += x / vectors.length; }));
  return m;
}

function covarianceMatrix(centered: number[][]): number[][] {
  const d = centered[0].length;
  const cov: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  centered.forEach((v) => {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += (v[i] * v[j]) / centered.length;
      }
    }
  });
  return cov;
}

function matVec(M: number[][], v: number[]): number[] {
  return M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
}

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

function powerIteration(M: number[][], iterations = 60, seed = 1): number[] {
  const rand = mulberry32(seed);
  let v = normalize(M.map(() => rand() - 0.5));
  for (let i = 0; i < iterations; i++) {
    v = normalize(matVec(M, v));
  }
  return v;
}

function deflate(M: number[][], v: number[], eigenvalue: number): number[][] {
  const d = M.length;
  const out: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      out[i][j] = M[i][j] - eigenvalue * v[i] * v[j];
    }
  }
  return out;
}

export function pca2D(vocab: VocabEntry[]): [number, number][] {
  const vectors = vocab.map((v) => v.vector);
  const m = mean(vectors);
  const centered = vectors.map((v) => v.map((x, i) => x - m[i]));
  const cov = covarianceMatrix(centered);

  const v1 = powerIteration(cov, 60, 1);
  const eigenvalue1 = dot(matVec(cov, v1), v1);
  const covDeflated = deflate(cov, v1, eigenvalue1);
  const v2 = powerIteration(covDeflated, 60, 2);

  return centered.map((c) => [dot(c, v1), dot(c, v2)]);
}
