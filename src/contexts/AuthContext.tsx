import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';

interface AuthContextValue {
  /** null while the initial auth-state check is still in flight, undefined
   * (never) is not a state this uses -- see `loading` for that distinction. */
  user: User | null;
  /** True only until Firebase's first onAuthStateChanged callback fires --
   * lets a consumer avoid flashing "signed out" UI before the real answer
   * (a persisted session, restored from IndexedDB) is known. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Thin wrapper around Firebase Auth's own state -- mounted once at the app
 * root (alongside ProgressProvider, which reads `user` from here to decide
 * whether to sync against Firestore or stay localStorage-only).
 *
 * firebase/auth is loaded via a dynamic import(), not a static one --
 * bundling it statically was confirmed (via a real production build) to
 * grow the app's eager main entry chunk from ~437kB to over 1.1MB, since
 * every visitor would download the full Firebase Auth SDK before first
 * paint regardless of whether they ever sign in. The dynamic import lets
 * Rollup split it into its own chunk that loads in parallel after first
 * paint instead -- the same fix already applied to this app's katex
 * dependency for the same reason. `type User` is erased at compile time
 * (a type-only import), so it costs nothing at runtime either way.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import('../lib/firebase'), import('firebase/auth')]).then(([{ auth }, { onAuthStateChanged }]) => {
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const [{ auth }, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const signOutUser = useCallback(async () => {
    const [{ auth }, { signOut }] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
    await signOut(auth);
  }, []);

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutUser }), [user, loading, signInWithGoogle, signOutUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
