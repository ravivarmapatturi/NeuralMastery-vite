import { describe, expect, it } from 'vitest'
import { RANK_TIERS, rankForLevel, nextRankTier } from './rankTiers'

describe('RANK_TIERS', () => {
  it('has exactly 10 distinct, ordered tiers', () => {
    expect(RANK_TIERS.length).toBe(10)
    expect(RANK_TIERS.map((t) => t.id)).toEqual([
      'initiate',
      'apprentice',
      'explorer',
      'builder',
      'practitioner',
      'specialist',
      'expert',
      'master',
      'grandmaster',
      'neurallegend',
    ])
  })

  it('is a real, strictly increasing ladder of minLevel thresholds -- no gaps, no overlaps, no duplicates', () => {
    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].minLevel).toBeGreaterThan(RANK_TIERS[i - 1].minLevel)
    }
  })

  it('starts at level 1 -- a brand-new learner has a real rank (Initiate), not "unranked"', () => {
    expect(RANK_TIERS[0].minLevel).toBe(1)
    expect(RANK_TIERS[0].id).toBe('initiate')
  })

  it('every tier has a real, distinct color -- no two tiers share the same badge color', () => {
    const colors = new Set(RANK_TIERS.map((t) => t.color))
    expect(colors.size).toBe(RANK_TIERS.length)
  })
})

describe('rankForLevel', () => {
  it('a level-1 (brand-new) learner is real Initiate', () => {
    expect(rankForLevel(1).id).toBe('initiate')
  })

  it('exactly at a tier boundary, the learner is already in the NEW tier, not the old one', () => {
    const builderTier = RANK_TIERS.find((t) => t.id === 'builder')!
    expect(rankForLevel(builderTier.minLevel).id).toBe('builder')
    expect(rankForLevel(builderTier.minLevel - 1).id).not.toBe('builder')
  })

  it('one level below a boundary stays in the previous tier', () => {
    const apprenticeTier = RANK_TIERS.find((t) => t.id === 'apprentice')!
    expect(rankForLevel(apprenticeTier.minLevel - 1).id).toBe('initiate')
  })

  it('a very high level lands on the real top tier (Neural Legend), not an out-of-bounds crash', () => {
    expect(rankForLevel(999).id).toBe('neurallegend')
  })

  it('every real level from 1 to 60 resolves to exactly one defined tier (no gaps)', () => {
    for (let level = 1; level <= 60; level++) {
      const tier = rankForLevel(level)
      expect(RANK_TIERS.some((t) => t.id === tier.id)).toBe(true)
    }
  })
})

describe('nextRankTier', () => {
  it('returns the real next tier for every tier except the top', () => {
    for (let i = 0; i < RANK_TIERS.length - 1; i++) {
      expect(nextRankTier(RANK_TIERS[i])?.id).toBe(RANK_TIERS[i + 1].id)
    }
  })

  it('is undefined at the real top of the ladder (Neural Legend) -- an honest ceiling, not a fake infinite progression', () => {
    const top = RANK_TIERS[RANK_TIERS.length - 1]
    expect(nextRankTier(top)).toBeUndefined()
  })
})
