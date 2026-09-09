import type { PracticeTestCase } from './practiceProblem';

const CODE_KEY_PREFIX = 'nm_practice_code_';
const CUSTOM_TESTS_KEY_PREFIX = 'nm_practice_custom_tests_';
const SUBMISSIONS_KEY_PREFIX = 'nm_practice_submissions_';
const LAYOUT_KEY = 'nm_practice_layout_split';
const CANVAS_STATE_KEY_PREFIX = 'nm_practice_canvas_state_';

export interface CanvasPersistedState {
  nodes: Array<{ id: string; position: { x: number; y: number } }>;
  edges: Array<{ id: string; source: string; target: string; label?: string }>;
}

export function loadCanvasState(problemId: string): CanvasPersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(`${CANVAS_STATE_KEY_PREFIX}${problemId}`);
    return val !== null ? (JSON.parse(val) as CanvasPersistedState) : null;
  } catch {
    return null;
  }
}

export function saveCanvasState(problemId: string, state: CanvasPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CANVAS_STATE_KEY_PREFIX}${problemId}`, JSON.stringify(state));
  } catch {
    // ignore quota error
  }
}

export interface SubmissionRecord {
  id: string;
  timestamp: number;
  code: string;
  status: 'success' | 'wrong_answer' | 'runtime_error' | 'syntax_error' | 'timeout';
  passedCount: number;
  totalCount: number;
  totalExecutionTimeMs?: number;
}

export interface PracticeLayoutSplit {
  leftWidthPct: number; // Splitter A: Problem (Left) vs Workspace (Right)
  topHeightPct: number; // Splitter B: Code Editor (Top) vs Test Results (Bottom)
}

export const DEFAULT_LAYOUT_SPLIT: PracticeLayoutSplit = {
  leftWidthPct: 40,
  topHeightPct: 50,
};

export function loadSavedCode(problemId: string, fallbackStarter: string): string {
  if (typeof window === 'undefined') return fallbackStarter;
  try {
    const val = localStorage.getItem(`${CODE_KEY_PREFIX}${problemId}`);
    return val !== null ? val : fallbackStarter;
  } catch {
    return fallbackStarter;
  }
}

export function saveUserCode(problemId: string, code: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CODE_KEY_PREFIX}${problemId}`, code);
  } catch {
    // ignore quota error
  }
}

export function loadCustomTestCases(problemId: string): PracticeTestCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem(`${CUSTOM_TESTS_KEY_PREFIX}${problemId}`);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function saveCustomTestCases(problemId: string, cases: PracticeTestCase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CUSTOM_TESTS_KEY_PREFIX}${problemId}`, JSON.stringify(cases));
  } catch {
    // ignore
  }
}

export function loadSubmissions(problemId: string): SubmissionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem(`${SUBMISSIONS_KEY_PREFIX}${problemId}`);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function recordSubmission(problemId: string, sub: Omit<SubmissionRecord, 'id' | 'timestamp'>): SubmissionRecord {
  const fullSub: SubmissionRecord = {
    ...sub,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = loadSubmissions(problemId);
      const updated = [fullSub, ...existing].slice(0, 20); // Keep last 20 submissions
      localStorage.setItem(`${SUBMISSIONS_KEY_PREFIX}${problemId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return fullSub;
}

export function loadLayoutSplit(): PracticeLayoutSplit {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT_SPLIT;
  try {
    const val = localStorage.getItem(LAYOUT_KEY);
    if (!val) return DEFAULT_LAYOUT_SPLIT;
    const parsed = JSON.parse(val);
    return {
      leftWidthPct: Math.min(80, Math.max(20, parsed.leftWidthPct ?? 40)),
      topHeightPct: Math.min(80, Math.max(20, parsed.topHeightPct ?? 50)),
    };
  } catch {
    return DEFAULT_LAYOUT_SPLIT;
  }
}

export function saveLayoutSplit(split: PracticeLayoutSplit): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(split));
  } catch {
    // ignore
  }
}

const HINTS_VIEWED_KEY_PREFIX = 'nm_practice_hints_viewed_';

/** Record that a hint was viewed for this problem before first solve */
export function recordHintViewed(problemId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${HINTS_VIEWED_KEY_PREFIX}${problemId}`, 'true');
  } catch {
    // ignore
  }
}

/** Check if any hints were viewed for this problem */
export function hasViewedHints(problemId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${HINTS_VIEWED_KEY_PREFIX}${problemId}`) === 'true';
  } catch {
    return false;
  }
}

/** Optional reset for hint tracking */
export function clearHintViewed(problemId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${HINTS_VIEWED_KEY_PREFIX}${problemId}`);
  } catch {
    // ignore
  }
}
