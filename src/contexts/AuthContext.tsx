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
  /** Real Firebase email/password sign-up. Deliberately does NOT pre-check
   * fetchSignInMethodsForEmail before calling this -- Firebase's own
   * "one account per email address" project setting (the default, and
   * left untouched here) already rejects createUserWithEmailAndPassword
   * with `auth/email-already-in-use` for an email that's registered under
   * ANY provider, including an existing Google sign-in -- that's the real
   * mechanism that keeps one person from ending up with two disconnected
   * identities, not a client-side check that could race or be bypassed.
   * Callers should catch that error code and point the visitor at Google
   * sign-in instead, never silently retry as a fresh account. */
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
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

    Promise.all([import('../lib/firebase'), import('firebase/auth')]).then(
      ([{ auth }, { onAuthStateChanged, getRedirectResult }]) => {
        if (cancelled) return;
        getRedirectResult(auth).catch(() => {});

        unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      },
    );

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const [{ auth }, { GoogleAuthProvider, signInWithPopup, signInWithRedirect }] = await Promise.all([
      import('../lib/firebase'),
      import('firebase/auth'),
    ]);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        /iPhone|iPad|iPod|Android/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '')
      ) {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const [{ auth }, { createUserWithEmailAndPassword }] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOutUser = useCallback(async () => {
    const [{ auth, db }, { signOut }, { disableNetwork, enableNetwork }] = await Promise.all([
      import('../lib/firebase'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    await signOut(auth);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('neural-mastery-gamification');
      window.localStorage.removeItem('neural-mastery-progress');
    }
    // Force Firestore to drop and cleanly re-establish its underlying
    // streaming connection on sign-out, rather than letting it keep
    // reusing a connection that was live under the OLD credentials.
    // Confirmed live (via a real production repro) that without this,
    // signing back in soon after can leave Firestore reads/writes
    // throwing "Missing or insufficient permissions" for several seconds
    // -- a documented Firebase SDK behavior where its internal connection
    // doesn't always cleanly adopt a new auth session mid-tab, especially
    // with multiple active onSnapshot listeners (this app has three:
    // GamificationContext, ProgressContext, useLeaderboard). Disabling
    // then re-enabling the network forces a genuinely fresh connection
    // instead of hoping the stale one recovers on its own.
    await disableNetwork(db).catch(() => {});
    await enableNetwork(db).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser }),
    [user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
