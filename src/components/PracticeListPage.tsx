import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getPracticeProblems, type DocPage, type PracticeDifficulty } from '../lib/contentTree';
import { useGamification } from '../contexts/GamificationContext';
import {
  hasAward,
  pointsForDifficulty,
  SYSTEM_DESIGN_CHALLENGE_POINTS,
} from '../lib/gamification';
import { recommendedProblem } from '../lib/mastery';
import { getPracticeProblem } from '../lib/practiceProblem';
import { buildTopicLabels, getPracticeTracks } from '../lib/practiceTracks';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import {
  ArrowRightIcon,
} from './icons/PracticeIcons';
import LiveComputation from './home/LiveComputation';

const DIFFICULTY_COLOR: Record<PracticeDifficulty, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

const TOPIC_ACCENTS = [
  'var(--nm-accent-secondary)',
  'var(--nm-accent-teal)',
  'var(--nm-accent-purple)',
  'var(--nm-accent-warn)',
  'var(--nm-accent-primary)',
];

function isDesignChallenge(page: DocPage): boolean {
  return !page.difficulty;
}

export default function PracticeListPage() {
  const problems = useMemo(() => getPracticeProblems(), []);
  const realCount = problems.filter((p) => !p.placeholder).length;

  useDocumentTitle(`Practice AI — ${realCount} Real, Hands-On Problems`);
  useDocumentMeta(
    'Practice AI',
    `A comprehensive AI Engineering practice curriculum with ${realCount} real, hands-on problems covering Agentic AI, Transformers, RAG, MCP, Graphs, Math, NumPy, ML, and Systems.`,
  );

  const topicLabels = useMemo(buildTopicLabels, []);
  const { events } = useGamification();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | PracticeDifficulty | 'design'>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'roadmap' | 'table'>('roadmap');

  const tracks = useMemo(() => getPracticeTracks(problems), [problems]);
  const tracksByLabel = useMemo(() => [...tracks].sort((a, b) => a.label.localeCompare(b.label)), [tracks]);
  const topics = useMemo(() => tracksByLabel.map((t) => t.topic), [tracksByLabel]);
  const topicCounts = useMemo(() => Object.fromEntries(tracks.map((t) => [t.topic, t.count])), [tracks]);

  const solvedCount = problems.filter((p) => hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')).length;

  // Item 1: Continue Learning vs First-Time Foundations Card
  const isFirstTime = solvedCount === 0;

  const targetProblemDoc = useMemo(() => {
    if (isFirstTime) {
      return (
        problems.find(
          (p) =>
            p.topic?.toLowerCase().includes('python') ||
            p.topic?.toLowerCase().includes('foundations') ||
            p.topic?.toLowerCase().includes('linear algebra'),
        ) ?? problems[0]
      );
    }
    return recommendedProblem(problems, events) ?? problems[0];
  }, [isFirstTime, problems, events]);

  const targetProblemMeta = useMemo(() => {
    if (!targetProblemDoc) return null;
    const slug = targetProblemDoc.route.replace(/^\/practice\//, '');
    return getPracticeProblem(slug);
  }, [targetProblemDoc]);

  // Topic mastery stats
  const topicMasteryList = useMemo(() => {
    return tracks.map((track, idx) => {
      const topicProblems = problems.filter((p) => p.topic === track.topic);
      const solved = topicProblems.filter((p) =>
        hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete'),
      ).length;
      const total = topicProblems.length;
      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
      const color = TOPIC_ACCENTS[idx % TOPIC_ACCENTS.length];
      return { track, solved, total, pct, color };
    });
  }, [tracks, problems, events]);

  // Sort order:
  // 1. In-progress tracks (progress > 0% and < 100%) first (what the learner is actively working on),
  //    sorted by percentage solved descending, then total problem count descending.
  // 2. Unstarted tracks (0% progress), sorted by problem count descending (broadest tracks first).
  // 3. Completed tracks (100% progress), sorted by problem count descending.
  const sortedTracks = useMemo(() => {
    const list = [...topicMasteryList].sort((a, b) => {
      const pA = a.solved > 0 && a.solved < a.total ? 0 : a.solved === 0 ? 1 : 2;
      const pB = b.solved > 0 && b.solved < b.total ? 0 : b.solved === 0 ? 1 : 2;
      if (pA !== pB) return pA - pB;
      if (pA === 0) {
        return b.pct - a.pct || b.total - a.total;
      }
      return b.total - a.total;
    });
    return list.map((item, idx) => ({
      ...item,
      color: TOPIC_ACCENTS[idx % TOPIC_ACCENTS.length],
    }));
  }, [topicMasteryList]);

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
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)', overflowX: 'hidden' }}>
      <Navbar />

      <main className="nm-practice-main" style={{ maxWidth: 1350, margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 4rem', boxSizing: 'border-box', width: '100%' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
            maxWidth: '100%',
          }}
        >
          <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: '100%' }}>
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--nm-text-primary)',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              Practice AI — {realCount} Real, Hands-On Problems
            </h1>
            <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: 780, overflowWrap: 'break-word' }}>
              {realCount} real AI engineering problems with working test suites and instant browser-based execution, covering
              the Agentic AI Stack (Transformers, Decoding, Context, RAG, Agent Loops, MCP, Graph Engineering, Multi-Agent Systems)
              as well as AI Foundations (DSA for AI, Math, NumPy, Pandas, Classical ML, Deep Learning, and Distributed Systems).
            </p>
            <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '0 0 1.5rem' }}>
              {solvedCount} / {problems.length} solved
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'var(--nm-surface)',
              padding: 4,
              borderRadius: 8,
              border: '1px solid var(--nm-border)',
              flexWrap: 'wrap',
              maxWidth: '100%',
            }}
          >
            <button
              onClick={() => {
                setViewMode('roadmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'roadmap' ? 'var(--nm-surface-alt)' : 'transparent',
                color: viewMode === 'roadmap' ? 'var(--nm-text-primary)' : 'var(--nm-text-muted)',
              }}
            >
              Curriculum Roadmap
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                const el = document.getElementById('practice-catalogue');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--nm-surface-alt)' : 'transparent',
                color: viewMode === 'table' ? 'var(--nm-text-primary)' : 'var(--nm-text-muted)',
              }}
            >
              All Catalogue ({problems.length})
            </button>
          </div>
        </div>

        {/* Item 1: Continue Learning Card (or Start with Foundations) */}
        {targetProblemDoc && (
          <div
            style={{
              marginBottom: '2.5rem',
              borderRadius: 12,
              border: '1px solid var(--nm-border)',
              background: 'var(--nm-surface)',
              padding: 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              borderLeft: '4px solid var(--nm-accent-primary)',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: 740, minWidth: 0, flex: '1 1 260px' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--nm-accent-primary)',
                  marginBottom: 6,
                }}
              >
                {isFirstTime ? 'Start with Foundations' : 'Continue Learning'}
              </div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: 19,
                  fontWeight: 700,
                  color: 'var(--nm-text-primary)',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {targetProblemDoc.title.replace(/^Practice:\s*/, '')}
              </h2>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: 'var(--nm-text-secondary)',
                  overflowWrap: 'break-word',
                }}
              >
                {targetProblemMeta?.mission ||
                  targetProblemDoc.description ||
                  'Master essential AI algorithms and engineering practices with live browser validation.'}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {targetProblemDoc.difficulty && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: `color-mix(in srgb, ${DIFFICULTY_COLOR[targetProblemDoc.difficulty]} 12%, transparent)`,
                      color: DIFFICULTY_COLOR[targetProblemDoc.difficulty],
                      border: `1px solid color-mix(in srgb, ${DIFFICULTY_COLOR[targetProblemDoc.difficulty]} 25%, transparent)`,
                    }}
                  >
                    {targetProblemDoc.difficulty}
                  </span>
                )}
                {targetProblemDoc.topic && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: 'var(--nm-surface-alt)',
                      color: 'var(--nm-text-secondary)',
                      border: '1px solid var(--nm-border)',
                    }}
                  >
                    {topicLabels[targetProblemDoc.topic] ?? targetProblemDoc.topic}
                  </span>
                )}
              </div>
            </div>

            <Link
              to={targetProblemDoc.route}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.7rem 1.4rem',
                borderRadius: 8,
                background: 'var(--nm-accent-primary)',
                color: 'var(--nm-bg, #fff)',
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              <span>{isFirstTime ? 'Start First Problem' : 'Continue Problem'}</span>
              <ArrowRightIcon size={14} color="var(--nm-bg, #fff)" />
            </Link>
          </div>
        )}

        {/* Live Computation Showcase */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--nm-text-primary)' }}>
                Live Deterministic Computation
              </h2>
              <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginTop: 2 }}>
                Step-by-step mathematical execution of fundamental AI algorithms
              </div>
            </div>
          </div>
          <LiveComputation />
        </div>

        {/* Practice Tracks */}
        <div className="nm-practice-tracks" style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--nm-text-primary)' }}>
                Practice Tracks
              </h2>
              <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginTop: 2 }}>
                {tracks.length} tracks, your real progress
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>Browse dedicated tracks</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
              gap: '0.85rem',
            }}
          >
            {sortedTracks.map(({ track, solved, total, pct, color }) => (
              <Link
                key={track.slug}
                to={`/practice/track/${track.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--nm-border)',
                  background: 'var(--nm-surface)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-text-primary)', lineHeight: 1.3 }}>
                    {track.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: pct > 0 ? color : 'var(--nm-text-muted)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {solved}/{total} solved
                  </span>
                </div>

                {/* Styled progress bar */}
                <div
                  style={{
                    height: 5,
                    width: '100%',
                    background: 'var(--nm-surface-alt)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 3,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Problems Catalogue */}
        <div id="practice-catalogue" style={{ marginBottom: '2.5rem', scrollMarginTop: 80 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--nm-text-primary)' }}>
                All Problems Catalogue
              </h2>
              <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginTop: 2 }}>
                Search, filter by difficulty or topic, and browse across all {problems.length} problems
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
              Showing {filtered.length} of {problems.length} problems
            </span>
          </div>

          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
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
                borderRadius: 6,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                color: 'var(--nm-text-primary)',
                fontSize: 13,
                maxWidth: '100%',
                boxSizing: 'border-box',
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
                borderRadius: 6,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                color: 'var(--nm-text-primary)',
                fontSize: 13,
                maxWidth: '100%',
                boxSizing: 'border-box',
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
                borderRadius: 6,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                color: 'var(--nm-text-primary)',
                fontSize: 13,
                maxWidth: '100%',
                boxSizing: 'border-box',
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
          <div
            style={{
              borderRadius: 8,
              border: '1px solid var(--nm-border)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
            }}
          >
            <div style={{ minWidth: 620 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px 160px 130px 70px',
                gap: 8,
                padding: '0.6rem 1rem',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--nm-text-muted)',
                background: 'var(--nm-surface-alt)',
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
                    gridTemplateColumns: '1fr 110px 160px 130px 70px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '0.65rem 1rem',
                    borderTop: i === 0 ? 'none' : '1px solid var(--nm-border)',
                    textDecoration: 'none',
                    background: solved ? 'color-mix(in srgb, var(--nm-accent-primary) 3%, transparent)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 13.5, color: 'var(--nm-text-primary)', fontWeight: 500 }}>
                    {p.title.replace(/^Practice:\s*/, '')}
                  </span>
                  {design ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--nm-accent-purple)',
                        border: '1px solid var(--nm-accent-purple)',
                        borderRadius: 4,
                        padding: '0.1rem 0.4rem',
                        width: 'fit-content',
                      }}
                    >
                      Design
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: DIFFICULTY_COLOR[p.difficulty!],
                        textTransform: 'capitalize',
                      }}
                    >
                      {p.difficulty}
                    </span>
                  )}
                  <span style={{ fontSize: 12.5, color: 'var(--nm-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.topic ? (topicLabels[p.topic] ?? p.topic) : '—'}
                  </span>
                  <span style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {solved ? (
                      <span style={{ color: 'var(--nm-accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        ✓ Solved
                      </span>
                    ) : (
                      <span style={{ color: 'var(--nm-text-muted)' }}>Not started</span>
                    )}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>{points} pts</span>
                </Link>
              );
            })
          )}
          </div>
        </div>

        {/* 100-per-Page Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', maxWidth: '100%' }}>
            <span style={{ fontSize: 12.5, color: 'var(--nm-text-muted)' }}>
              Showing {(activePage - 1) * pageSize + 1}–{Math.min(activePage * pageSize, filtered.length)} of {filtered.length} problems (Page {activePage} of {totalPages})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
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
                        minWidth: 32,
                        padding: '0.4rem 0.55rem',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        border: isCurrent ? '1px solid var(--nm-accent-primary)' : '1px solid var(--nm-border)',
                        background: isCurrent ? 'var(--nm-accent-primary)' : 'var(--nm-surface)',
                        color: isCurrent ? 'var(--nm-bg, #fff)' : 'var(--nm-text-primary)',
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
                  padding: '0.4rem 0.8rem',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
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
      </main>
    </div>
  );
}
