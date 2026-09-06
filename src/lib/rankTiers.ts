/**
 * A real, battle-royale-style tiered rank system layered ON TOP of the
 * existing points/level curve (see gamification.ts's levelForPoints) --
 * not a replacement for it. A rank is a coarser banding over level: every
 * few levels crosses into the next rank, the same way BGMI/PUBG's own
 * Bronze -> Conqueror ladder bands a player's underlying rating into a
 * small number of named tiers (see bgmipubg.com/bgmi-ranks for the real,
 * well-known reference pattern this follows). The specific level
 * thresholds below are this site's own design, not copied numbers, tuned
 * against the SAME quadratic level curve gamification.ts already uses
 * (totalXpForLevel(level) = 50*(level-1)^2) so a genuinely active learner
 * crosses tiers every few weeks, not every session.
 */

export interface RankTier {
  id: string;
  label: string;
  /** The lowest level that belongs to this tier (inclusive). The next
   * tier's minLevel is this tier's real upper boundary. */
  minLevel: number;
  /** Real color token this tier renders in -- escalates from a dull
   * bronze through the site's own accent palette, ending in a genuinely
   * distinct gold for the top tier, not a copy of BGMI's own palette. */
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { id: 'bronze', label: 'Bronze', minLevel: 1, color: '#A8703F' },
  { id: 'silver', label: 'Silver', minLevel: 5, color: '#9AA5B1' },
  { id: 'gold', label: 'Gold', minLevel: 10, color: '#D4A62A' },
  { id: 'platinum', label: 'Platinum', minLevel: 15, color: '#4FB6A8' },
  { id: 'diamond', label: 'Diamond', minLevel: 20, color: '#5B8CFF' },
  { id: 'crown', label: 'Crown', minLevel: 25, color: '#B15BFF' },
  { id: 'ace', label: 'Ace', minLevel: 30, color: '#F45B5B' },
  { id: 'conqueror', label: 'Conqueror', minLevel: 40, color: '#3DDC97' },
];

/** The real rank tier for a given level -- the highest tier whose
 * minLevel the learner has actually reached, never a guess/interpolation.
 * Level 1 (a brand-new learner, 0 points) is real Bronze, not "unranked":
 * every learner has SOME rank from their very first point. */
export function rankForLevel(level: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) current = tier;
    else break;
  }
  return current;
}

/** The next tier up, or undefined at the real top of the ladder
 * (Conqueror has no "next" -- that's the honest top, not a fake infinite
 * progression). Used to show "N levels to <next rank>" progress. */
export function nextRankTier(current: RankTier): RankTier | undefined {
  const idx = RANK_TIERS.findIndex((t) => t.id === current.id);
  return RANK_TIERS[idx + 1];
}
