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

/** icon + accentVar give each stage a real, distinct visual identity (see
 * feedback_visual_design memory: per-item color/icon, not generic boxes)
 * -- only 6 real theme accent tokens exist (see index.css), so stages
 * cycle through them paired with a unique icon each, rather than
 * inventing a bespoke 12-color palette that wouldn't adapt across
 * light/dark theme the way these CSS vars already do. min/max are the
 * REAL numeric rank boundaries (not just the display string) -- see
 * `stageStats` below, which buckets every problem's own real "#NNN."
 * rank (parsed from its title) into these ranges for a genuinely
 * computed per-stage count and solved-count, not a static label. */
const STAGES = [
  { id: 'stage-1', num: 1, title: 'Stage 1: Transformer & LLM Fundamentals', min: 1, max: 84, icon: '🧠', accentVar: '--nm-accent-primary' },
  { id: 'stage-2', num: 2, title: 'Stage 2: LLM Application & Decoding Engineering', min: 85, max: 168, icon: '💬', accentVar: '--nm-accent-teal' },
  { id: 'stage-3', num: 3, title: 'Stage 3: Context & Memory Architecture', min: 169, max: 252, icon: '🧵', accentVar: '--nm-accent-purple' },
  { id: 'stage-4', num: 4, title: 'Stage 4: RAG & Information Retrieval Systems', min: 253, max: 336, icon: '🔍', accentVar: '--nm-accent-secondary' },
  { id: 'stage-5', num: 5, title: 'Stage 5: Agent Loops & Tool Execution', min: 337, max: 420, icon: '🤖', accentVar: '--nm-accent-warn' },
  { id: 'stage-6', num: 6, title: 'Stage 6: Graph Engineering & MCP Integration', min: 421, max: 504, icon: '🕸️', accentVar: '--nm-accent-danger' },
  { id: 'stage-7', num: 7, title: 'Stage 7: Multi-Agent Systems & Knowledge Graphs', min: 505, max: 588, icon: '🌐', accentVar: '--nm-accent-primary' },
  { id: 'stage-8', num: 8, title: 'Stage 8: Agent Security & Reliability', min: 589, max: 672, icon: '🛡️', accentVar: '--nm-accent-teal' },
  { id: 'stage-9', num: 9, title: 'Stage 9: Python & Algorithmic Foundations for AI', min: 673, max: 756, icon: '🐍', accentVar: '--nm-accent-purple' },
  { id: 'stage-10', num: 10, title: 'Stage 10: Mathematics, NumPy & Data Pipelines', min: 757, max: 840, icon: '📐', accentVar: '--nm-accent-secondary' },
  { id: 'stage-11', num: 11, title: 'Stage 11: Classical ML, Deep Learning & Vision', min: 841, max: 924, icon: '🧮', accentVar: '--nm-accent-warn' },
  { id: 'stage-12', num: 12, title: 'Stage 12: MLOps, Distributed Systems & Production Agent Deployment', min: 925, max: 1000, icon: '🚀', accentVar: '--nm-accent-danger' },
];

/** Extracts the real "#NNN." curriculum rank a problem's title carries
 * (only the newer 1000+ ranked curriculum has one -- the original 48
 * hand-authored problems and the 4 system-design challenges don't, and
 * are correctly excluded from stage bucketing rather than miscounted
 * into Stage 1). */
function rankOf(title: string): number | null {
  const m = title.match(/#(\d+)\./);
  return m ? Number(m[1]) : null;
}

export default function PracticeListPage() {
  const problems = useMemo(() => getPracticeProblems(), []);

  // Real, current count -- never hardcoded. A stale hardcoded number here
  // is exactly how this page previously ended up claiming "1,072" long
  // after the real file count had grown well past it.
  useDocumentTitle(`Practice AI — ${problems.length}+ AI Engineering Problems`);
  useDocumentMeta('Practice AI', `A growing AI Engineering practice curriculum (${problems.length} problems and counting) covering Agentic AI, Transformers, RAG, MCP, Graphs, Math, NumPy, ML, and Systems.`);

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

  /** Real per-stage totals + solved counts, bucketed from each problem's
   * own actual "#NNN." rank -- not a static/guessed number. */
  const stageStats = useMemo(() => {
    const stats: Record<number, { total: number; solved: number }> = {};
    for (const s of STAGES) stats[s.num] = { total: 0, solved: 0 };
    for (const p of problems) {
      const rank = rankOf(p.title);
      if (rank === null) continue;
      const stage = STAGES.find((s) => rank >= s.min && rank <= s.max);
      if (!stage) continue;
      stats[stage.num].total += 1;
      if (hasAward(events, p.route, isDesignChallenge(p) ? 'design' : 'complete')) stats[stage.num].solved += 1;
    }
    return stats;
  }, [problems, events]);

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
              Practice AI — {problems.length}+ AI Engineering Problems
            </h1>
            <p style={{ fontSize: 14, color: 'var(--nm-text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.6, maxWidth: 780 }}>
              A growing AI Engineering practice curriculum spanning Agentic AI Stack (Transformers, Decoding, Context, RAG, Agent Loops, MCP, Graph Engineering, Multi-Agent Systems) as well as AI Foundations (DSA for AI, Math, NumPy, Pandas, Classical ML, Deep Learning, and Distributed Systems). New problems are added and fleshed out with real, IDE-graded solutions on an ongoing basis.
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

        {/* 12-Stage Progression -- "The Ascent" */}
        <div style={{ margin: '2rem 0' }}>
          <p className="nm-eyebrow" style={{ margin: '0 0 0.3rem' }}>Curriculum Progression</p>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: 20, fontWeight: 800, color: 'var(--nm-text-primary)' }}>The Ascent</h3>
          <p style={{ margin: '0 0 1rem', fontSize: 13, color: 'var(--nm-text-secondary)' }}>
            12 stages, zero fluff — from transformer fundamentals to shipping a production agent.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.9rem',
              overflowX: 'auto',
              paddingBottom: 10,
              scrollSnapType: 'x proximity',
            }}
          >
            {STAGES.map((s) => {
              const stat = stageStats[s.num];
              const active = stageFilter === s.num;
              const pct = stat.total > 0 ? stat.solved / stat.total : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setStageFilter(stageFilter === s.num ? 'all' : s.num);
                    setViewMode('roadmap');
                  }}
                  style={{
                    scrollSnapAlign: 'start',
                    flex: '0 0 220px',
                    textAlign: 'left',
                    padding: '1rem 1.1rem',
                    borderRadius: 14,
                    border: active ? `2px solid var(${s.accentVar})` : '1px solid var(--nm-border)',
                    background: `color-mix(in srgb, var(${s.accentVar}) ${active ? 16 : 9}%, var(--nm-surface))`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? `0 4px 16px color-mix(in srgb, var(${s.accentVar}) 25%, transparent)` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{s.icon}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em', color: `var(${s.accentVar})` }}>STAGE {s.num}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--nm-text-primary)', lineHeight: 1.3, minHeight: 36, marginBottom: 8 }}>
                    {s.title.replace(/^Stage \d+: /, '')}
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--nm-border)', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${pct * 100}%`, height: '100%', background: `var(${s.accentVar})`, transition: 'width 200ms ease' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nm-text-muted)' }}>
                    {stat.solved} of {stat.total} cleared
                  </div>
                </button>
              );
            })}
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


