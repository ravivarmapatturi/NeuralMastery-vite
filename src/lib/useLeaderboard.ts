import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  points: number;
}

/**
 * Real-time top-N ranking from the public `leaderboard` Firestore
 * collection (see GamificationContext for why this is a SEPARATE
 * collection from the private per-user `progress/{uid}` document -- that
 * one's security rules correctly block cross-user reads, so a ranking
 * query genuinely cannot run against it).
 *
 * Signed-in only, by design: leaderboard ranking is inherently a
 * signed-in feature (a signed-out visitor has no persistent identity to
 * rank in the first place, same reasoning as points/streaks themselves).
 * Returns an empty, non-loading result for a signed-out visitor rather
 * than attempting a query the security rules would reject anyway.
 */
export function useLeaderboard(sortBy: 'allTime' | 'weekly', limitN = 10): { entries: LeaderboardEntry[]; loading: boolean } {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);

    Promise.all([import('../lib/firebase'), import('firebase/firestore')]).then(([{ db }, { collection, query, orderBy, limit, onSnapshot }]) => {
      if (cancelled) return;
      const field = sortBy === 'allTime' ? 'allTimePoints' : 'weeklyPoints';
      const q = query(collection(db, 'leaderboard'), orderBy(field, 'desc'), limit(limitN));
      unsubscribe = onSnapshot(q, (snap) => {
        if (cancelled) return;
        const rows: LeaderboardEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            displayName: typeof data.displayName === 'string' ? data.displayName : 'Learner',
            points: (sortBy === 'allTime' ? data.allTimePoints : data.weeklyPoints) ?? 0,
          };
        });
        setEntries(rows);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, sortBy, limitN]);

  return { entries, loading };
}
