import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import AttentionStepThrough from '../viz/AttentionStepThrough';
import { getFlatPages } from '../lib/contentTree';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { SECTION_META, SECTION_ORDER, timeEstimate } from '../data/sectionMeta';

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
          One platform to master AI — math, ML, deep learning, agents, and beyond.
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
          {totalPages}+ pages covering math, machine learning, deep learning, LLMs, and agents — every
          one built mechanism-first, around real, computed, interactive visualizations instead of another
          wall of static diagrams. This isn't a screenshot: type a sentence below and watch real attention
          weights compute live.
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
            marginBottom: '0.4rem',
          }}
        >
          Or browse by area
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--nm-text-muted)', margin: '0 0 1.25rem' }}>
          The 7 sections Start Learning walks in order, roughly foundations-first — jump straight to the one you need.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {SECTION_ORDER.map((key) => {
            const meta = SECTION_META[key];
            return (
              <Link
                key={key}
                to={key}
                style={{
                  display: 'block',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: '1px solid var(--nm-border)',
                  borderTop: `3px solid ${meta.color}`,
                  background: 'var(--nm-surface)',
                  textDecoration: 'none',
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
                className="nm-home-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)' }}>{meta.label}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--nm-text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                  {meta.description}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'var(--nm-text-muted)' }}>
                  <span>⏱ {timeEstimate(meta.pageCount)}</span>
                  <span>⭐ {meta.difficulty}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
