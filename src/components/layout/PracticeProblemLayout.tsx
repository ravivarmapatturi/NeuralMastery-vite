import { Suspense } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import PageFeedback from './PageFeedback';
import MarkUnderstoodButton from './MarkUnderstoodButton';
import { getFlatPages, getPageByRoute, getPracticeProblems } from '../../lib/contentTree';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useDocumentMeta } from '../../lib/useDocumentMeta';
import { useGamification } from '../../contexts/GamificationContext';
import { cleanPracticeTitle, isSolved, relatedLesson, recommendedProblem } from '../../lib/mastery';

/**
 * The real /practice/:slug problem-detail shell -- deliberately lighter
 * than DocLayout (no full docs Sidebar/TableOfContents/PrevNext chrome):
 * Practice is its own destination now, not a docs subsection, so the
 * surrounding chrome should feel like a problem page, not a doc page. The
 * actual problem content is the SAME lazy-loaded MDX component DocLayout
 * uses for every other page (see contentTree.ts's getPageByRoute, which
 * already resolves a practice problem's real, remapped "/practice/<slug>"
 * route to its component) -- reused, not rewritten.
 */
export default function PracticeProblemLayout() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const { events } = useGamification();

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
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <Link to="/practice" style={{ display: 'inline-block', fontSize: 13, color: 'var(--nm-text-muted)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Practice
        </Link>
        {concept && <aside className="nm-problem-concept-link" aria-label="Related learning concept">
          <div><span>Related concept</span><strong>{concept.title}</strong><p>Understand the computation before—or after—you implement it.</p></div>
          <Link className="nm-button nm-button-secondary" to={concept.route}>Learn concept →</Link>
        </aside>}
        <article className="prose">
          <Suspense fallback={<div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nm-text-muted)', fontSize: 14 }}>Loading…</div>}>
            <Component />
          </Suspense>
        </article>
        <PageFeedback page={page} />
        <MarkUnderstoodButton />
        {solved && nextProblem && <aside className="nm-problem-success" aria-label="Next recommended problem">
          <span>Problem completed</span><h2>You implemented {cleanPracticeTitle(page.title)}.</h2><p>Keep the momentum: the next unsolved problem is ready when you are.</p>
          <Link className="nm-button nm-button-primary" to={nextProblem.route}>Next: {cleanPracticeTitle(nextProblem.title)} →</Link>
        </aside>}
      </main>
    </div>
  );
}
