import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'neural-mastery-progress';

type UnderstoodMap = Record<string, boolean>;

interface ProgressContextValue {
  understood: UnderstoodMap;
  toggle: (permalink: string) => void;
  isUnderstood: (permalink: string) => boolean;
  countWithin: (permalinks: string[]) => number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readStorage(): UnderstoodMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
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

/**
 * Local-only (no account, nothing sent anywhere) "have I marked this page
 * understood" tracker, keyed by permalink. Mounted once at the app root so
 * every page shares the same state without prop drilling.
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
        next[permalink] = true;
      }
      writeStorage(next);
      return next;
    });
  }, []);

  const isUnderstood = useCallback((permalink: string) => !!understood[permalink], [understood]);

  const countWithin = useCallback(
    (permalinks: string[]) => permalinks.filter((p) => understood[p]).length,
    [understood],
  );

  return (
    <ProgressContext.Provider value={{ understood, toggle, isUnderstood, countWithin }}>
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
