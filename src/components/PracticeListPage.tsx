import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getPracticeProblems, type DocPage, type PracticeDifficulty } from '../lib/contentTree';
import { useGamification } from '../contexts/GamificationContext';
import { hasAward, pointsForDifficulty, SYSTEM_DESIGN_CHALLENGE_POINTS } from '../lib/gamification';
import { practiceStats } from '../lib/mastery';
import { buildTopicLabels, getPracticeTracks } from '../lib/practiceTracks';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const DIFFICULTY_COLOR: Record<PracticeDifficulty, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

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
  const problems = useMemo(() => getPracticeProblems(), []);
  const placeholderCount = useMemo(() => problems.filter((p) => p.placeholder).length, [problems]);
  const realCount = problems.length - placeholderCount;

  // Real, verified count leading first -- never inflated with placeholders.
  useDocumentTitle(`Practice AI — ${realCount} Real, Hands-On Problems (${placeholderCount} more being added)`);
  useDocumentMeta('Practice AI', `A growing AI Engineering practice curriculum with ${realCount} real, hands-on problems (${placeholderCount} more being added) covering Agentic AI, Transformers, RAG, MCP, Graphs, Math, NumPy, ML, and Systems.`);

  const topicLabels = useMemo(buildTopicLabels, []);
  const { events } = useGamification();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | PracticeDifficulty | 'design'>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'roadmap' | 'table'>('roadmap');

  // Real tracks (topic + real problem count), computed from the actual
  // catalogue -- never hardcoded, so this always reflects real shipped
  // content. Sorted by count descending for the "Explore by Track & Tag"
  // card grid; a separate alphabetical view feeds the topic filter dropdown.
  const tracks = useMemo(() => getPracticeTracks(problems), [problems]);
  const tracksByLabel = useMemo(() => [...tracks].sort((a, b) => a.label.localeCompare(b.label)), [tracks]);
  const topics = useMemo(() => tracksByLabel.map((t) => t.topic), [tracksByLabel]);
  const topicCounts = useMemo(() => Object.fromEntries(tracks.map((t) => [t.topic, t.count])), [tracks]);

  const solvedCount = problems.filter((p) => hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')).length;
  const stats = practiceStats(problems, events);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
    if (difficultyFilter === 'design') return isDesignChallenge(p);
    if (difficultyFilter !== 'all') return p.difficulty === difficultyFilter;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const displayedProblems = filtered.slice((activePage - 1) * pageSize, activePage * pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <section style={{ maxWidth: 1350, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', margin: '0 0 0.5rem' }}>
              Practice AI — {realCount} Real, Hands-On Problems ({placeholderCount} more being added)
            </h1>
            <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.6, maxWidth: 780 }}>
              {realCount} real AI engineering problems with working test suites and instant browser-based execution, covering the Agentic AI Stack (Transformers, Decoding, Context, RAG, Agent Loops, MCP, Graph Engineering, Multi-Agent Systems) as well as AI Foundations (DSA for AI, Math, NumPy, Pandas, Classical ML, Deep Learning, and Distributed Systems). {placeholderCount} additional problem templates across the full catalogue are actively being populated with verified challenges.
            </p>
            <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '0 0 1.5rem' }}>
              {solvedCount} / {problems.length} solved
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--nm-surface)', padding: 4, borderRadius: 10, border: '1px solid var(--nm-border)' }}>
            <button
              onClick={() => setViewMode('roadmap')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'roadmap' ? 'var(--nm-accent-primary)' : 'transparent',
                color: viewMode === 'roadmap' ? '#fff' : 'var(--nm-text-muted)',
              }}
            >
              Curriculum Roadmap
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--nm-accent-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--nm-text-muted)',
              }}
            >
              All Catalogue ({problems.length})
            </button>
          </div>
        </div>

        <div>
            <div className="nm-mastery-metrics" aria-label="Practice progress">
              <div><strong>{stats.solved}</strong><span>problems solved</span></div>
              <div><strong>{stats.total - stats.solved}</strong><span>ready to solve</span></div>
              <div><strong>{stats.easySolved}/{stats.mediumSolved}/{stats.hardSolved}</strong><span>easy / medium / hard</span></div>
            </div>

            <div className="nm-practice-tracks" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.7rem', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--nm-text-primary)' }}>Explore by Track &amp; Tag</h2>
                <span style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>{tracks.length} tracks</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '0.7rem',
                }}
              >
                {tracks.map((track) => (
                  <Link
                    key={track.slug}
                    to={`/practice/track/${track.slug}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '0.85rem 1rem',
                      minHeight: 84,
                      borderRadius: 12,
                      border: '1px solid var(--nm-border)',
                      background: 'var(--nm-surface)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--nm-text-primary)', lineHeight: 1.3 }}>{track.label}</span>
                    <span
                      style={{
                        alignSelf: 'flex-start',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: 10,
                        background: 'color-mix(in srgb, var(--nm-accent-primary) 12%, var(--nm-surface))',
                        color: 'var(--nm-accent-primary)',
                      }}
                    >
                      {track.count} problem{track.count === 1 ? '' : 's'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search practice problems..."
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
            onChange={(e) => {
              setDifficultyFilter(e.target.value as typeof difficultyFilter);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setTopicFilter(e.target.value);
              setCurrentPage(1);
            }}
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
                {topicLabels[t] ?? t} ({topicCounts[t] ?? 0})
              </option>
            ))}
          </select>
        </div>

        {/* Catalogue Table */}
        <div id="practice-catalogue" style={{ borderRadius: 12, border: '1px solid var(--nm-border)', overflow: 'hidden', scrollMarginTop: 90 }}>
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

          {displayedProblems.length === 0 ? (
            <p style={{ margin: 0, padding: '1.5rem 1rem', fontSize: 13, color: 'var(--nm-text-muted)', textAlign: 'center' }}>
              No problems match these filters.
            </p>
          ) : (
            displayedProblems.map((p, i) => {
              const design = isDesignChallenge(p);
              const solved = hasAward(events, p.route, design ? 'design' : 'complete');
              const points = design ? SYSTEM_DESIGN_CHALLENGE_POINTS : pointsForDifficulty(p.difficulty);
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

        {/* 100-per-Page Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: 13, color: 'var(--nm-text-muted)' }}>
              Showing {((activePage - 1) * pageSize) + 1}–{Math.min(activePage * pageSize, filtered.length)} of {filtered.length} problems (Page {activePage} of {totalPages})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: '1px solid var(--nm-border)',
                  background: activePage === 1 ? 'transparent' : 'var(--nm-surface)',
                  color: activePage === 1 ? 'var(--nm-text-muted)' : 'var(--nm-text-primary)',
                  cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                  opacity: activePage === 1 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                // Show first, last, current, and surrounding 1 page
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= activePage - 1 && pageNum <= activePage + 1)
                ) {
                  const isCurrent = pageNum === activePage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        minWidth: 34,
                        padding: '0.45rem 0.6rem',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: isCurrent ? '1.5px solid var(--nm-accent-primary)' : '1px solid var(--nm-border)',
                        background: isCurrent ? 'var(--nm-accent-primary)' : 'var(--nm-surface)',
                        color: isCurrent ? '#fff' : 'var(--nm-text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === 2 && activePage > 3) ||
                  (pageNum === totalPages - 1 && activePage < totalPages - 2)
                ) {
                  return <span key={pageNum} style={{ fontSize: 12, color: 'var(--nm-text-muted)', padding: '0 2px' }}>…</span>;
                }
                return null;
              })}

              <button
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: '1px solid var(--nm-border)',
                  background: activePage === totalPages ? 'transparent' : 'var(--nm-surface)',
                  color: activePage === totalPages ? 'var(--nm-text-muted)' : 'var(--nm-text-primary)',
                  cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: activePage === totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
          </div>

      </section>
    </div>
  );
}


