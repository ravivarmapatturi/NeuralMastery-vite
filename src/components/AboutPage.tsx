import Navbar from './layout/Navbar';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/**
 * Real, honest "what is this" page -- reuses the same description already
 * established on the homepage (ChooserPage's own useDocumentMeta call)
 * rather than inventing new marketing language that would need to be kept
 * in sync separately. Contact is folded in here rather than a separate
 * page: this is a solo, single-maintainer project with no support
 * inbox/contact form set up, so the real, honest channel is the public
 * GitHub repo -- not a fabricated email address or form.
 */
export default function AboutPage() {
  useDocumentTitle('About');
  useDocumentMeta('About Neural Mastery', 'What Neural Mastery is, how it works, and how to reach the person building it.');

  return (
    <div style={{ minHeight: '100%', background: 'var(--nm-bg)' }}>
      <Navbar />
      <main>
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--nm-text-primary)', marginBottom: '1.25rem' }}>
            About Neural Mastery
          </h1>
          <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--nm-text-secondary)' }}>
            <p>
              Neural Mastery is an interactive AI engineering curriculum: learn AI from first principles through computed
              visualizations and executable practice, from mathematics to LLMs and agents. Every explanation is paired with a
              real, running computation you can change and re-run, not just a static diagram or a wall of prose — and every
              practice problem runs real Python (via Pyodide, a real CPython-in-WebAssembly runtime) directly in your browser,
              with real tests you actually pass or fail.
            </p>
            <p>
              It's built and maintained by a single person, as a real, ongoing project rather than a finished product —
              content and features ship continuously, and the site is genuinely still growing.
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--nm-text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Questions, feedback, or found a bug?
            </h2>
            <p>
              There's no separate support inbox or contact form — the real, honest channel is the project's public GitHub
              repository. Open an issue there for a bug report, a content correction, or a feature request, or check the
              repo's own commit history to see exactly what's shipped and when.
            </p>
            <p>
              <a
                href="https://github.com/ravivarmapatturi/NeuralMastery-vite/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--nm-accent-primary)' }}
              >
                Open an issue on GitHub →
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
