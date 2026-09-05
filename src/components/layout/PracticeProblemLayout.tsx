import { Suspense } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import PageFeedback from './PageFeedback';
import MarkUnderstoodButton from './MarkUnderstoodButton';
import { getPageByRoute } from '../../lib/contentTree';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useDocumentMeta } from '../../lib/useDocumentMeta';

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <Link to="/practice" style={{ display: 'inline-block', fontSize: 13, color: 'var(--nm-text-muted)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Practice
        </Link>
        <article className="prose">
          <Suspense fallback={<div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nm-text-muted)', fontSize: 14 }}>Loading…</div>}>
            <Component />
          </Suspense>
        </article>
        <PageFeedback page={page} />
        <MarkUnderstoodButton />
      </main>
    </div>
  );
}
