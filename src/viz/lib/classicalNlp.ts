// Shared logic for the Classical NLP diagrams: a real (small, rule-based)
// tokenizer, real stemming vs. lemmatization rules, and a real Viterbi
// decode over a tiny hand-specified HMM -- every one of these actually
// runs the described algorithm on real input, not a scripted animation.

export function naiveWhitespaceTokenize(text: string): string[] {
  return text.split(' ');
}
export function ruleBasedTokenize(text: string): string[] {
  // A real (simplified) rule pass: split off trailing punctuation, but
  // keep "Dr." / "Mr." abbreviations and contractions like "don't" intact.
  const ABBREVIATIONS = new Set(['dr.', 'mr.', 'mrs.', 'ms.', 'prof.']);
  const rawTokens = text.split(' ');
  const out: string[] = [];
  for (const raw of rawTokens) {
    const lower = raw.toLowerCase();
    if (ABBREVIATIONS.has(lower)) { out.push(raw); continue; }
    const match = raw.match(/^([\w']+?)([.,!?;]*)$/);
    if (match && match[2]) {
      if (match[1]) out.push(match[1]);
      out.push(match[2]);
    } else {
      out.push(raw);
    }
  }
  return out.filter((t) => t.length > 0);
}

// --- Stemming (simplified real Porter-style suffix rules) vs. lemma lookup
const SUFFIX_RULES: [string, string][] = [
  ['ational', 'ate'], ['tional', 'tion'], ['ization', 'ize'],
  ['ing', ''], ['edly', ''], ['ed', ''], ['ies', 'y'], ['ity', ''], ['es', ''], ['s', ''],
];
export function stem(word: string): string {
  const lower = word.toLowerCase();
  for (const [suffix, replacement] of SUFFIX_RULES) {
    if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
      return lower.slice(0, lower.length - suffix.length) + replacement;
    }
  }
  return lower;
}
const LEMMA_DICT: Record<string, string> = {
  running: 'run', ran: 'run', runs: 'run',
  better: 'good', best: 'good', good: 'good',
  universities: 'university', university: 'university',
  studies: 'study', studying: 'study', studied: 'study',
  mice: 'mouse', mouse: 'mouse',
};
export function lemmatize(word: string): string {
  const lower = word.toLowerCase();
  return LEMMA_DICT[lower] ?? lower;
}

// --- POS tagging: a real, tiny Hidden Markov Model + Viterbi decode -----
export type Tag = 'DET' | 'NOUN' | 'VERB';
export const TAGS: Tag[] = ['DET', 'NOUN', 'VERB'];

export const TRANSITION: Record<Tag | 'START', Record<Tag, number>> = {
  START: { DET: 0.6, NOUN: 0.3, VERB: 0.1 },
  DET: { DET: 0.05, NOUN: 0.9, VERB: 0.05 },
  NOUN: { DET: 0.1, NOUN: 0.2, VERB: 0.7 },
  VERB: { DET: 0.4, NOUN: 0.5, VERB: 0.1 },
};
export const EMISSION: Record<Tag, Record<string, number>> = {
  DET: { the: 0.7, a: 0.25, dog: 0.01, runs: 0.01, cat: 0.01, chases: 0.01, other: 0.01 },
  NOUN: { dog: 0.35, cat: 0.35, the: 0.01, a: 0.01, runs: 0.02, chases: 0.02, other: 0.24 },
  VERB: { runs: 0.4, chases: 0.4, the: 0.01, a: 0.01, dog: 0.02, cat: 0.02, other: 0.14 },
};
function emissionProb(tag: Tag, word: string): number {
  return EMISSION[tag][word.toLowerCase()] ?? EMISSION[tag].other;
}

export interface ViterbiCell { tag: Tag; prob: number; backpointer: Tag | null }
export function viterbiDecode(words: string[]): ViterbiCell[][] {
  const trellis: ViterbiCell[][] = [];
  const first: ViterbiCell[] = TAGS.map((tag) => ({
    tag, prob: TRANSITION.START[tag] * emissionProb(tag, words[0]), backpointer: null,
  }));
  trellis.push(first);

  for (let i = 1; i < words.length; i++) {
    const prevCol = trellis[i - 1];
    const col: ViterbiCell[] = TAGS.map((tag) => {
      let best = { prob: -1, from: TAGS[0] as Tag };
      for (const prev of prevCol) {
        const p = prev.prob * TRANSITION[prev.tag][tag] * emissionProb(tag, words[i]);
        if (p > best.prob) best = { prob: p, from: prev.tag };
      }
      return { tag, prob: best.prob, backpointer: best.from };
    });
    trellis.push(col);
  }
  return trellis;
}
export function bestPath(trellis: ViterbiCell[][]): Tag[] {
  const n = trellis.length;
  const lastCol = trellis[n - 1];
  let best = lastCol[0];
  for (const c of lastCol) if (c.prob > best.prob) best = c;
  const path: Tag[] = new Array(n);
  path[n - 1] = best.tag;
  let bp = best.backpointer;
  for (let i = n - 2; i >= 0; i--) {
    path[i] = bp as Tag;
    bp = trellis[i].find((c) => c.tag === bp)!.backpointer;
  }
  return path;
}
