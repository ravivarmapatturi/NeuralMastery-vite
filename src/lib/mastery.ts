import type { DocPage } from './contentTree';
import type { AwardEvent } from './gamification';
import { hasAward } from './gamification';

export interface PracticeStats {
  solved: number;
  total: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export function cleanPracticeTitle(title: string): string {
  return title.replace(/^(Practice|Design Challenge):\s*/, '');
}

export function isSolved(problem: DocPage, events: AwardEvent[]): boolean {
  return hasAward(events, problem.route, problem.difficulty ? 'complete' : 'design');
}

export function practiceStats(problems: DocPage[], events: AwardEvent[]): PracticeStats {
  const solved = problems.filter((p) => isSolved(p, events));
  return {
    solved: solved.length,
    total: problems.length,
    easySolved: solved.filter((p) => p.difficulty === 'easy').length,
    mediumSolved: solved.filter((p) => p.difficulty === 'medium').length,
    hardSolved: solved.filter((p) => p.difficulty === 'hard').length,
  };
}

/** First unfinished lesson in the real, sidebar-defined curriculum. This is
 * deliberately deterministic until we have enough learner signals for a
 * personalized recommender; it never claims knowledge we do not store. */
export function nextLesson(pages: DocPage[], understood: Record<string, unknown>): DocPage | undefined {
  return pages.find((page) => !understood[page.route] && !page.route.endsWith('/roadmap'));
}

/** Match a problem to the real doc section named in its frontmatter. The
 * first page is normally that section's overview, making this a durable
 * concept hand-off without a second hand-maintained relationship table. */
export function relatedLesson(problem: DocPage, pages: DocPage[]): DocPage | undefined {
  if (!problem.topic) return undefined;
  return pages.find((page) => page.section === problem.topic && page.slug.endsWith('/overview'))
    ?? pages.find((page) => page.section === problem.topic);
}

/** Prefer a real unsolved problem in the same topic as the learner's next
 * lesson; fall back to the first unsolved item in catalogue order. */
export function recommendedProblem(problems: DocPage[], events: AwardEvent[], next?: DocPage): DocPage | undefined {
  const unsolved = problems.filter((p) => !isSolved(p, events));
  return unsolved.find((p) => p.topic === next?.section) ?? unsolved[0];
}


