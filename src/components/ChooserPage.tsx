import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { getFlatPages, getPracticeProblems } from '../lib/contentTree';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/**
 * The real site root ("/") -- a two-way split, not the Learn content
 * directly. The first thing anyone sees is a choice between two clearly
 * distinct, equally-weighted destinations: "Learn AI" (the rich landing
 * page that used to live at "/", now at /learn -- see Home.tsx) and
 * "Practice AI" (the real LeetCode-style problem list at /practice). This
 * is a deliberate structural split, not a cosmetic one: Practice used to
 * be a single inline card teased on the Learn page ("Write real code");
 * now it's a first-class, equally-weighted destination of its own.
 */
export default function ChooserPage() {
  useDocumentTitle();
  useDocumentMeta(undefined);

  const learnPageCount = getFlatPages().length;
  const practiceProblemCount = getPracticeProblems().length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <div
        style={{
          minHeight: 'calc(100vh - 61px)',
          display: 'flex',
          alignItems: 'center',
          background:
            'radial-gradient(1200px 480px at 50% -120px, color-mix(in srgb, var(--nm-accent-primary) 14%, transparent), transparent 70%), radial-gradient(900px 420px at 85% 60px, color-mix(in srgb, var(--nm-accent-secondary) 10%, transparent), transparent 70%)',
        }}
      >
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem', width: '100%' }}>
          <h1
            className="nm-display"
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1.25,
              margin: '0 0 0.75rem',
              textAlign: 'center',
              color: 'var(--nm-text-primary)',
            }}
          >
            Neural Mastery
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              color: 'var(--nm-text-secondary)',
              maxWidth: 620,
              margin: '0 auto 3rem',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            One platform, two ways to build real AI/ML skill.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Link
              to="/learn"
              className="nm-home-card"
              style={{
                display: 'block',
                padding: '2.25rem 2rem',
                borderRadius: 16,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden="true">
                📚
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--nm-text-primary)', marginBottom: 8 }}>Learn AI</div>
              <p style={{ fontSize: 14, color: 'var(--nm-text-muted)', margin: '0 0 1rem', lineHeight: 1.6 }}>
                CS fundamentals through modern LLMs and agents — {learnPageCount}+ pages built around real,
                computed, interactive visualizations, not static diagrams.
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-accent-primary)' }}>Start learning →</span>
            </Link>

            <Link
              to="/practice"
              className="nm-home-card"
              style={{
                display: 'block',
                padding: '2.25rem 2rem',
                borderRadius: 16,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: 'var(--nm-bg)',
                  background: 'var(--nm-accent-primary)',
                  borderRadius: 6,
                  padding: '0.2rem 0.5rem',
                }}
              >
                NEW
              </span>
              <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden="true">
                💻
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--nm-text-primary)', marginBottom: 8 }}>Practice AI</div>
              <p style={{ fontSize: 14, color: 'var(--nm-text-muted)', margin: '0 0 1rem', lineHeight: 1.6 }}>
                {practiceProblemCount}+ real coding problems, linear algebra to RL, in an in-browser Python
                sandbox — run against real tests, no LLM grading.
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-accent-primary)' }}>Start practicing →</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
