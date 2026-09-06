import Navbar from './layout/Navbar';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/**
 * Basic, honest terms matching what this actually is -- a free, solo-
 * maintained educational site, not a company with a legal team. Kept
 * simple rather than lifted from a template that implies infrastructure
 * (a support org, an SLA, a formal dispute process) this project doesn't
 * have.
 */
export default function TermsOfServicePage() {
  useDocumentTitle('Terms of Service');
  useDocumentMeta('Terms of Service', 'The basic, honest terms for using Neural Mastery -- a free educational site.');

  return (
    <div style={{ minHeight: '100%', background: 'var(--nm-bg)' }}>
      <Navbar />
      <main>
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', marginBottom: '0.5rem' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', marginBottom: '2rem' }}>Last updated September 2026.</p>
          <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--nm-text-secondary)' }}>
            <p>
              Neural Mastery is a free educational site, built and maintained by one person. These terms are intentionally
              simple, matching what this actually is — not a template written for a company with a legal department.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--nm-text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
              The service
            </h2>
            <p>
              The site is free to use, with or without a Google sign-in. Signing in adds cross-device sync for your progress,
              points, and streak, and a spot on the leaderboard — it isn't required to read any content or run any practice
              problem.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--nm-text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
              No warranty
            </h2>
            <p>
              The site is provided as-is, with no warranty of any kind. Content may contain errors — if you find one, please
              report it (see the <a href="/about" style={{ color: 'var(--nm-accent-primary)' }}>About page</a>). We make no
              guarantee the site will be available at any given time, or that your data will never be lost, though we have no
              intention of losing it.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--nm-text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Your conduct
            </h2>
            <p>
              Don't attempt to abuse, disrupt, or gain unauthorized access to the site or its backing services (Firebase
              Authentication, Firestore, Analytics). Practice-problem code runs entirely in your own browser (via Pyodide), so
              it can't affect anyone but you.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--nm-text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Changes
            </h2>
            <p>
              These terms, the site's content, and its features may change at any time — this is an actively developed
              project, not a finished, frozen product. Material changes to what data is collected will be reflected in the{' '}
              <a href="/privacy" style={{ color: 'var(--nm-accent-primary)' }}>Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
