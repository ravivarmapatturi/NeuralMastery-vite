import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'neural-mastery-progress';

// A simple, well-known Leitner-style ladder -- not full SM-2 with
// per-item difficulty, deliberately kept this simple for v1. Each
// successful "reviewed" click advances one stage; a page never regresses
// (there's no "failed this review" input in this UI, only "reviewed" or
// "not yet due").
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ProgressEntry {
  understood: boolean;
  /** When this page was last marked/reviewed. Absent on entries migrated
   * from the old boolean-only storage format -- those pages are understood
   * but have no review schedule yet (never "due"), not an error case. */
  markedAt?: number;
  /** Index into REVIEW_INTERVALS_DAYS. Absent alongside markedAt for the
   * same legacy reason. */
  stage?: number;
}

type UnderstoodMap = Record<string, ProgressEntry>;

interface ProgressContextValue {
  understood: UnderstoodMap;
  toggle: (permalink: string) => void;
  isUnderstood: (permalink: string) => boolean;
  countWithin: (permalinks: string[]) => number;
  reset: () => void;
  /** Permalinks currently marked understood whose next scheduled review
   * (per REVIEW_INTERVALS_DAYS) has passed. Only pages with a real
   * markedAt are ever eligible -- legacy entries with none are excluded,
   * per the "no review scheduled yet" contract above. */
  dueForReview: string[];
  /** Advance a page to its next review stage (or start it on the ladder
   * if it doesn't have one yet) and reset its due date from now. */
  markReviewed: (permalink: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Old storage entries were a bare `true`; new ones are a ProgressEntry
 * object. Normalizes either into the current shape so every consumer only
 * ever deals with one shape, without forcing an eager localStorage rewrite
 * on every page load. */
function normalize(raw: unknown): UnderstoodMap {
  if (!raw || typeof raw !== 'object') return {};
  const out: UnderstoodMap = {};
  for (const [permalink, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true) {
      out[permalink] = { understood: true };
    } else if (value && typeof value === 'object' && (value as ProgressEntry).understood) {
      const v = value as ProgressEntry;
      out[permalink] = { understood: true, markedAt: v.markedAt, stage: v.stage };
    }
    // Anything else (false, malformed) is dropped -- toggle() never
    // persists a `false`/absent-but-present entry in the first place.
  }
  return out;
}

function readStorage(): UnderstoodMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function writeStorage(value: UnderstoodMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) -- fail silently, progress just won't persist.
  }
}

function isDue(entry: ProgressEntry, now: number): boolean {
  if (entry.markedAt === undefined) return false; // legacy entry, no schedule yet
  const stage = entry.stage ?? 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[Math.min(stage, REVIEW_INTERVALS_DAYS.length - 1)];
  return now - entry.markedAt >= intervalDays * DAY_MS;
}

/**
 * Local-only (no account, nothing sent anywhere) "have I marked this page
 * understood" tracker, keyed by permalink. Mounted once at the app root so
 * every page shares the same state without prop drilling. Also drives a
 * simple spaced-repetition review schedule on top of the same mark data
 * (see REVIEW_INTERVALS_DAYS) -- a page you marked understood becomes
 * eligible for a "due for review" nudge once its current interval elapses.
 */
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [understood, setUnderstood] = useState<UnderstoodMap>({});

  useEffect(() => {
    setUnderstood(readStorage());
  }, []);

  const toggle = useCallback((permalink: string) => {
    setUnderstood((prev) => {
      const next = { ...prev };
      if (next[permalink]) {
        delete next[permalink];
      } else {
        next[permalink] = { understood: true, markedAt: Date.now(), stage: 0 };
      }
      writeStorage(next);
      return next;
    });
  }, []);

  const isUnderstood = useCallback((permalink: string) => !!understood[permalink]?.understood, [understood]);

  const countWithin = useCallback(
    (permalinks: string[]) => permalinks.filter((p) => understood[p]?.understood).length,
    [understood],
  );

  const reset = useCallback(() => {
    setUnderstood({});
    writeStorage({});
  }, []);

  const markReviewed = useCallback((permalink: string) => {
    setUnderstood((prev) => {
      const existing = prev[permalink];
      if (!existing) return prev; // can't review a page that was never marked understood
      const nextStage = Math.min((existing.stage ?? 0) + 1, REVIEW_INTERVALS_DAYS.length - 1);
      const next = { ...prev, [permalink]: { understood: true, markedAt: Date.now(), stage: nextStage } };
      writeStorage(next);
      return next;
    });
  }, []);

  const dueForReview = Object.keys(understood).filter((p) => isDue(understood[p], Date.now()));

  return (
    <ProgressContext.Provider value={{ understood, toggle, isUnderstood, countWithin, reset, dueForReview, markReviewed }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
