import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

function scanHeadings(el: HTMLElement): { headings: Heading[]; nodes: HTMLElement[] } {
  const nodes = Array.from(el.querySelectorAll('h2, h3')) as HTMLElement[];
  const headings: Heading[] = nodes.map((n) => {
    if (!n.id) {
      n.id = n.textContent?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') ?? '';
    }
    return { id: n.id, text: n.textContent ?? '', level: n.tagName === 'H2' ? 2 : 3 };
  });
  return { headings, nodes };
}

/**
 * Scans h2/h3 elements inside the given content ref and builds a linked
 * table of contents -- no MDX-AST dependency, so it works identically
 * regardless of how the content was authored. Rendered twice on mobile
 * (docked desktop rail is hidden via CSS, a second instance lives inside
 * the mobile drawer) -- each mount keeps its own scroll-spy state, which
 * is harmless at this page/heading count.
 *
 * Rescans via a MutationObserver on contentRef, not a one-shot effect --
 * necessary because the actual page component now loads lazily (see
 * contentTree.ts's React.lazy + DocLayout's <Suspense>): a plain
 * `useEffect(..., [contentRef])` would scan on mount, before the lazy
 * component (and its headings) has actually rendered into the DOM, and
 * never re-scan once it does, since contentRef's own identity never
 * changes. Also fixes a latent pre-existing gap: client-side navigation
 * between two /docs/* routes doesn't remount DocLayout (same route
 * pattern), so a one-shot scan was already stale after the first
 * in-app navigation even before lazy-loading -- the MutationObserver
 * catches both cases the same way.
 */
export default function TableOfContents({
  contentRef,
  variant = 'desktop',
  onNavigate,
}: {
  contentRef: React.RefObject<HTMLElement | null>;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const isMobile = variant === 'mobile';

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;

    let intersectionObserver: IntersectionObserver | null = null;
    let lastIds = '';

    function rescan() {
      const { headings: found, nodes } = scanHeadings(el!);
      const ids = found.map((h) => h.id).join('|');
      if (ids === lastIds) return; // same heading set (id-for-id) -- skip the redundant re-render
      lastIds = ids;
      setHeadings(found);

      intersectionObserver?.disconnect();
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.find((e) => e.isIntersecting);
          if (visible) setActiveId(visible.target.id);
        },
        { rootMargin: '-80px 0px -70% 0px' },
      );
      nodes.forEach((n) => intersectionObserver!.observe(n));
    }

    rescan();
    const mutationObserver = new MutationObserver(rescan);
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [contentRef]);

  if (headings.length === 0) return null;

  return (
    <nav
      className={isMobile ? undefined : 'nm-toc'}
      aria-label="On this page"
      style={isMobile ? { width: '100%', fontSize: 13 } : { width: 220, flexShrink: 0, padding: '1.5rem 1rem', fontSize: 13 }}
    >
      <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: 8 }}>
        On this page
      </div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={onNavigate}
          style={{
            display: 'block',
            padding: '4px 0',
            paddingLeft: h.level === 3 ? 12 : 0,
            color: activeId === h.id ? 'var(--nm-accent-primary)' : 'var(--nm-text-secondary)',
            textDecoration: 'none',
          }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
