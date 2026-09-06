import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import ActivityHeatmap from './ActivityHeatmap';
import TopicBreakdownBars from './TopicBreakdownBars';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { useLeaderboard } from '../lib/useLeaderboard';
import { levelForPoints, computeDisplayName } from '../lib/gamification';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { getFlatPages, getPracticeProblems } from '../lib/contentTree';
import { useProgress } from '../contexts/ProgressContext';
import { SECTION_META, SECTION_ORDER, completionFor } from '../data/sectionMeta';
import { nextLesson, practiceStats, recommendedProblem, cleanPracticeTitle } from '../lib/mastery';

/**
 * The site's one real "this is you" identity page -- avatar, display name,
 * level/XP, where your points came from (by topic), a real activity
 * calendar, and the leaderboard. Deliberately the ONLY place these live
 * (moved here from ProgressPage, which used to carry Points/Streak +
 * Leaderboard alongside its own, unrelated per-page checklist) so the site
 * never has two disconnected pages both claiming to be "your account."
 * `/progress` stays focused on its own detailed page-by-page completion
 * checklist and spaced-repetition review queue; this page cross-links to
 * it rather than duplicating it.
 */
export default function ProfilePage() {
  useDocumentTitle('Your Profile');
  useDocumentMeta('Your Profile', 'Your Neural Mastery identity -- level, XP, streak, topic breakdown, activity calendar, and the leaderboard.');

  const { user } = useAuth();
  const { points, streak, events } = useGamification();
  const { understood, countWithin } = useProgress();
  const [leaderboardTab, setLeaderboardTab] = useState<'allTime' | 'weekly'>('allTime');
  const { entries: leaderboardEntries, loading: leaderboardLoading } = useLeaderboard(leaderboardTab);

  const displayName = computeDisplayName(user);
  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase();
  const { level, xpIntoLevel, xpForNextLevel } = levelForPoints(points);
  const levelPct = xpForNextLevel === 0 ? 1 : xpIntoLevel / xpForNextLevel;
  const learnPages = getFlatPages();
  const problems = getPracticeProblems();
  const lessonsCompleted = countWithin(learnPages.map((page) => page.route));
  const stats = practiceStats(problems, events);
  const next = nextLesson(learnPages, understood);
  const nextProblem = recommendedProblem(problems, events, next);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '2.5rem 2rem 3rem' }}>
        {/* --- Identity header --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              flexShrink: 0,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-accent-primary)',
              color: 'var(--nm-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              overflow: 'hidden',
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: 'var(--nm-text-primary)', margin: 0 }}>
              {displayName}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '2px 0 0' }}>
              {user ? `Synced across your devices (${user.email ?? 'Signed in'})` : 'Guest Mode (Signed Out) -- Tracked locally in this browser. Sign in to sync across devices.'}
            </p>
          </div>
        </div>

        {/* --- Level / XP --- */}
        <div style={{ padding: '1.25rem 1.5rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-primary)' }}>Level {level}</span>
            <span style={{ fontSize: 13, color: 'var(--nm-text-muted)' }}>
              {xpIntoLevel} / {xpForNextLevel} XP to level {level + 1}
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--nm-border)', overflow: 'hidden' }}>
            <div style={{ width: `${levelPct * 100}%`, height: '100%', background: 'var(--nm-accent-primary)', transition: 'width 200ms ease' }} />
          </div>
        </div>

        {/* --- Points / Streak --- */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Points</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)' }}>{points}</div>
          </div>
          <div style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)' }}>
              {streak} day{streak === 1 ? '' : 's'}
            </div>
            {streak === 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--nm-text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                {events.length === 0
                  ? 'Mark a page understood or solve a practice problem to start your streak.'
                  : 'Streak reset — do that again today to start a new one.'}
              </div>
            )}
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--nm-text-muted)', margin: '-0.5rem 0 2rem', lineHeight: 1.6 }}>
          Want the detailed page-by-page checklist and spaced-repetition review queue? That still lives on{' '}
          <Link to="/progress" style={{ color: 'var(--nm-accent-primary)' }}>your Progress page</Link>.
        </p>

        <section className="nm-profile-mastery" aria-labelledby="mastery-overview">
          <div className="nm-profile-section-heading"><p className="nm-eyebrow">Your AI engineering system</p><h2 id="mastery-overview">Mastery overview</h2></div>
          <div className="nm-mastery-metrics">
            <div><strong>{lessonsCompleted}</strong><span>lessons understood</span></div>
            <div><strong>{stats.solved}</strong><span>problems solved</span></div>
            <div><strong>{Math.round((lessonsCompleted + stats.solved) / Math.max(1, learnPages.length + problems.length) * 100)}%</strong><span>measured completion</span></div>
          </div>
          <div className="nm-next-action">
            <div><p className="nm-eyebrow">Your next best step</p><h3>{next?.title ?? 'Continue expanding your practice'}</h3><p>{next ? 'The first unfinished lesson in your real curriculum sequence.' : 'You have completed the currently tracked lessons.'}</p></div>
            <div className="nm-next-action-links">
              {next && <Link className="nm-button nm-button-primary" to={next.route}>Continue lesson →</Link>}
              {nextProblem && <Link className="nm-button nm-button-secondary" to={nextProblem.route}>Practice: {cleanPracticeTitle(nextProblem.title)} →</Link>}
            </div>
          </div>
        </section>

        <section className="nm-profile-mastery" aria-labelledby="skill-map">
          <div className="nm-profile-section-heading"><p className="nm-eyebrow">Skill map</p><h2 id="skill-map">Where your learning has depth.</h2><p>Calculated from lessons you have actually marked understood; unstarted domains stay visible so the map shows your route forward.</p></div>
          <div className="nm-skill-map">
            {SECTION_ORDER.map((key) => {
              const meta = SECTION_META[key];
              const pct = completionFor(key, understood);
              return <div key={key} className="nm-skill-row"><span>{meta.icon} {meta.label}</span><div aria-label={`${meta.label}: ${Math.round(pct * 100)}% complete`}><i style={{ width: `${pct * 100}%`, background: meta.color }} /></div><strong>{Math.round(pct * 100)}%</strong></div>;
            })}
          </div>
        </section>

        {/* --- Activity heatmap --- */}
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          Activity
        </h2>
        <div style={{ padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '2.5rem' }}>
          <ActivityHeatmap events={events} />
        </div>

        {/* --- Topic breakdown --- */}
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          Where your points came from
        </h2>
        <div style={{ marginBottom: '2.5rem' }}>
          <TopicBreakdownBars events={events} />
        </div>

        {/* --- Leaderboard --- */}
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: '0.9rem' }}>
          Leaderboard
        </h2>
        <div style={{ borderRadius: 12, border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', marginBottom: '2rem', overflow: 'hidden' }}>
          {(() => {
            let entries = [...leaderboardEntries];
            const currentPts = leaderboardTab === 'allTime' ? points : (leaderboardEntries.find(e => e.uid === user?.uid)?.points ?? points);
            const userUid = user?.uid ?? 'local-visitor';
            const userInEntries = entries.some((e) => e.uid === userUid || (user && e.displayName === displayName));
            if (!userInEntries && currentPts > 0) {
              entries.push({
                uid: userUid,
                displayName,
                points: currentPts,
              });
              entries.sort((a, b) => b.points - a.points);
            }

            return (
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
                  ) : entries.length === 0 ? (
                    <p style={{ margin: 0, padding: '0.75rem 1.25rem', fontSize: 13, color: 'var(--nm-text-muted)' }}>
                      {leaderboardTab === 'allTime' ? 'No points on the board yet -- be the first.' : 'No points this week yet -- be the first.'}
                    </p>
                  ) : (
                    entries.map((entry, i) => {
                      const isSelf = entry.uid === userUid || (user && entry.displayName === displayName);
                      return (
                        <div
                          key={entry.uid || i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '0.5rem 1.25rem',
                            borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                            background: isSelf ? 'color-mix(in srgb, var(--nm-accent-primary) 8%, transparent)' : 'transparent',
                          }}
                        >
                          <span style={{ width: 20, fontSize: 12.5, fontWeight: 700, color: 'var(--nm-text-muted)', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: isSelf ? 'var(--nm-accent-primary)' : 'var(--nm-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelf ? 700 : 400 }}>
                            {entry.displayName}
                            {isSelf && <span style={{ color: 'var(--nm-accent-primary)', fontSize: 12 }}> (you)</span>}
                          </span>
                          <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'var(--nm-accent-primary)' }}>{entry.points} pts</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
