// Shared logic for the NLP Task Taxonomy diagrams: a real bag-of-words
// sentiment scorer, real n-gram BLEU precision, and a real softmax over
// toy span-prediction logits for extractive QA.

export const SENTIMENT_WEIGHTS: Record<string, number> = {
  great: 2.2, amazing: 2.5, good: 1.2, love: 2.0, excellent: 2.3,
  terrible: -2.4, bad: -1.2, awful: -2.2, hate: -2.0, boring: -1.5,
  not: -0.8, but: -0.3,
};
export function sigmoid(z: number): number { return 1 / (1 + Math.exp(-z)); }
export function bagOfWordsScore(sentence: string): { score: number; probability: number; contributions: { word: string; weight: number }[] } {
  const words = sentence.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  const contributions = words.map((w) => ({ word: w, weight: SENTIMENT_WEIGHTS[w] ?? 0 }));
  const score = contributions.reduce((s, c) => s + c.weight, 0);
  return { score, probability: sigmoid(score), contributions };
}

// --- Real n-gram precision (a simplified, unigram+bigram BLEU) ---------
function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}
export function ngramPrecision(candidate: string, reference: string, n: number): number {
  const candTokens = candidate.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  const refTokens = reference.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  const candGrams = ngrams(candTokens, n);
  const refGrams = ngrams(refTokens, n);
  if (candGrams.length === 0) return 0;
  const refCounts = new Map<string, number>();
  for (const g of refGrams) refCounts.set(g, (refCounts.get(g) ?? 0) + 1);
  let matches = 0;
  for (const g of candGrams) {
    const remaining = refCounts.get(g) ?? 0;
    if (remaining > 0) { matches++; refCounts.set(g, remaining - 1); }
  }
  return matches / candGrams.length;
}
export function simpleBleu(candidate: string, reference: string): number {
  const p1 = ngramPrecision(candidate, reference, 1);
  const p2 = ngramPrecision(candidate, reference, 2);
  if (p1 === 0 || p2 === 0) return 0;
  return Math.sqrt(p1 * p2); // geometric mean of unigram+bigram precision, BLEU's real core idea
}

// --- Extractive QA: real softmax over toy start/end logits --------------
export function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
export function argmax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
  return best;
}
