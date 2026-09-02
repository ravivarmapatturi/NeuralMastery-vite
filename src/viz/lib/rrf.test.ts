import { describe, expect, it } from 'vitest'
import { RRF_DEFAULT_K, reciprocalRankFusion, rrfScoreForRank } from './rrf'

// Same two rankings HybridSearchFusionDiagram.tsx visualizes.
const DENSE_RANKING = ['Doc B', 'Doc A', 'Doc D', 'Doc C']
const SPARSE_RANKING = ['Doc C', 'Doc B', 'Doc A', 'Doc D']

describe('rrfScoreForRank', () => {
  it('matches the RAG page formula: 1/(k+rank)', () => {
    expect(rrfScoreForRank(1, 60)).toBeCloseTo(1 / 61, 12)
    expect(rrfScoreForRank(4, 60)).toBeCloseTo(1 / 64, 12)
  })

  it('is strictly decreasing as rank worsens (higher rank number)', () => {
    const scores = [1, 2, 3, 4, 5].map((r) => rrfScoreForRank(r, 60))
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThan(scores[i - 1])
  })

  it('defaults k to 60 (the standard constant) when omitted', () => {
    expect(rrfScoreForRank(3)).toBeCloseTo(rrfScoreForRank(3, RRF_DEFAULT_K), 12)
    expect(RRF_DEFAULT_K).toBe(60)
  })
})

describe('reciprocalRankFusion', () => {
  it('reproduces the exact fused order shown on the Hybrid Search diagram: B, C, A, D', () => {
    // Hand-computed (k=60):
    //   Doc A: 1/(60+2) + 1/(60+3) = 1/62 + 1/63 ≈ 0.032002
    //   Doc B: 1/(60+1) + 1/(60+2) = 1/61 + 1/62 ≈ 0.032522
    //   Doc C: 1/(60+4) + 1/(60+1) = 1/64 + 1/61 ≈ 0.032018
    //   Doc D: 1/(60+3) + 1/(60+4) = 1/63 + 1/64 ≈ 0.031498
    // Descending: B > C > A > D
    const fused = reciprocalRankFusion([DENSE_RANKING, SPARSE_RANKING], 60)
    expect(fused.map((r) => r.doc)).toEqual(['Doc B', 'Doc C', 'Doc A', 'Doc D'])
  })

  it("a doc ranked highly by BOTH lists can beat a doc that was #1 in only one (RRF's whole point)", () => {
    // Doc B is #1 dense / #2 sparse; Doc C is #1 sparse / #4 dense.
    // Being consistently good beats being great once and mediocre once.
    const fused = reciprocalRankFusion([DENSE_RANKING, SPARSE_RANKING], 60)
    const bIndex = fused.findIndex((r) => r.doc === 'Doc B')
    const cIndex = fused.findIndex((r) => r.doc === 'Doc C')
    expect(bIndex).toBeLessThan(cIndex)
  })

  it('a doc missing from one ranking still gets scored from the ranking(s) it appears in', () => {
    const fused = reciprocalRankFusion([['X', 'Y'], ['Y']], 60)
    const x = fused.find((r) => r.doc === 'X')!
    const y = fused.find((r) => r.doc === 'Y')!
    expect(x.score).toBeCloseTo(rrfScoreForRank(1, 60), 12)
    expect(y.score).toBeCloseTo(rrfScoreForRank(2, 60) + rrfScoreForRank(1, 60), 12)
    expect(y.score).toBeGreaterThan(x.score)
  })

  it('fuses more than two rankings', () => {
    const fused = reciprocalRankFusion([['A', 'B'], ['B', 'A'], ['A', 'B']], 10)
    // A: 1st in two lists, 2nd in one. B: 2nd in two lists, 1st in one. A should win.
    expect(fused[0].doc).toBe('A')
  })
})
