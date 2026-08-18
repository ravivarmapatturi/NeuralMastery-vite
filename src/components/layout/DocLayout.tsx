import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';
import MobileNavDrawer from './MobileNavDrawer';
import PrevNext from './PrevNext';
import ThemeSkinPicker from '../ThemeSkinPicker';
import { getPageByRoute } from '../../lib/contentTree';

export default function DocLayout() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [navOpen, setNavOpen] = useState(false);

  // Route changes (including via prev/next, sidebar, or browser back/forward)
  // should always close the mobile drawer, not just clicks inside it.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

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
      <Navbar onMenuClick={() => setNavOpen(true)} menuButtonRef={menuButtonRef} />
      <div className="nm-doc-row" style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        <Sidebar />
        <main className="nm-doc-main" style={{ flex: 1, padding: '2rem 3rem', minWidth: 0 }} ref={contentRef}>
          <article className="prose">
            <Component />
          </article>
          <PrevNext route={page.route} />
        </main>
        <TableOfContents contentRef={contentRef} />
      </div>
      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} contentRef={contentRef} triggerRef={menuButtonRef} />
      <ThemeSkinPicker />
    </div>
  );
}
