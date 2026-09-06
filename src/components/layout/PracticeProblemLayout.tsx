import { Suspense, useCallback, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import PageFeedback from './PageFeedback';
import MarkUnderstoodButton from './MarkUnderstoodButton';
import { getFlatPages, getPageByRoute, getPracticeProblems } from '../../lib/contentTree';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useDocumentMeta } from '../../lib/useDocumentMeta';
import { useGamification } from '../../contexts/GamificationContext';
import { PracticeSplitPaneProvider } from '../../contexts/PracticeSplitPaneContext';
import { cleanPracticeTitle, isSolved, relatedLesson, recommendedProblem } from '../../lib/mastery';

const DEFAULT_LEFT_WIDTH_PCT = 40;
const MIN_PANE_PCT = 25;

/**
 * The real /practice/:slug problem-detail shell -- a LeetCode-style split
 * layout: the problem description (mission, checklist, worked intuition,
 * MDX prose) scrolls in a left column (40% by default, real drag-to-
 * resize on desktop); the right column stacks a code editor on top of a
 * per-testcase results panel, each with its own real pass/fail, not one
 * aggregate. Below 900px everything stacks in reading order instead of
 * forcing a cramped side-by-side.
 *
 * The split is achieved via a portal (see PracticeSplitPaneContext +
 * PracticePlayground.tsx / RunnableCode.tsx), not by restructuring MDX
 * content: a problem's runnable component is still declared inline in
 * its MDX exactly as always, it just renders into the DOM nodes this
 * layout provides instead of inline. Every existing MDX file works with
 * this layout unchanged.
 */
export default function PracticeProblemLayout() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const { events } = useGamification();
  const [editorPaneEl, setEditorPaneEl] = useState<HTMLDivElement | null>(null);
  const [testcasePaneEl, setTestcasePaneEl] = useState<HTMLDivElement | null>(null);
  const [leftWidthPct, setLeftWidthPct] = useState(DEFAULT_LEFT_WIDTH_PCT);
  const splitRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onDividerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);
  const onDividerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !splitRef.current) return;
    const rect = splitRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidthPct(Math.min(100 - MIN_PANE_PCT, Math.max(MIN_PANE_PCT, pct)));
  }, []);
  const onDividerPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  useDocumentTitle(page ? page.title : 'Page Not Found');
  useDocumentMeta(page?.title, page?.description);

  if (!page) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
        <Navbar />
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h1>Page not found</h1>
        </div>
      </div>
    );
  }

  const { Component } = page;
  const learnPages = getFlatPages();
  const concept = relatedLesson(page, learnPages);
  const solved = isSolved(page, events);
  const nextProblem = solved ? recommendedProblem(getPracticeProblems().filter((problem) => problem.route !== page.route), events, concept) : undefined;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />
      <main className="nm-practice-shell">
        <Link to="/practice" style={{ display: 'inline-block', fontSize: 13, color: 'var(--nm-text-muted)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Practice
        </Link>
        {concept && (
          <aside className="nm-problem-concept-link" aria-label="Related learning concept">
            <div>
              <span>Related concept</span>
              <strong>{concept.title}</strong>
              <p>Understand the computation before—or after—you implement it.</p>
            </div>
            <Link className="nm-button nm-button-secondary" to={concept.route}>
              Learn concept →
            </Link>
          </aside>
        )}

        <PracticeSplitPaneProvider panes={{ editorPaneEl, testcasePaneEl }}>
          <div ref={splitRef} className="nm-practice-split" style={{ gridTemplateColumns: `${leftWidthPct}% 6px 1fr` }}>
            <div className="nm-practice-desc-pane">
              <article className="prose">
                <Suspense fallback={<div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nm-text-muted)', fontSize: 14 }}>Loading…</div>}>
                  <Component />
                </Suspense>
              </article>
              <PageFeedback page={page} />
              <MarkUnderstoodButton />
            </div>

            <div
              className="nm-practice-divider"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize description and code panes"
              onPointerDown={onDividerPointerDown}
              onPointerMove={onDividerPointerMove}
              onPointerUp={onDividerPointerUp}
            />

            <div className="nm-practice-code-pane">
              {/* The problem's runnable component (declared inside the
                  MDX above) portals into these -- see
                  PracticeSplitPaneContext.tsx. PracticePlayground uses
                  both (editor on top, per-case results below); the
                  legacy RunnableCode uses editorPaneEl alone and leaves
                  testcasePaneEl empty, which CSS collapses. */}
              <div ref={setEditorPaneEl} className="nm-practice-editor-pane-inner" />
              <div ref={setTestcasePaneEl} className="nm-practice-testcase-pane-inner" />
            </div>
          </div>
        </PracticeSplitPaneProvider>

        {solved && nextProblem && (
          <aside className="nm-problem-success" aria-label="Next recommended problem">
            <span>Problem completed</span>
            <h2>You implemented {cleanPracticeTitle(page.title)}.</h2>
            <p>Keep the momentum: the next unsolved problem is ready when you are.</p>
            <Link className="nm-button nm-button-primary" to={nextProblem.route}>
              Next: {cleanPracticeTitle(nextProblem.title)} →
            </Link>
          </aside>
        )}
      </main>
    </div>
  );
}
