// BM25's term-frequency saturation term, extracted from
// Bm25ScoringDiagram.tsx so it can be unit-tested in isolation. This is
// only the tf-saturation piece of full BM25 (no IDF or document-length
// normalization) -- what the diagram actually visualizes.

/** Standard default term-frequency saturation constant. */
export const BM25_DEFAULT_K1 = 1.5;

/** (k1+1)*tf / (k1+tf) -- climbs toward a ceiling of k1+1 as tf grows, the
 * correction that stops a document from scoring proportionally higher just
 * for repeating a term many times. */
export function bm25TermFrequencySaturation(tf: number, k1: number = BM25_DEFAULT_K1): number {
  return ((k1 + 1) * tf) / (k1 + tf);
}
