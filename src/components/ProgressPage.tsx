import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getSidebar, getFlatPages } from '../lib/contentTree';
import { SECTION_META, SECTION_ORDER, completionFor } from '../data/sectionMeta';
import { useProgress } from '../contexts/ProgressContext';
import { useGamification } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../lib/useLeaderboard';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/** Best-effort title lookup for a permalink -- falls back to the raw path
 * for the (should-be-rare) case a stored permalink no longer matches any
 * current page, e.g. a page that was later renamed or removed. */
function titleFor(route: string, flatPages: ReturnType<typeof getFlatPages>): string {
  return flatPages.find((p) => p.route === route)?.title ?? route;
}

/**
 * The "your progress" surface ProgressContext never had. Two views of the
 * same understood-map: the 7 top-level groups (same completionFor math as
 * LearningPathMap, so the numbers always agree with the learning path
 * page) and, expandable per sidebar section, the actual per-page
 * checklist -- toggleable right here, not just on each page's own
 * Mark as understood button.
 */
export default function ProgressPage() {
  useDocumentTitle('Your Progress');
  useDocumentMeta('Your Progress', 'Track which pages across Neural Mastery you have marked as understood -- tracked locally in your browser, no account required.');

  const { understood, isUnderstood, toggle, countWithin, reset, dueForReview, markReviewed } = useProgress();
  const { points, streak } = useGamification();
  const { user } = useAuth();
  const sections = getSidebar();
  const flatPages = getFlatPages();
  const totalPages = flatPages.length;
  const totalDone = countWithin(flatPages.map((p) => p.route));
  const overallPct = totalPages === 0 ? 0 : totalDone / totalPages;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [leaderboardTab, setLeaderboardTab] = useState<'allTime' | 'weekly'>('allTime');
  const { entries: leaderboardEntries, loading: leaderboardLoading } = useLeaderboard(leaderboardTab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', margin: '0 0 0.5rem' }}>
          Your Progress
        </h1>
        <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
          Tracked locally in your browser via each page's <strong>Mark as understood</strong> button — no account, nothing sent anywhere.
        </p>

        <div style={{ padding: '1.25rem 1.5rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-primary)' }}>Overall</span>
            <span style={{ fontSize: 13, color: 'var(--nm-text-muted)' }}>{totalDone} / {totalPages} pages ({Math.round(overallPct * 100)}%)</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--nm-border)', overflow: 'hidden' }}>
            <div style={{ width: `${overallPct * 100}%`, height: '100%', background: 'var(--nm-accent-primary)', transition: 'width 200ms ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Points</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)' }}>{points}</div>
          </div>
          <div style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)' }}>
              {streak} day{streak === 1 ? '' : 's'}
            </div>
          </div>
        </div>
        {!user && (
          <p style={{ fontSize: 12.5, color: 'var(--nm-text-muted)', margin: '-1.25rem 0 2rem', lineHeight: 1.6 }}>
            Points and streaks are tracked locally in this browser too, but only sync across devices — and only count toward the leaderboard below — once you sign in.
          </p>
        )}

        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          Leaderboard
        </h2>
        <div style={{ borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '2.5rem', overflow: 'hidden' }}>
          {!user ? (
            <p style={{ margin: 0, padding: '1rem 1.25rem', fontSize: 13, color: 'var(--nm-text-muted)', lineHeight: 1.6 }}>
              Sign in to see how your points stack up against other learners.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, padding: '0.75rem 1.25rem 0' }}>
                {(['allTime', 'weekly'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLeaderboardTab(tab)}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      borderRadius: 8,
                      border: `1px solid ${leaderboardTab === tab ? 'var(--nm-accent-primary)' : 'var(--nm-border)'}`,
                      background: leaderboardTab === tab ? 'color-mix(in srgb, var(--nm-accent-primary) 12%, transparent)' : 'transparent',
                      color: leaderboardTab === tab ? 'var(--nm-accent-primary)' : 'var(--nm-text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {tab === 'allTime' ? 'All-time' : 'This week'}
                  </button>
                ))}
              </div>
              <div style={{ padding: '0.5rem 0 0.25rem' }}>
                {leaderboardLoading ? (
                  <p style={{ margin: 0, padding: '0.75rem 1.25rem', fontSize: 13, color: 'var(--nm-text-muted)' }}>Loading…</p>
                ) : leaderboardEntries.length === 0 ? (
                  <p style={{ margin: 0, padding: '0.75rem 1.25rem', fontSize: 13, color: 'var(--nm-text-muted)' }}>
                    {leaderboardTab === 'allTime' ? 'No points on the board yet -- be the first.' : 'No points this week yet -- be the first.'}
                  </p>
                ) : (
                  leaderboardEntries.map((entry, i) => (
                    <div
                      key={entry.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0.5rem 1.25rem',
                        borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                        background: entry.uid === user.uid ? 'color-mix(in srgb, var(--nm-accent-primary) 6%, transparent)' : 'transparent',
                      }}
                    >
                      <span style={{ width: 20, fontSize: 12.5, fontWeight: 700, color: 'var(--nm-text-muted)', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: 'var(--nm-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.displayName}
                        {entry.uid === user.uid && <span style={{ color: 'var(--nm-text-muted)' }}> (you)</span>}
                      </span>
                      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'var(--nm-accent-primary)' }}>{entry.points} pts</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          Due for review
        </h2>
        <div style={{ borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '2.5rem', overflow: 'hidden' }}>
          {dueForReview.length === 0 ? (
            <p style={{ margin: 0, padding: '1rem 1.25rem', fontSize: 13, color: 'var(--nm-text-muted)', lineHeight: 1.6 }}>
              Nothing due right now. Pages you mark understood get a simple spaced-repetition schedule (review reminders at 1, 3, 7, 14, and 30 days) —
              they&rsquo;ll show up here once one comes due.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {dueForReview.map((route, i) => (
                <div
                  key={route}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.65rem 1.25rem',
                    borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                  }}
                >
                  <Link to={route} style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: 'var(--nm-text-primary)', textDecoration: 'none' }}>
                    {titleFor(route, flatPages)}
                  </Link>
                  <button
                    type="button"
                    onClick={() => markReviewed(route)}
                    style={{
                      flexShrink: 0,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--nm-accent-primary)',
                      background: 'color-mix(in srgb, var(--nm-accent-primary) 12%, transparent)',
                      border: `1px solid var(--nm-accent-primary)`,
                      borderRadius: 8,
                      padding: '0.35rem 0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reviewed
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          By learning-path group
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2.5rem' }}>
          {SECTION_ORDER.map((key) => {
            const meta = SECTION_META[key];
            const pct = completionFor(key, understood);
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.65rem 0.9rem', borderRadius: 10, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)' }}>
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--nm-text-primary)', marginBottom: 4 }}>{meta.label}</div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--nm-border)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct * 100}%`, height: '100%', background: meta.color, transition: 'width 200ms ease' }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--nm-text-muted)', flexShrink: 0 }}>{Math.round(pct * 100)}%</span>
              </div>
            );
          })}
        </div>

        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          By section — click a page to toggle it
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2.5rem' }}>
          {sections.map((section) => {
            const done = countWithin(section.pages.map((p) => p.route));
            const isOpen = !!expanded[section.id];
            return (
              <div key={section.id} style={{ borderRadius: 10, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0.9rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--nm-text-primary)', fontSize: 13.5, fontWeight: 600 }}
                >
                  <span>{isOpen ? '▾' : '▸'} {section.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--nm-text-muted)', fontWeight: 400 }}>{done} / {section.pages.length}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 0.9rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {section.pages.map((page) => {
                      const done = isUnderstood(page.route);
                      return (
                        <div key={page.route} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.35rem 0' }}>
                          <button
                            type="button"
                            onClick={() => toggle(page.route)}
                            aria-pressed={done}
                            aria-label={done ? `Mark ${page.title} as not understood` : `Mark ${page.title} as understood`}
                            style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 5, border: `1.5px solid ${done ? 'var(--nm-accent-primary)' : 'var(--nm-border)'}`, background: done ? 'var(--nm-accent-primary)' : 'transparent', color: 'var(--nm-bg)', fontSize: 11, lineHeight: '15px', cursor: 'pointer', padding: 0 }}
                          >
                            {done ? '✓' : ''}
                          </button>
                          <Link to={page.route} style={{ fontSize: 13, color: done ? 'var(--nm-text-muted)' : 'var(--nm-text-secondary)', textDecoration: 'none' }}>
                            {page.title}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all progress? This clears every page you\'ve marked as understood.')) reset();
          }}
          style={{ fontSize: 13, color: 'var(--nm-text-muted)', background: 'transparent', border: '1px solid var(--nm-border)', borderRadius: 8, padding: '0.5rem 0.9rem', cursor: 'pointer' }}
        >
          Reset progress
        </button>
      </section>
    </div>
  );
}
