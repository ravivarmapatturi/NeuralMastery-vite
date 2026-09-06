import { describe, expect, it } from 'vitest'
import { RANK_TIERS, rankForLevel, nextRankTier } from './rankTiers'

describe('RANK_TIERS', () => {
  it('is a real, strictly increasing ladder of minLevel thresholds -- no gaps, no overlaps, no duplicates', () => {
    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].minLevel).toBeGreaterThan(RANK_TIERS[i - 1].minLevel)
    }
  })

  it('starts at level 1 -- a brand-new learner has a real rank (Bronze), not "unranked"', () => {
    expect(RANK_TIERS[0].minLevel).toBe(1)
    expect(RANK_TIERS[0].id).toBe('bronze')
  })

  it('every tier has a real, distinct color -- no two tiers share the same badge color', () => {
    const colors = new Set(RANK_TIERS.map((t) => t.color))
    expect(colors.size).toBe(RANK_TIERS.length)
  })
})

describe('rankForLevel', () => {
  it('a level-1 (brand-new) learner is real Bronze', () => {
    expect(rankForLevel(1).id).toBe('bronze')
  })

  it('exactly at a tier boundary, the learner is already in the NEW tier, not the old one', () => {
    const goldTier = RANK_TIERS.find((t) => t.id === 'gold')!
    expect(rankForLevel(goldTier.minLevel).id).toBe('gold')
    expect(rankForLevel(goldTier.minLevel - 1).id).not.toBe('gold')
  })

  it('one level below a boundary stays in the previous tier', () => {
    const silverTier = RANK_TIERS.find((t) => t.id === 'silver')!
    expect(rankForLevel(silverTier.minLevel - 1).id).toBe('bronze')
  })

  it('a very high level lands on the real top tier (Conqueror), not an out-of-bounds crash', () => {
    expect(rankForLevel(999).id).toBe('conqueror')
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

  it('is undefined at the real top of the ladder (Conqueror) -- an honest ceiling, not a fake infinite progression', () => {
    const top = RANK_TIERS[RANK_TIERS.length - 1]
    expect(nextRankTier(top)).toBeUndefined()
  })
})
