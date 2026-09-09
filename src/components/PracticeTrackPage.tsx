import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getPracticeProblems, type DocPage } from '../lib/contentTree';
import { findTrackBySlug } from '../lib/practiceTracks';
import { useGamification } from '../contexts/GamificationContext';
import { hasAward, pointsForDifficulty, SYSTEM_DESIGN_CHALLENGE_POINTS } from '../lib/gamification';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

function isDesignChallenge(page: DocPage): boolean {
  return !page.difficulty;
}

/** A dedicated screen for one practice track, reached by clicking a
 * card in "Practice Tracks" on /practice. Shows only that track's
 * real problems -- a real destination, not just an in-place filter. */
export default function PracticeTrackPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const problems = useMemo(() => getPracticeProblems(), []);
  const track = useMemo(() => (topicSlug ? findTrackBySlug(problems, topicSlug) : undefined), [problems, topicSlug]);

  const { events } = useGamification();

  useDocumentTitle(track ? `${track.label} — ${track.count} Practice Problems` : 'Track not found');
  useDocumentMeta(
    track ? track.label : 'Track not found',
    track ? `${track.count} real, hands-on ${track.label} practice problems with working test suites and instant browser-based execution.` : 'This track does not exist.',
  );

  if (!track) {
    return <Navigate to="/practice" replace />;
  }

  const trackProblems = problems.filter((p) => p.topic === track.topic);
  const solvedCount = trackProblems.filter((p) => hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <Link to="/practice" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-accent-primary)', textDecoration: 'none' }}>
          ← All tracks
        </Link>

        <h1 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', margin: '0.75rem 0 0.4rem' }}>
          {track.label}
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--nm-text-muted)', margin: '0 0 2rem' }}>
          {solvedCount} / {track.count} solved
        </p>

        <div style={{ borderRadius: 12, border: '1px solid var(--nm-border)', overflow: 'hidden' }}>
          {trackProblems.map((p, i) => {
            const design = isDesignChallenge(p);
            const solved = hasAward(events, p.route, design ? 'design' : 'complete');
            const points = design ? SYSTEM_DESIGN_CHALLENGE_POINTS : pointsForDifficulty(p.difficulty);
            return (
              <Link
                key={p.route}
                to={p.route}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0.75rem 1rem',
                  borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                  textDecoration: 'none',
                  background: solved ? 'color-mix(in srgb, var(--nm-accent-primary) 5%, transparent)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 13.5, color: 'var(--nm-text-primary)', fontWeight: 600 }}>{p.title.replace(/^Practice:\s*/, '')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: design ? 'var(--nm-accent-secondary)' : DIFFICULTY_COLOR[p.difficulty ?? 'easy'] }}>
                    {design ? 'Design' : p.difficulty}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--nm-text-muted)' }}>{points} pts</span>
                  <span style={{ fontSize: 13 }}>{solved ? '✓' : ''}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
