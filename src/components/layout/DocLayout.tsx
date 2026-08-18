import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';
import PrevNext from './PrevNext';
import ThemeSkinPicker from '../ThemeSkinPicker';
import { getPageByRoute } from '../../lib/contentTree';

export default function DocLayout() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!page) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>Page not found</h1>
      </div>
    );
  }

  const { Component } = page;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem', minWidth: 0 }} ref={contentRef}>
          <article className="prose">
            <Component />
          </article>
          <PrevNext route={page.route} />
        </main>
        <TableOfContents contentRef={contentRef} />
      </div>
      <ThemeSkinPicker />
    </div>
  );
}
