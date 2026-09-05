import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getPracticeProblems, type DocPage, type PracticeDifficulty } from '../lib/contentTree';
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta';
import { useGamification } from '../contexts/GamificationContext';
import { hasAward, PROBLEM_COMPLETED_POINTS, SYSTEM_DESIGN_CHALLENGE_POINTS } from '../lib/gamification';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const DIFFICULTY_COLOR: Record<PracticeDifficulty, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

/** dir (e.g. "mathematics-for-ai") -> its real, human label (e.g.
 * "Mathematics for AI") -- the same `topic:` frontmatter values Phase 2
 * tagged every problem with ARE these exact subsection dirs (deliberately,
 * see the taxonomy coordination with the Phase 2 session), so this is
 * just a lookup, not a second taxonomy. */
function buildTopicLabels(): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const key of SECTION_ORDER) {
    for (const sub of SECTION_META[key].subsections) labels[sub.dir] = sub.label;
  }
  return labels;
}

/** A problem with no `difficulty` frontmatter is one of the 4 system-design
 * challenges (Phase 2 verified this is the ONLY reason difficulty is ever
 * absent -- see the frontmatter coordination) -- a genuinely different
 * problem shape (free-text + rubric, self-assessed, no test suite) that
 * gets its own tag and point value rather than a fabricated Easy/Medium/Hard
 * label. */
function isDesignChallenge(page: DocPage): boolean {
  return !page.difficulty;
}

export default function PracticeListPage() {
  useDocumentTitle('Practice AI');
  useDocumentMeta('Practice AI', 'Real coding problems, linear algebra to RL -- implement it yourself in an in-browser Python sandbox, run against real tests, no LLM grading.');

  const problems = useMemo(() => getPracticeProblems(), []);
  const topicLabels = useMemo(buildTopicLabels, []);
  const { events } = useGamification();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | PracticeDifficulty | 'design'>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | string>('all');

  const topics = useMemo(() => {
    const set = new Set(problems.map((p) => p.topic).filter((t): t is string => !!t));
    return Array.from(set).sort((a, b) => (topicLabels[a] ?? a).localeCompare(topicLabels[b] ?? b));
  }, [problems, topicLabels]);

  const solvedCount = problems.filter((p) => hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')).length;

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
    if (difficultyFilter === 'design') return isDesignChallenge(p);
    if (difficultyFilter !== 'all') return p.difficulty === difficultyFilter;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', margin: '0 0 0.5rem' }}>
          Practice AI
        </h1>
        <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.6, maxWidth: 680 }}>
          Short, focused coding problems — implement the function yourself in a real, in-browser Python
          sandbox, run it against real test cases (pass/fail, no LLM grading), then reveal a reference
          solution with the reasoning behind it. Inspired by the format of{' '}
          <a href="https://www.deep-ml.com/problems" target="_blank" rel="noreferrer" style={{ color: 'var(--nm-accent-primary)' }}>
            deep-ml.com
          </a>{' '}
          — original problems, tied to the concept pages already on this site.
        </p>
        <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '0 0 2rem' }}>
          {solvedCount} / {problems.length} solved
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            aria-label="Search practice problems by title"
            style={{
              flex: '1 1 220px',
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-surface)',
              color: 'var(--nm-text-primary)',
              fontSize: 13,
            }}
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
            aria-label="Filter by difficulty"
            style={{
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-surface)',
              color: 'var(--nm-text-primary)',
              fontSize: 13,
            }}
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="design">Design Challenge</option>
          </select>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            aria-label="Filter by topic"
            style={{
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-surface)',
              color: 'var(--nm-text-primary)',
              fontSize: 13,
            }}
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {topicLabels[t] ?? t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ borderRadius: 12, border: '1px solid var(--nm-border)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 110px 160px 90px 70px',
              gap: 8,
              padding: '0.6rem 1rem',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--nm-text-muted)',
              background: 'var(--nm-surface)',
              borderBottom: '1px solid var(--nm-border)',
            }}
          >
            <span>Title</span>
            <span>Difficulty</span>
            <span>Topic</span>
            <span>Status</span>
            <span>Points</span>
          </div>

          {filtered.length === 0 ? (
            <p style={{ margin: 0, padding: '1.5rem 1rem', fontSize: 13, color: 'var(--nm-text-muted)', textAlign: 'center' }}>
              No problems match these filters.
            </p>
          ) : (
            filtered.map((p, i) => {
              const design = isDesignChallenge(p);
              const solved = hasAward(events, p.route, design ? 'design' : 'complete');
              const points = design ? SYSTEM_DESIGN_CHALLENGE_POINTS : PROBLEM_COMPLETED_POINTS;
              return (
                <Link
                  key={p.route}
                  to={p.route}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 110px 160px 90px 70px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '0.65rem 1rem',
                    borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                    textDecoration: 'none',
                    background: solved ? 'color-mix(in srgb, var(--nm-accent-primary) 5%, transparent)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 13.5, color: 'var(--nm-text-primary)', fontWeight: 600 }}>{p.title.replace(/^Practice:\s*/, '')}</span>
                  {design ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--nm-accent-purple)',
                        border: '1px solid var(--nm-accent-purple)',
                        borderRadius: 6,
                        padding: '0.1rem 0.4rem',
                        width: 'fit-content',
                      }}
                    >
                      Design
                    </span>
                  ) : (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: DIFFICULTY_COLOR[p.difficulty!], textTransform: 'capitalize' }}>
                      {p.difficulty}
                    </span>
                  )}
                  <span style={{ fontSize: 12.5, color: 'var(--nm-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.topic ? (topicLabels[p.topic] ?? p.topic) : '—'}
                  </span>
                  <span style={{ fontSize: 12.5, color: solved ? 'var(--nm-accent-primary)' : 'var(--nm-text-muted)', fontWeight: solved ? 700 : 400 }}>
                    {solved ? '✓ Solved' : 'Not started'}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--nm-text-muted)' }}>{points} pts</span>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
