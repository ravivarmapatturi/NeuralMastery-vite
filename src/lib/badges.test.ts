import { describe, expect, it } from 'vitest';
import { BADGES, getUnlockedBadges } from './badges';

describe('BADGES definition & unlock logic', () => {
  it('defines unique badge IDs and valid properties', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(BADGES.length);
    BADGES.forEach((b) => {
      expect(b.title).toBeTruthy();
      expect(b.icon).toBeTruthy();
      expect(b.description).toBeTruthy();
    });
  });

  it('correctly locks all badges for a brand-new user with 0 stats', () => {
    const unlocked = getUnlockedBadges({
      totalXP: 0,
      streak: 0,
      pagesUnderstood: 0,
      problemsSolved: 0,
      systemDesignSolved: 0,
      isSignedIn: false,
    });
    expect(unlocked).toHaveLength(0);
  });

  it('unlocks First Step badge as soon as user earns first XP points', () => {
    const unlocked = getUnlockedBadges({
      totalXP: 10,
      streak: 1,
      pagesUnderstood: 1,
      problemsSolved: 0,
      systemDesignSolved: 0,
      isSignedIn: false,
    });
    expect(unlocked.some((b) => b.id === 'first-step')).toBe(true);
  });

  it('unlocks streak and tier milestone badges as criteria are met', () => {
    const unlocked = getUnlockedBadges({
      totalXP: 300,
      streak: 7,
      pagesUnderstood: 12,
      problemsSolved: 5,
      systemDesignSolved: 1,
      isSignedIn: false,
    });

    const unlockedIds = unlocked.map((b) => b.id);
    expect(unlockedIds).toContain('first-step');
    expect(unlockedIds).toContain('streak-3');
    expect(unlockedIds).toContain('streak-7');
    expect(unlockedIds).toContain('xp-novice');
    expect(unlockedIds).toContain('xp-apprentice');
    expect(unlockedIds).toContain('deep-reader');
    expect(unlockedIds).toContain('problem-solver');
    expect(unlockedIds).toContain('system-architect');
    expect(unlockedIds).not.toContain('xp-master'); // 1000 XP required
  });
});
