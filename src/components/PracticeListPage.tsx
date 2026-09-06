import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getFlatPages, getPracticeProblems, type DocPage, type PracticeDifficulty } from '../lib/contentTree';
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta';
import { useGamification } from '../contexts/GamificationContext';
import { hasAward, pointsForDifficulty, SYSTEM_DESIGN_CHALLENGE_POINTS } from '../lib/gamification';
import { useProgress } from '../contexts/ProgressContext';
import { cleanPracticeTitle, nextLesson, practicePaths, practiceStats, recommendedProblem, relatedLesson } from '../lib/mastery';
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

const STAGES = [
  { id: 'stage-1', num: 1, title: 'Stage 1: Transformer & LLM Fundamentals', range: 'Rank 1–84' },
  { id: 'stage-2', num: 2, title: 'Stage 2: LLM Application & Decoding Engineering', range: 'Rank 85–168' },
  { id: 'stage-3', num: 3, title: 'Stage 3: Context & Memory Architecture', range: 'Rank 169–252' },
  { id: 'stage-4', num: 4, title: 'Stage 4: RAG & Information Retrieval Systems', range: 'Rank 253–336' },
  { id: 'stage-5', num: 5, title: 'Stage 5: Agent Loops & Tool Execution', range: 'Rank 337–420' },
  { id: 'stage-6', num: 6, title: 'Stage 6: Graph Engineering & MCP Integration', range: 'Rank 421–504' },
  { id: 'stage-7', num: 7, title: 'Stage 7: Multi-Agent Systems & Knowledge Graphs', range: 'Rank 505–588' },
  { id: 'stage-8', num: 8, title: 'Stage 8: Agent Security & Reliability', range: 'Rank 589–672' },
  { id: 'stage-9', num: 9, title: 'Stage 9: Python & Algorithmic Foundations for AI', range: 'Rank 673–756' },
  { id: 'stage-10', num: 10, title: 'Stage 10: Mathematics, NumPy & Data Pipelines', range: 'Rank 757–840' },
  { id: 'stage-11', num: 11, title: 'Stage 11: Classical ML, Deep Learning & Vision', range: 'Rank 841–924' },
  { id: 'stage-12', num: 12, title: 'Stage 12: MLOps, Distributed Systems & Production Agent Deployment', range: 'Rank 925–1000' },
];

