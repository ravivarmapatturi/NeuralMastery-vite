// A small, dependency-free retrieval engine for the RAG Pipeline Simulator.
// Real (if simplified) retrieval mechanics: actual fixed-size chunking,
// actual bag-of-words vectors, actual cosine similarity ranking, and an
// actual (differently-weighted) reranking pass -- not a scripted animation.
// The corpus below is a handful of short passages covering distinct ML
// topics, so different queries genuinely retrieve different chunks.

export const CORPUS: string[] = [
  `Linear regression fits a straight line through data by minimizing the sum of squared errors between predictions and actual values. The optimal weights have a closed-form solution using the normal equations, derived by setting the gradient of the loss to zero.`,
  `Gradient descent updates parameters by stepping in the direction opposite the gradient of the loss function. The learning rate controls step size: too large causes divergence or oscillation, too small makes training painfully slow to converge.`,
  `Overfitting happens when a model memorizes training data instead of learning generalizable patterns, performing well on training data but poorly on new, unseen examples. Regularization techniques like L1 and L2 penalties help control this by constraining model complexity.`,
  `A decision tree splits data recursively based on feature thresholds that maximize information gain or minimize Gini impurity at each node. Random forests train many decision trees on bootstrapped samples and average their predictions to reduce variance.`,
  `Convolutional neural networks apply learned filters across an image, detecting local patterns like edges in early layers and increasingly abstract features in deeper layers. Pooling layers downsample feature maps to reduce spatial dimensions and add translation invariance.`,
  `Self-attention lets every token in a sequence directly attend to every other token by computing Query, Key, and Value projections. Attention scores are the scaled dot product of Query and Key vectors, passed through softmax to produce weights over the Value vectors.`,
  `The KV cache stores previously computed Key and Value vectors during autoregressive text generation, avoiding redundant recomputation at each new token. This is the single biggest practical speedup in LLM inference and the primary consumer of GPU memory during generation.`,
  `Retrieval-augmented generation retrieves relevant text chunks from an external knowledge base and feeds them into an LLM's context alongside the user's query, grounding the generated answer in retrieved content rather than relying solely on the model's frozen training-time knowledge.`,
];

export interface Chunk {
  id: string;
  text: string;
}

export interface ScoredChunk extends Chunk {
  score: number;
}

export interface RerankedChunk extends ScoredChunk {
  rerankScore: number;
}

function tokenize(text: string): string[] {
  const matches: string[] = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  return matches.filter((w) => w.length > 2);
}

/** Fixed-size chunking by word count, matching chunkSize -- too small loses context, too large dilutes specificity. */
export function chunkCorpus(chunkSize: number): Chunk[] {
  const chunks: Chunk[] = [];
  CORPUS.forEach((doc, docIdx) => {
    const words = doc.split(/\s+/);
    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize);
      if (slice.length < 4) continue; // drop tiny trailing fragments
      chunks.push({ id: `${docIdx}-${i}`, text: slice.join(' ') });
    }
  });
  return chunks;
}

function bagOfWords(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  tokenize(text).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  return counts;
}

function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  a.forEach((v, k) => {
    na += v * v;
    if (b.has(k)) dot += v * (b.get(k) as number);
  });
  b.forEach((v) => {
    nb += v * v;
  });
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Dense-retrieval stand-in: rank chunks by bag-of-words cosine similarity to the query. */
export function retrieve(query: string, chunks: Chunk[], topK: number): ScoredChunk[] {
  const qVec = bagOfWords(query);
  const scored: ScoredChunk[] = chunks.map((c) => ({ ...c, score: cosineSim(qVec, bagOfWords(c.text)) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Reranker stand-in: a cross-encoder-style pass that also rewards exact
 * substring/phrase overlap (not just bag-of-words), which is exactly the
 * kind of precision a real cross-encoder adds over a bi-encoder's fast but
 * coarser first pass.
 */
export function rerank(query: string, results: ScoredChunk[]): RerankedChunk[] {
  const qWords = tokenize(query);
  return results
    .map((r) => {
      const text = r.text.toLowerCase();
      let phraseBonus = 0;
      for (let n = Math.min(3, qWords.length); n >= 2; n--) {
        for (let i = 0; i + n <= qWords.length; i++) {
          if (text.includes(qWords.slice(i, i + n).join(' '))) phraseBonus += 0.15;
        }
      }
      return { ...r, rerankScore: r.score + phraseBonus };
    })
    .sort((a, b) => b.rerankScore - a.rerankScore);
}
