import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import AttentionStepThrough from '../viz/AttentionStepThrough';
import { getSidebar, getFlatPages } from '../lib/contentTree';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta';

/** section id (e.g. "mlops") -> its parent group's icon/color, so each of
 * the 32 topic cards below can carry real visual identity without
 * changing which page it links to -- decoration only, same routes as
 * before. Falls back to a plain dot for any section not in a group. */
function buildSectionAccent(): Record<string, { icon: string; color: string }> {
  const accent: Record<string, { icon: string; color: string }> = {};
  for (const key of SECTION_ORDER) {
    const meta = SECTION_META[key];
    for (const sub of meta.subsections) {
      accent[sub.dir] = { icon: meta.icon, color: meta.color };
    }
  }
  return accent;
}

/**
 * The landing page. Built around one idea: prove the site's differentiator
 * (real, computed, interactive visualizations -- not static diagrams)
 * directly in the hero, rather than describing it in marketing copy. No
 * skill-level segmentation (kids/beginner/expert) -- the topic-first
 * organization mirrors the sidebar, and the underlying intuition ->
 * visualization -> math -> code structure on every page already serves
 * every level without asking anyone to self-select.
 */
export default function Home() {
  useDocumentTitle();
  useDocumentMeta(undefined);
  const sections = getSidebar();
  const totalPages = getFlatPages().length;
  const accent = buildSectionAccent();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '4rem 1.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 1rem',
            color: 'var(--nm-text-primary)',
          }}
        >
          A platform to learn AI structurally, through visualizations.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            color: 'var(--nm-text-secondary)',
            maxWidth: 680,
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          Learn from the fundamentals up — CS, math, machine learning, deep learning, agents, loops and
          graphs, and the latest research — all {totalPages}+ pages built around real, computed,
          interactive visualizations, not static diagrams.
        </p>

        <Link
          to="/docs/learning-path"
          className="nm-home-cta"
          style={{
            display: 'inline-block',
            padding: '0.85rem 1.75rem',
            borderRadius: 10,
            background: 'var(--nm-accent-primary)',
            color: 'var(--nm-bg)',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            marginBottom: '2.5rem',
          }}
        >
          Start Learning →
        </Link>

        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
          <AttentionStepThrough />
        </div>
        <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', marginTop: '0.75rem' }}>
          From{' '}
          <Link to="/docs/deep-learning/attention-transformers" style={{ color: 'var(--nm-accent-primary)' }}>
            Attention &amp; Transformers
          </Link>{' '}
          — one of {totalPages}+ pages built the same way.
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--nm-text-muted)',
            marginBottom: '1.25rem',
          }}
        >
          Pick a topic
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {sections.map((section) => {
            const entryPage = section.pages[0];
            if (!entryPage) return null;
            const a = accent[section.id];
            return (
              <Link
                key={section.id}
                to={entryPage.route}
                style={{
                  display: 'block',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: '1px solid var(--nm-border)',
                  borderTop: a ? `3px solid ${a.color}` : '1px solid var(--nm-border)',
                  background: 'var(--nm-surface)',
                  textDecoration: 'none',
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
                className="nm-home-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {a && <span style={{ fontSize: 15 }}>{a.icon}</span>}
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)' }}>
                    {section.label}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--nm-text-muted)' }}>
                  {section.pages.length} page{section.pages.length === 1 ? '' : 's'}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