export default function PracticeListPage() {
  useDocumentTitle('Practice AI — 1,000+ AI Engineering Curriculum');
  useDocumentMeta('Practice AI', '1,000+ problem non-duplicate AI Engineering curriculum covering Agentic AI, Transformers, RAG, MCP, Graphs, Math, NumPy, ML, and Systems.');

  const problems = useMemo(() => getPracticeProblems(), []);
  const topicLabels = useMemo(buildTopicLabels, []);
  const { events } = useGamification();
  const { understood } = useProgress();
  const learnPages = useMemo(() => getFlatPages(), []);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | PracticeDifficulty | 'design'>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | string>('all');
  const [stageFilter, setStageFilter] = useState<'all' | number>('all');
  const [viewMode, setViewMode] = useState<'roadmap' | 'table'>('roadmap');

  const topics = useMemo(() => {
    const set = new Set(problems.map((p) => p.topic).filter((t): t is string => !!t));
    return Array.from(set).sort((a, b) => (topicLabels[a] ?? a).localeCompare(topicLabels[b] ?? b));
  }, [problems, topicLabels]);

  const solvedCount = problems.filter((p) => hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')).length;
  const stats = practiceStats(problems, events);
  const next = nextLesson(learnPages, understood);
  const recommended = recommendedProblem(problems, events, next);
  const paths = practicePaths(problems);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problems) {
      if (p.topic) {
        counts[p.topic] = (counts[p.topic] || 0) + 1;
      }
    }
    return counts;
  }, [problems]);

  const sortedTopics = useMemo(() => {
    return Object.keys(topicCounts).sort((a, b) => (topicCounts[b] || 0) - (topicCounts[a] || 0));
  }, [topicCounts]);

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
              Practice AI — 1,000+ AI Engineering Curriculum
            </h1>
            <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.6, maxWidth: 780 }}>
              A comprehensive 1,072-problem curriculum with zero duplicate titles across 34 specialized tracks — spanning Agentic AI Stack (Transformers, Decoding, Context, RAG, Agent Loops, MCP, Graph Engineering, Multi-Agent Systems) as well as AI Foundations (DSA for AI, Math, NumPy, Pandas, Classical ML, Deep Learning, and Distributed Systems). Every problem is uniquely numbered (#001–#1072).
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

        <div className="nm-mastery-metrics" aria-label="Practice progress">
          <div><strong>{stats.solved}</strong><span>problems solved</span></div>
          <div><strong>{stats.total - stats.solved}</strong><span>ready to solve</span></div>
          <div><strong>{stats.easySolved}/{stats.mediumSolved}/{stats.hardSolved}</strong><span>easy / medium / hard</span></div>
        </div>

        {/* 12-Stage Progression Stepper */}
        <div style={{ margin: '2rem 0', background: 'var(--nm-surface)', borderRadius: 12, border: '1px solid var(--nm-border)', padding: '1.2rem' }}>
          <p className="nm-eyebrow" style={{ margin: '0 0 0.4rem' }}>Curriculum Progression</p>
          <h3 style={{ margin: '0 0 1rem', fontSize: 16, color: 'var(--nm-text-primary)' }}>12-Stage AI Engineering Master Path</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStageFilter(stageFilter === s.num ? 'all' : s.num);
                  setViewMode('roadmap');
                }}
                style={{
                  textAlign: 'left',
                  padding: '0.8rem 1rem',
                  borderRadius: 10,
                  border: stageFilter === s.num ? '2px solid var(--nm-accent-primary)' : '1px solid var(--nm-border)',
                  background: stageFilter === s.num ? 'color-mix(in srgb, var(--nm-accent-primary) 10%, transparent)' : 'var(--nm-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--nm-accent-primary)', marginBottom: 4 }}>
                  <span>STAGE {s.num}</span>
                  <span>{s.range}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--nm-text-primary)', lineHeight: 1.3 }}>
                  {s.title.replace(/^Stage \d+: /, '')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LeetCode-Style Tag Pills */}
        <div style={{ margin: '2rem 0', background: 'var(--nm-surface)', borderRadius: 12, border: '1px solid var(--nm-border)', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--nm-text-primary)' }}>
              Explore by Track &amp; Tag
            </h3>
            {topicFilter !== 'all' && (
              <button
                onClick={() => setTopicFilter('all')}
                style={{ background: 'none', border: 'none', color: 'var(--nm-accent-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Clear Tag Filter (Showing All {problems.length})
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
            {sortedTopics.map((topic) => {
              const label = topicLabels[topic] ?? topic;
              const count = topicCounts[topic];
              const isActive = topicFilter === topic;
              return (
                <button
                  key={topic}
                  onClick={() => {
                    setTopicFilter(isActive ? 'all' : topic);
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0.3rem 0.65rem',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isActive ? '1.5px solid var(--nm-accent-primary)' : '1px solid var(--nm-border)',
                    background: isActive ? 'color-mix(in srgb, var(--nm-accent-primary) 15%, transparent)' : 'var(--nm-bg)',
                    color: isActive ? 'var(--nm-accent-primary)' : 'var(--nm-text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{label}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '0.05rem 0.35rem',
                      borderRadius: 10,
                      background: isActive ? 'var(--nm-accent-primary)' : 'var(--nm-surface)',
                      color: isActive ? '#fff' : 'var(--nm-text-muted)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="nm-practice-guidance">
          <div>
            <p className="nm-eyebrow">Recommended next</p>
            {recommended ? <>
              <h2>{cleanPracticeTitle(recommended.title)}</h2>
              <p>
                {next ? `Your next lesson is ${next.title}. This is the nearest unsolved practice problem in the current curriculum.` : 'Your first unsolved practice problem, selected from the real catalogue.'}
              </p>
              <div className="nm-guidance-actions">
                <Link className="nm-button nm-button-primary" to={recommended.route}>Start problem →</Link>
                {relatedLesson(recommended, learnPages) && <Link className="nm-button nm-button-secondary" to={relatedLesson(recommended, learnPages)!.route}>Learn the concept →</Link>}
              </div>
            </> : <>
              <h2>Practice complete</h2><p>You have solved every currently available problem. Continue exploring the curriculum while new practice arrives.</p>
              <Link className="nm-button nm-button-primary" to="/learn">Continue learning →</Link>
            </>}
          </div>
          <div className="nm-practice-guidance-side">
            <span>Connected loop</span>
            <strong>Learn → visualize → implement</strong>
            <p>Every recommendation is drawn from your actual lesson progress and the problem catalogue—not a generic playlist.</p>
          </div>
        </div>

        <section className="nm-practice-paths" aria-labelledby="practice-paths-heading">
          <div className="nm-inline-heading"><div><p className="nm-eyebrow">Practice paths</p><h2 id="practice-paths-heading">Train by discipline, not only by difficulty.</h2></div></div>
          <div className="nm-practice-path-grid">
            {paths.map((path) => {
              const solved = path.problems.filter((problem) => hasAward(events, problem.route, problem.difficulty ? 'complete' : 'design')).length;
              return <div key={path.key} className="nm-practice-path" style={{ '--path-color': path.color } as React.CSSProperties}>
                <span>{path.label}</span><strong>{solved} / {path.problems.length}</strong><small>{path.problems.map((problem) => cleanPracticeTitle(problem.title)).slice(0, 3).join(' · ')}</small>
              </div>;
            })}
          </div>
        </section>

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

      </section>
    </div>
  );
}


