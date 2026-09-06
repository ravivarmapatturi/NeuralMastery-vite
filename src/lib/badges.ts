export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: 'streak' | 'xp' | 'mastery' | 'milestone';
  requirementText: string;
  checkUnlocked: (stats: {
    totalXP: number;
    streak: number;
    pagesUnderstood: number;
    problemsSolved: number;
    systemDesignSolved: number;
    isSignedIn: boolean;
  }) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    title: 'First Step',
    icon: '🥉',
    description: 'Began your Neural Mastery journey by earning your first reward.',
    category: 'milestone',
    requirementText: 'Earn your first XP points',
    checkUnlocked: (s) => s.totalXP > 0,
  },
  {
    id: 'streak-3',
    title: '3-Day Spark',
    icon: '🔥',
    description: 'Maintained a consistent learning streak for 3 consecutive days.',
    category: 'streak',
    requirementText: '3-day active streak',
    checkUnlocked: (s) => s.streak >= 3,
  },
  {
    id: 'streak-7',
    title: '7-Day Titan',
    icon: '⚡',
    description: 'Demonstrated dedication with a full 7-day learning streak.',
    category: 'streak',
    requirementText: '7-day active streak',
    checkUnlocked: (s) => s.streak >= 7,
  },
  {
    id: 'xp-novice',
    title: 'Neural Novice',
    icon: '🧠',
    description: 'Built core foundations across deep learning concepts.',
    category: 'xp',
    requirementText: 'Reach 100 total XP',
    checkUnlocked: (s) => s.totalXP >= 100,
  },
  {
    id: 'xp-apprentice',
    title: 'Transformer Apprentice',
    icon: '🚀',
    description: 'Gained momentum with deep conceptual understanding.',
    category: 'xp',
    requirementText: 'Reach 250 total XP',
    checkUnlocked: (s) => s.totalXP >= 250,
  },
  {
    id: 'xp-architect',
    title: 'Attention Architect',
    icon: '🔮',
    description: 'Mastered multi-head attention and transformer mechanics.',
    category: 'xp',
    requirementText: 'Reach 500 total XP',
    checkUnlocked: (s) => s.totalXP >= 500,
  },
  {
    id: 'xp-master',
    title: 'Neural Master',
    icon: '👑',
    description: 'Reached elite mastery status in AI & Machine Learning.',
    category: 'xp',
    requirementText: 'Reach 1000 total XP',
    checkUnlocked: (s) => s.totalXP >= 1000,
  },
  {
    id: 'deep-reader',
    title: 'Deep Reader',
    icon: '📚',
    description: 'Marked 10 core lesson pages as thoroughly understood.',
    category: 'mastery',
    requirementText: 'Mark 10 pages understood',
    checkUnlocked: (s) => s.pagesUnderstood >= 10,
  },
  {
    id: 'problem-solver',
    title: 'Code Ninja',
    icon: '💻',
    description: 'Successfully implemented 5 hands-on practice problems from scratch.',
    category: 'mastery',
    requirementText: 'Solve 5 practice problems',
    checkUnlocked: (s) => s.problemsSolved >= 5,
  },
  {
    id: 'welcome',
    title: 'Welcome Aboard',
    icon: '👋',
    description: 'Signed in for the first time and unlocked the welcome badge.',
    category: 'milestone',
    requirementText: 'Sign in for the first time',
    checkUnlocked: (s) => s.isSignedIn,
  },
  {
    id: 'system-architect',
    title: 'System Architect',
    icon: '🏗️',
    description: 'Completed a full end-to-end ML system design challenge.',
    category: 'mastery',
    requirementText: 'Complete 1 system design challenge',
    checkUnlocked: (s) => s.systemDesignSolved >= 1,
  },
];

export function getUnlockedBadges(stats: {
  totalXP: number;
  streak: number;
  pagesUnderstood: number;
  problemsSolved: number;
  systemDesignSolved: number;
  isSignedIn: boolean;
}): Badge[] {
  return BADGES.filter((b) => b.checkUnlocked(stats));
}
