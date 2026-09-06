import { Suspense, useState } from 'react';
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

/**
 * The real /practice/:slug problem-detail shell -- a LeetCode-style split
 * pane: the problem description (mission, checklist, worked intuition,
 * MDX prose) scrolls in the left column; a real code editor + Run +
 * per-test pass/fail results stays visible in the right column, sticky
 * on desktop, stacked below the description on mobile (see the
 * .nm-practice-split rules in theme.css).
 *
 * The split is achieved via a portal (see PracticeSplitPaneContext +
 * RunnableCode.tsx), not by restructuring the MDX content itself:
 * RunnableCode is still declared inline in each problem's MDX (same as
 * every other page that embeds it), but when a code-pane DOM node is
 * provided here, it renders its editor/Run/results panel there instead
 * of inline. This means all 53 existing MDX files work with this layout
 * unchanged -- their content never moves, only where the editor visually
 * lands.
 */
export default function PracticeProblemLayout() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const { events } = useGamification();
  const [codePaneEl, setCodePaneEl] = useState<HTMLDivElement | null>(null);

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

        <PracticeSplitPaneProvider codePaneEl={codePaneEl}>
          <div className="nm-practice-split">
            <div className="nm-practice-desc-pane">
              <article className="prose">
                <Suspense fallback={<div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nm-text-muted)', fontSize: 14 }}>Loading…</div>}>
                  <Component />
                </Suspense>
              </article>
              <PageFeedback page={page} />
              <MarkUnderstoodButton />
            </div>
            <div className="nm-practice-code-pane">
              {/* RunnableCode (declared inside the MDX above) portals its
                  editor/Run/results panel into this node -- see
                  PracticeSplitPaneContext.tsx. Empty until the MDX
                  component mounts and finds it. */}
              <div ref={setCodePaneEl} className="nm-practice-code-pane-inner" />
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
