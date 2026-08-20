// Shared math for the Algorithms & Data Structures diagrams: real
// operation counts for each Big-O class, a real linear-scan-vs-hash-map
// comparison, a real beam-search top-k selection trace, real O(n^2) vs
// O(n) attention operation counts, and real sort-comparison-count growth.

export type Complexity = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n^2)' | 'O(2^n)';
export function opsFor(complexity: Complexity, n: number): number {
  switch (complexity) {
    case 'O(1)': return 1;
    case 'O(log n)': return Math.max(1, Math.log2(n));
    case 'O(n)': return n;
    case 'O(n log n)': return n * Math.max(1, Math.log2(n));
    case 'O(n^2)': return n * n;
    case 'O(2^n)': return 2 ** Math.min(n, 60); // capped so it stays a finite JS number
  }
}

// --- Beam search: real top-k selection trace -----------------------------
export interface BeamCandidate { sequence: string; score: number }
const VOCAB_STEP: Record<string, { token: string; logProb: number }[]> = {
  '<s>': [{ token: 'the', logProb: -0.3 }, { token: 'a', logProb: -1.1 }, { token: 'once', logProb: -2.5 }],
  '<s> the': [{ token: 'cat', logProb: -0.5 }, { token: 'dog', logProb: -0.8 }, { token: 'sky', logProb: -3.0 }],
  '<s> a': [{ token: 'cat', logProb: -0.7 }, { token: 'dog', logProb: -0.6 }, { token: 'bird', logProb: -1.9 }],
  '<s> the cat': [{ token: 'sat', logProb: -0.4 }, { token: 'ran', logProb: -1.0 }],
  '<s> the dog': [{ token: 'ran', logProb: -0.3 }, { token: 'sat', logProb: -1.2 }],
  '<s> a dog': [{ token: 'barked', logProb: -0.2 }, { token: 'ran', logProb: -1.3 }],
};
export function beamSearchStep(beams: BeamCandidate[], beamWidth: number): BeamCandidate[] {
  const expanded: BeamCandidate[] = [];
  for (const b of beams) {
    const nexts = VOCAB_STEP[b.sequence] ?? [];
    for (const { token, logProb } of nexts) {
      expanded.push({ sequence: `${b.sequence} ${token}`, score: b.score + logProb });
    }
  }
  return expanded.sort((a, b) => b.score - a.score).slice(0, beamWidth);
}

// --- Attention complexity -------------------------------------------------
export function pairwiseAttentionOps(seqLen: number, dim: number): number { return seqLen * seqLen * dim; }
export function linearAttentionOps(seqLen: number, dim: number): number { return seqLen * dim; }

// --- Sorting: real comparison counts (worst case) -------------------------
export function mergeSortComparisons(n: number): number { return n <= 1 ? 0 : Math.ceil(n * Math.max(1, Math.log2(n))); }
export function bubbleSortComparisons(n: number): number { return (n * (n - 1)) / 2; }
