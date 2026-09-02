import { describe, expect, it } from 'vitest'
import { BM25_DEFAULT_K1, bm25TermFrequencySaturation } from './bm25'

describe('bm25TermFrequencySaturation', () => {
  it('is 0 at tf=0', () => {
    expect(bm25TermFrequencySaturation(0, BM25_DEFAULT_K1)).toBe(0)
  })

  it('matches the diagram default at tf=5, k1=1.5: (2.5*5)/(6.5)', () => {
    expect(bm25TermFrequencySaturation(5, 1.5)).toBeCloseTo(12.5 / 6.5, 10)
  })

  it('approaches but never reaches the ceiling of k1+1 as tf grows large', () => {
    const k1 = 1.5
    const atLargeTf = bm25TermFrequencySaturation(10_000, k1)
    expect(atLargeTf).toBeLessThan(k1 + 1)
    expect(atLargeTf).toBeGreaterThan(k1 + 1 - 0.01)
  })

  it('is strictly increasing in tf (more occurrences never lowers the score)', () => {
    const k1 = 1.5
    const values = Array.from({ length: 16 }, (_, tf) => bm25TermFrequencySaturation(tf, k1))
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('saturates: the marginal gain from tf=1->2 is larger than from tf=9->10', () => {
    const k1 = 1.5
    const earlyGain = bm25TermFrequencySaturation(2, k1) - bm25TermFrequencySaturation(1, k1)
    const lateGain = bm25TermFrequencySaturation(10, k1) - bm25TermFrequencySaturation(9, k1)
    expect(earlyGain).toBeGreaterThan(lateGain)
  })

  it('uses BM25_DEFAULT_K1 (1.5) when k1 is omitted', () => {
    expect(bm25TermFrequencySaturation(5)).toBeCloseTo(bm25TermFrequencySaturation(5, BM25_DEFAULT_K1), 10)
  })
})
