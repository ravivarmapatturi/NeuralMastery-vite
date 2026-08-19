import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import AttentionStepThrough from '../viz/AttentionStepThrough';
import { getSidebar, getFlatPages } from '../lib/contentTree';
import { useDocumentTitle } from '../lib/useDocumentTitle';

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
  const sections = getSidebar();
  const totalPages = getFlatPages().length;

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
          See how AI actually works — not just read about it.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            color: 'var(--nm-text-secondary)',
            maxWidth: 680,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          {totalPages}+ pages on machine learning, deep learning, LLMs, and agents — every one built
          mechanism-first, around real, computed, interactive visualizations instead of another wall of
          static diagrams. This isn't a screenshot: type a sentence below and watch real attention weights
          compute live.
        </p>

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
            return (
              <Link
                key={section.id}
                to={entryPage.route}
                style={{
                  display: 'block',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: '1px solid var(--nm-border)',
                  background: 'var(--nm-surface)',
                  textDecoration: 'none',
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
                className="nm-home-card"
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)', marginBottom: 4 }}>
                  {section.label}
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
