import { describe, expect, it } from 'vitest'
import {
  computeMaxSim,
  MAXSIM_EXAMPLE_D,
  MAXSIM_EXAMPLE_DOC_TOKENS,
  MAXSIM_EXAMPLE_Q,
  MAXSIM_EXAMPLE_QUERY_TOKENS,
} from './maxsim'

describe('computeMaxSim', () => {
  it('reproduces the exact worked-example numbers shown on the Retrieval & Reranking page', () => {
    // Q tokens: cat, sat, mat. D tokens: the, cat, was, on, mat.
    // Hand-verified dot products (one-hot-ish toy embeddings):
    //   cat . [the,cat,was,on,mat] = [0, 1, 0, 0, 0] -> max 1 at "cat" (idx 1)
    //   sat . [the,cat,was,on,mat] = [0, 0.2, 0.8, 0, 0] -> max 0.8 at "was" (idx 2)
    //   mat . [the,cat,was,on,mat] = [0, 0, 0, 0, 1] -> max 1 at "mat" (idx 4)
    const result = computeMaxSim(MAXSIM_EXAMPLE_Q, MAXSIM_EXAMPLE_D)

    expect(result.similarityMatrix).toEqual([
      [0, 1, 0, 0, 0],
      [0, 0.2, 0.8, 0, 0],
      [0, 0, 0, 0, 1],
    ])
    expect(result.maxSims).toEqual([1, 0.8, 1])
    expect(result.maxIndices).toEqual([1, 2, 4])
    // MaxSim score = 1 + 0.8 + 1 = 2.8
    expect(result.score).toBeCloseTo(2.8, 10)
  })

  it("'sat' best-matches 'was' -- a semantic near-match a pure keyword match would miss", () => {
    const result = computeMaxSim(MAXSIM_EXAMPLE_Q, MAXSIM_EXAMPLE_D)
    const satIndex = MAXSIM_EXAMPLE_QUERY_TOKENS.indexOf('sat')
    const bestDocToken = MAXSIM_EXAMPLE_DOC_TOKENS[result.maxIndices[satIndex]]
    expect(bestDocToken).toBe('was')
    expect(result.maxSims[satIndex]).toBeCloseTo(0.8, 10)
  })

  it('score is the sum of per-query-token max similarities', () => {
    const result = computeMaxSim(MAXSIM_EXAMPLE_Q, MAXSIM_EXAMPLE_D)
    const manualSum = result.maxSims.reduce((a, b) => a + b, 0)
    expect(result.score).toBeCloseTo(manualSum, 10)
  })

  it('is symmetric-safe for a trivial 1x1 case', () => {
    const result = computeMaxSim([[1, 0]], [[1, 0]])
    expect(result.similarityMatrix).toEqual([[1]])
    expect(result.score).toBe(1)
  })

  it('handles an all-zero-similarity case (no overlap in any dimension)', () => {
    const result = computeMaxSim([[1, 0]], [[0, 1]])
    expect(result.similarityMatrix).toEqual([[0]])
    expect(result.maxSims).toEqual([0])
    expect(result.score).toBe(0)
  })

  it('similarity matrix has one row per query token and one column per doc token', () => {
    const result = computeMaxSim(MAXSIM_EXAMPLE_Q, MAXSIM_EXAMPLE_D)
    expect(result.similarityMatrix).toHaveLength(MAXSIM_EXAMPLE_Q.length)
    for (const row of result.similarityMatrix) {
      expect(row).toHaveLength(MAXSIM_EXAMPLE_D.length)
    }
  })
})
