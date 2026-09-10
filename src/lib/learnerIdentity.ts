import type { DocPage } from './contentTree';
import type { AwardEvent } from './gamification';
import { isSolved } from './mastery';
import { getPracticeTracks } from './practiceTracks';

export const TRACK_TITLE_MAP: Record<string, string> = {
  'transformers-llms': 'Transformer Architect',
  'deep-learning': 'Deep Learning Specialist',
  'deep-learning-vision/nlp': 'Perception & Vision Specialist',
  'agents,-mcp-systems': 'Agent Systems Architect',
  'classical-ml': 'Classical ML Specialist',
  'math-numerical': 'Numerical Foundations Specialist',
  'numpy-pandas': 'Data Systems Specialist',
  'python-fundamentals': 'Python Systems Engineer',
  'data-structures-algorithms': 'Algorithms Specialist',
  'mathematics-for-ai': 'Mathematical Foundations Specialist',
  'agent-loop-engineering': 'Agent Systems Specialist',
  'reinforcement-learning': 'Reinforcement Learning Specialist',
};

export const DEFAULT_LEARNER_TITLE = 'Neural Learner';

export interface LearnerIdentityInfo {
  title: string;
  topTrackTopic?: string;
  topTrackLabel?: string;
  topTrackSolves: number;
}

/**
 * Derives the learner's identity title from their real practice history.
 * The practice track with the highest number of solved problems dictates
 * their specialization title (e.g. "Transformers & LLMs" -> "Transformer Architect").
 * If no practice problems have been solved yet, falls back honestly to "Neural Learner".
 */
export function computeLearnerTitle(problems: DocPage[], events: AwardEvent[]): LearnerIdentityInfo {
  const tracks = getPracticeTracks(problems);

  let maxSolves = 0;
  let topTrackTopic: string | undefined;
  let topTrackLabel: string | undefined;

  for (const track of tracks) {
    const trackProblems = problems.filter((p) => p.topic === track.topic);
    const solvedInTrack = trackProblems.filter((p) => isSolved(p, events)).length;
    if (solvedInTrack > maxSolves) {
      maxSolves = solvedInTrack;
      topTrackTopic = track.topic;
      topTrackLabel = track.label;
    }
  }

  if (maxSolves === 0 || !topTrackTopic) {
    return {
      title: DEFAULT_LEARNER_TITLE,
      topTrackSolves: 0,
    };
  }

  const mapped = TRACK_TITLE_MAP[topTrackTopic];
  const title = mapped ?? `${topTrackLabel ?? topTrackTopic} Specialist`;

  return {
    title,
    topTrackTopic,
    topTrackLabel,
    topTrackSolves: maxSolves,
  };
}
