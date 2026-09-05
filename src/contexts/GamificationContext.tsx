import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  type AwardEvent,
  MARK_UNDERSTOOD_POINTS,
  PROBLEM_COMPLETED_POINTS,
  SYSTEM_DESIGN_CHALLENGE_POINTS,
  hasAward,
  totalPoints,
  weeklyPoints as computeWeeklyPoints,
  weekStartDateString,
  computeStreak,
  mergeEvents,
  localDateString,
  computeDisplayName,
} from '../lib/gamification';
import type { User } from 'firebase/auth';

const STORAGE_KEY = 'neural-mastery-gamification';

interface GamificationContextValue {
  points: number;
  weeklyPoints: number;
  streak: number;
  /** Real underlying award-event log -- exposed (not just the derived
   * totals above) so pages that need a per-topic or per-day breakdown
   * (topicBreakdown, activityCounts in lib/gamification.ts) can compute
   * it themselves without a second, parallel data path. */
  events: AwardEvent[];
  awardMarkUnderstood: (permalink: string) => void;
  awardProblemCompleted: (permalink: string) => void;
  awardSystemDesignCompleted: (permalink: string) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

function readStorage(): AwardEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(events: AwardEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage unavailable -- fail silently, same contract as ProgressContext.
  }
}

/** Same dynamic-import-for-bundle-size reason as ProgressContext's own
 * loadFirestoreFor -- ships firebase/firestore only when actually needed
 * (a signed-in user), never in the eager main chunk. Duplicated rather
 * than shared with ProgressContext on purpose: these are two independent
 * concerns that happen to sync fields on the same document, and coupling
 * their Firestore-loading internals together for a few duplicated lines
 * isn't worth the cross-context dependency. */
async function loadFirestoreFor(uid: string) {
  const [{ db }, { doc, getDoc, setDoc, onSnapshot }] = await Promise.all([import('../lib/firebase'), import('firebase/firestore')]);
  return { progressRef: doc(db, 'progress', uid), leaderboardRef: doc(db, 'leaderboard', uid), getDoc, setDoc, onSnapshot };
}

/** Builds the public leaderboard document's fields from a real event log --
 * co-located with (not a separate reactive effect off of) every place the
 * private progress doc's gamificationEvents actually get written, so the
 * two are always written together, in the same async call, using the SAME
 * `events` value -- no separate effect racing against its own stale
 * closure of `events` from a prior render. */
function leaderboardFields(user: User, events: AwardEvent[], now: number) {
  return {
    displayName: computeDisplayName(user),
    allTimePoints: totalPoints(events),
    weeklyPoints: computeWeeklyPoints(events, new Date(now)),
    weekStart: weekStartDateString(new Date(now)),
    updatedAt: now,
  };
}

/**
 * Points, weekly points, and streak -- all derived (see src/lib/gamification.ts
 * for why) from a real per-award event log stored alongside ProgressContext's
 * own `understood` map, as a sibling `gamificationEvents` field on the same
 * Firestore `progress/{uid}` document (or, signed-out, a separate localStorage
 * key -- never touching ProgressContext's own storage format).
 *
 * Same signed-out/signed-in contract as ProgressContext: signed-out visitors
 * get localStorage-only points/streak with zero network calls; on sign-in,
 * this browser's local event log is merged (union, deduped by permalink+kind,
 * see mergeEvents) into whatever Firestore already has, and Firestore becomes
 * the source of truth from then on via a live onSnapshot subscription.
 *
 * Also writes a denormalized snapshot to a SEPARATE `leaderboard/{uid}`
 * document alongside every progress-doc write -- the private `progress/{uid}`
 * document's security rules correctly block cross-user reads (verified via
 * the emulator), so a leaderboard genuinely cannot be computed from it; a
 * deliberately public-readable (but only self-writable) sibling collection
 * is what makes ranking possible without weakening that privacy guarantee.
 *
 * Every "what day is it" computation below explicitly threads `Date.now()`
 * through as an argument (`new Date(Date.now())`), never relying on a bare
 * `new Date()`'s own default -- confirmed directly (not assumed) that
 * `vi.spyOn(Date, 'now')` does NOT make a no-argument `new Date()`
 * deterministic in tests, even without fake timers involved at all.
 */
export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<AwardEvent[]>([]);

  useEffect(() => {
    setEvents(readStorage());
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    loadFirestoreFor(user.uid).then(async ({ progressRef, leaderboardRef, getDoc, setDoc, onSnapshot }) => {
      if (cancelled) return;
      const snap = await getDoc(progressRef);
      const remoteEvents: AwardEvent[] = Array.isArray(snap.data()?.gamificationEvents) ? snap.data()!.gamificationEvents : [];
      const merged = mergeEvents(remoteEvents, readStorage());
      if (cancelled) return;
      await Promise.all([
        setDoc(progressRef, { gamificationEvents: merged }, { merge: true }),
        setDoc(leaderboardRef, leaderboardFields(user, merged, Date.now()), { merge: true }),
      ]);
      if (cancelled) return;

      unsubscribe = onSnapshot(progressRef, (snap) => {
        if (cancelled) return;
        const remote: AwardEvent[] = Array.isArray(snap.data()?.gamificationEvents) ? snap.data()!.gamificationEvents : [];
        setEvents(remote);
        writeStorage(remote);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, authLoading]);

  const commit = useCallback(
    (next: AwardEvent[]) => {
      if (user) {
        loadFirestoreFor(user.uid).then(({ progressRef, leaderboardRef, setDoc }) => {
          void setDoc(progressRef, { gamificationEvents: next });
          void setDoc(leaderboardRef, leaderboardFields(user, next, Date.now()), { merge: true });
        });
      } else {
        setEvents(next);
        writeStorage(next);
      }
    },
    [user],
  );

  const award = useCallback(
    (permalink: string, kind: AwardEvent['kind'], points: number) => {
      if (hasAward(events, permalink, kind)) return; // already awarded once, ever -- no double-counting on repeat marks/reruns
      commit([...events, { permalink, kind, date: localDateString(new Date(Date.now())), points }]);
    },
    [events, commit],
  );

  const awardMarkUnderstood = useCallback((permalink: string) => award(permalink, 'mark', MARK_UNDERSTOOD_POINTS), [award]);
  const awardProblemCompleted = useCallback((permalink: string) => award(permalink, 'complete', PROBLEM_COMPLETED_POINTS), [award]);
  const awardSystemDesignCompleted = useCallback(
    (permalink: string) => award(permalink, 'design', SYSTEM_DESIGN_CHALLENGE_POINTS),
    [award],
  );

  const now = new Date(Date.now());
  const value: GamificationContextValue = {
    points: totalPoints(events),
    weeklyPoints: computeWeeklyPoints(events, now),
    streak: computeStreak(
      events.map((e) => e.date),
      now,
    ),
    events,
    awardMarkUnderstood,
    awardProblemCompleted,
    awardSystemDesignCompleted,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return ctx;
}
