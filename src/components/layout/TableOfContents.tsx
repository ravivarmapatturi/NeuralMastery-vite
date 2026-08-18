import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Scans h2/h3 elements inside the given content ref after each render and
 * builds a linked table of contents -- no MDX-AST dependency, so it works
 * identically regardless of how the content was authored.
 */
export default function TableOfContents({ contentRef }: { contentRef: React.RefObject<HTMLElement | null> }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const nodes = Array.from(el.querySelectorAll('h2, h3')) as HTMLElement[];
    const found: Heading[] = nodes.map((n) => {
      if (!n.id) {
        n.id = n.textContent?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') ?? '';
      }
      return { id: n.id, text: n.textContent ?? '', level: n.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(found);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [contentRef]);

  if (headings.length === 0) return null;

  return (
    <nav style={{ width: 220, flexShrink: 0, padding: '1.5rem 1rem', fontSize: 13 }}>
      <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--nm-text-muted)', marginBottom: 8 }}>
        On this page
      </div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          style={{
            display: 'block',
            padding: '3px 0',
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
