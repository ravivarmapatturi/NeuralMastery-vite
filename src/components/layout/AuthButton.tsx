import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sign-in/sign-out control for the navbar. Signed-out visitors see a
 * circular icon button -- same 32px footprint as the theme toggle right
 * next to it, deliberately NOT a wider "Sign in" text pill (an earlier
 * version used one and it pushed the mobile navbar past the viewport
 * width, caught by tests/smoke.spec.ts's "mobile navigation works"
 * overflow check). Clicking it is the ONLY thing that ever triggers a
 * network call to Firebase Auth; nothing here runs unprompted. Signed-in
 * visitors see their Google avatar (initial-letter fallback if no photo)
 * in that same circular slot, which opens a small account menu (email,
 * a View Profile link to /profile, sign-out) -- the same avatar-click-
 * opens-a-menu pattern any real account UI uses.
 */
export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return null; // avoid flashing "Sign in" before the real (likely signed-in) state is known

  if (!user) {
    return (
      <button
        type="button"
        onClick={async () => {
          setBusy(true);
          try {
            await signInWithGoogle();
          } catch {
            // Popup closed/blocked, or a real network failure -- either way
            // there's nothing more useful to do than let the visitor retry.
          } finally {
            setBusy(false);
          }
        }}
        disabled={busy}
        aria-label={busy ? 'Signing in…' : 'Sign in'}
        title={busy ? 'Signing in…' : 'Sign in'}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          fontSize: 15,
          color: 'var(--nm-text-primary)',
          background: 'transparent',
          border: '1px solid var(--nm-border)',
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {busy ? '…' : '👤'}
      </button>
    );
  }

  const initial = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--nm-border)',
          background: 'var(--nm-accent-primary)',
          color: 'var(--nm-bg)',
          cursor: 'pointer',
          padding: 0,
          overflow: 'hidden',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initial
        )}
      </button>

      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setMenuOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              zIndex: 91,
              minWidth: 200,
              padding: '0.6rem',
              borderRadius: 10,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-surface)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ fontSize: 12.5, color: 'var(--nm-text-secondary)', padding: '0.2rem 0.3rem 0.6rem', wordBreak: 'break-all' }}>
              {user.email}
            </div>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                fontSize: 13,
                color: 'var(--nm-text-primary)',
                textDecoration: 'none',
                borderRadius: 6,
                padding: '0.4rem 0.3rem',
              }}
            >
              View Profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                setMenuOpen(false);
                await signOutUser();
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                fontSize: 13,
                color: 'var(--nm-text-primary)',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                padding: '0.4rem 0.3rem',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
