/**
 * An original, Neural-Mastery-native 10-tier rank system layered ON TOP
 * of the existing points/level curve (see gamification.ts's levelForPoints) --
 * not a replacement for it. A rank is a coarser banding over level: every
 * few levels crosses into the next rank.
 *
 * The 10 tiers replace the PUBG-copy ladder with site-native progression:
 * Initiate -> Apprentice -> Explorer -> Builder -> Practitioner ->
 * Specialist -> Expert -> Master -> Grandmaster -> Neural Legend.
 *
 * The minLevel thresholds below are tuned against the SAME quadratic level
 * curve gamification.ts already uses (totalXpForLevel(level) = 50*(level-1)^2)
 * so a genuinely active learner crosses tiers in a natural cadence over
 * weeks and months, with the top tiers providing an aspirational ceiling.
 */

export interface RankTier {
  id: string;
  label: string;
  /** The lowest level that belongs to this tier (inclusive). The next
   * tier's minLevel is this tier's real upper boundary. */
  minLevel: number;
  /** Real color token this tier renders in -- escalates from cool slate
   * through vibrant jewel tones to a radiant luminous gold for the top tier. */
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { id: 'initiate', label: 'Initiate', minLevel: 1, color: '#8B95A5' },
  { id: 'apprentice', label: 'Apprentice', minLevel: 4, color: '#CD7F32' },
  { id: 'explorer', label: 'Explorer', minLevel: 8, color: '#38BDF8' },
  { id: 'builder', label: 'Builder', minLevel: 12, color: '#10B981' },
  { id: 'practitioner', label: 'Practitioner', minLevel: 16, color: '#06B6D4' },
  { id: 'specialist', label: 'Specialist', minLevel: 21, color: '#6366F1' },
  { id: 'expert', label: 'Expert', minLevel: 27, color: '#8B5CF6' },
  { id: 'master', label: 'Master', minLevel: 33, color: '#EC4899' },
  { id: 'grandmaster', label: 'Grandmaster', minLevel: 40, color: '#F43F5E' },
  { id: 'neurallegend', label: 'Neural Legend', minLevel: 50, color: '#F59E0B' },
];

/** The real rank tier for a given level -- the highest tier whose
 * minLevel the learner has actually reached, never a guess/interpolation.
 * Level 1 (a brand-new learner, 0 points) is real Initiate, not "unranked":
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
 * (Neural Legend has no "next" -- that's the honest top, not a fake infinite
 * progression). Used to show "N levels to <next rank>" progress. */
export function nextRankTier(current: RankTier): RankTier | undefined {
  const idx = RANK_TIERS.findIndex((t) => t.id === current.id);
  return RANK_TIERS[idx + 1];
}
