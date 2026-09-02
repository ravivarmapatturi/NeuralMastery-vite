import { describe, expect, it } from 'vitest'
import {
  ATTENTION_WEIGHTS,
  ATTENTION_WEIGHTS_UNSCALED,
  D_K,
  K,
  OUTPUT,
  Q,
  RAW_SCORES,
  SCALE,
  SCALED_SCORES,
  TOKENS,
  V,
} from './attentionWorkedExample'

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0)
}

describe('attentionWorkedExample (3 tokens, d_model=4, one head)', () => {
  it('has one Q/K/V row per token', () => {
    expect(Q).toHaveLength(TOKENS.length)
    expect(K).toHaveLength(TOKENS.length)
    expect(V).toHaveLength(TOKENS.length)
  })

  it('RAW_SCORES matches the exact hand-computed Q.K^T for this worked example', () => {
    // Hand-verified from Wq=identity, Wk/Wv as declared in the source module:
    // Q = X (Wq is the identity matrix), K computed via Wk against X=[[1,0,1,1],[1,1,0,1],[0,1,2,2]].
    expect(RAW_SCORES).toEqual([
      [4, 4, 5],
      [3, 4, 3],
      [6, 7, 11],
    ])
  })

  it('every RAW_SCORES entry is the real dot product of the corresponding Q and K rows', () => {
    for (let i = 0; i < Q.length; i++) {
      for (let j = 0; j < K.length; j++) {
        expect(RAW_SCORES[i][j]).toBeCloseTo(dot(Q[i], K[j]), 10)
      }
    }
  })

  it('SCALE is sqrt(d_k), and SCALED_SCORES is RAW_SCORES divided by it', () => {
    expect(D_K).toBe(4)
    expect(SCALE).toBeCloseTo(2, 10)
    for (let i = 0; i < RAW_SCORES.length; i++) {
      for (let j = 0; j < RAW_SCORES[i].length; j++) {
        expect(SCALED_SCORES[i][j]).toBeCloseTo(RAW_SCORES[i][j] / SCALE, 10)
      }
    }
  })

  it('every ATTENTION_WEIGHTS row is a real softmax: non-negative and sums to 1', () => {
    for (const row of ATTENTION_WEIGHTS) {
      const sum = row.reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1, 10)
      for (const w of row) expect(w).toBeGreaterThanOrEqual(0)
    }
  })

  it('the largest raw/scaled score in each row gets the largest attention weight (softmax preserves order)', () => {
    for (let i = 0; i < SCALED_SCORES.length; i++) {
      const maxScoreIdx = SCALED_SCORES[i].indexOf(Math.max(...SCALED_SCORES[i]))
      const maxWeightIdx = ATTENTION_WEIGHTS[i].indexOf(Math.max(...ATTENTION_WEIGHTS[i]))
      expect(maxWeightIdx).toBe(maxScoreIdx)
    }
  })

  it('scaling before softmax produces a less peaked (more uniform) distribution than unscaled -- the entire point of the 1/sqrt(d_k) factor', () => {
    // Without scaling, raw dot products (which grow with d_k) push softmax toward
    // one-hot; dividing by sqrt(d_k) keeps gradients well-behaved. Row 2 (raw scores
    // [6,7,11], the widest spread) makes this most visible.
    const maxUnscaled = Math.max(...ATTENTION_WEIGHTS_UNSCALED[2])
    const maxScaled = Math.max(...ATTENTION_WEIGHTS[2])
    expect(maxUnscaled).toBeGreaterThan(maxScaled)
  })

  it('OUTPUT is real weighted-average of V rows by ATTENTION_WEIGHTS', () => {
    for (let i = 0; i < ATTENTION_WEIGHTS.length; i++) {
      for (let d = 0; d < V[0].length; d++) {
        const expected = ATTENTION_WEIGHTS[i].reduce((sum, w, j) => sum + w * V[j][d], 0)
        expect(OUTPUT[i][d]).toBeCloseTo(expected, 10)
      }
    }
  })

  it('OUTPUT row values are bounded by the min/max of the corresponding V column (a convex combination)', () => {
    for (let d = 0; d < V[0].length; d++) {
      const col = V.map((row) => row[d])
      const lo = Math.min(...col)
      const hi = Math.max(...col)
      for (const row of OUTPUT) {
        expect(row[d]).toBeGreaterThanOrEqual(lo - 1e-9)
        expect(row[d]).toBeLessThanOrEqual(hi + 1e-9)
      }
    }
  })
})
