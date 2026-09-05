import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import AttentionStepThrough from '../viz/AttentionStepThrough';
import { QA } from './content/ExpandableDepth';
import { getSidebar, getFlatPages, type DocPage } from '../lib/contentTree';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { SECTION_META, SECTION_ORDER, completionFor } from '../data/sectionMeta';
import { DomainIcon } from './icons/DomainIcons';
import { useProgress } from '../contexts/ProgressContext';

/** The first top-level group (in SECTION_ORDER) the visitor hasn't fully
 * finished yet -- "current group" for a "continue where you left off" CTA.
 * Undefined only in the (practically unreachable) case every group is
 * already 100% complete. */
function currentGroupKey(understood: Record<string, unknown>): string | undefined {
  return SECTION_ORDER.find((key) => completionFor(key, understood) < 1);
}

/** First page within that group, in sidebar order, not yet marked
 * understood -- same "which pages belong to this group" match
 * (`/docs/<subsection dir>/`) completionFor itself uses, so the two never
 * disagree about which group a page counts toward. Every subsection
 * follows the same overview.mdx (position 1) -> roadmap.mdx (position 2)
 * convention, and roadmap.mdx is a checklist/index of links back into the
 * section, not real teaching content -- skipped here so marking just the
 * overview page understood doesn't immediately recommend it as "next". */
function nextUnstartedPage(groupKey: string, flatPages: DocPage[], isUnderstood: (route: string) => boolean): DocPage | undefined {
  const meta = SECTION_META[groupKey];
  return flatPages.find(
    (p) =>
      meta.subsections.some((s) => p.route.includes(`/docs/${s.dir}/`)) &&
      !p.route.endsWith('/roadmap') &&
      !isUnderstood(p.route),
  );
}

/** section id (e.g. "mlops") -> its parent group's key/color, so each of
 * the 32 topic cards below can carry real visual identity without
 * changing which page it links to -- decoration only, same routes as
 * before. Falls back to undefined for any section not in a group (none
 * currently, but new content dirs can lag a SECTION_META update). */
function buildSectionAccent(): Record<string, { groupKey: string; color: string }> {
  const accent: Record<string, { groupKey: string; color: string }> = {};
  for (const key of SECTION_ORDER) {
    const meta = SECTION_META[key];
    for (const sub of meta.subsections) {
      accent[sub.dir] = { groupKey: key, color: meta.color };
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
  const flatPages = getFlatPages();
  const totalPages = flatPages.length;
  const accent = buildSectionAccent();
  // -1 excludes the section's own overview page from the count of actual problems.
  const practiceProblemCount = Math.max(0, (sections.find((s) => s.id === 'practice-problems')?.pages.length ?? 1) - 1);

  const { understood, isUnderstood, countWithin, dueForReview } = useProgress();
  // Gated on real, currently-existing pages (not raw understood-map key
  // count) -- a visitor whose only marked page was later renamed/removed
  // (see ProgressPage's own titleFor fallback for that same case) should
  // see the normal first-time pitch, not a "you've understood 0 pages" hero.
  const totalDone = countWithin(flatPages.map((p) => p.route));
  const hasProgress = totalDone > 0;
  const groupKey = hasProgress ? currentGroupKey(understood) : undefined;
  const nextPage = groupKey ? nextUnstartedPage(groupKey, flatPages, isUnderstood) : undefined;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg)' }}>
      <Navbar />

      <div
        style={{
          background:
            'radial-gradient(1200px 480px at 50% -120px, color-mix(in srgb, var(--nm-accent-primary) 14%, transparent), transparent 70%), radial-gradient(900px 420px at 85% 60px, color-mix(in srgb, var(--nm-accent-secondary) 10%, transparent), transparent 70%)',
        }}
      >
        <section
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '4rem 1.5rem 2rem',
            textAlign: 'center',
          }}
        >
        <h1
          className="nm-display"
          style={{
            fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
            fontWeight: 700,
            lineHeight: 1.25,
            margin: '0 0 1rem',
            color: 'var(--nm-text-primary)',
          }}
        >
          {hasProgress
            ? `Welcome back — you've understood ${totalDone} page${totalDone === 1 ? '' : 's'}.`
            : 'A platform to learn AI structurally, through visualizations.'}
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
          {hasProgress ? (
            dueForReview.length > 0 ? (
              <>
                {dueForReview.length} page{dueForReview.length === 1 ? ' is' : 's are'} due for review —
                pick that back up, or keep moving forward.
              </>
            ) : (
              <>Nothing due for review right now — pick up where you left off.</>
            )
          ) : (
            <>
              Learn from the fundamentals up — CS, math, machine learning, deep learning, agents, loops and
              graphs, and the latest research — all {totalPages}+ pages built around real, computed,
              interactive visualizations, not static diagrams.
            </>
          )}
        </p>

        <Link
          to={hasProgress && nextPage ? nextPage.route : '/docs/learning-path'}
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
          }}
        >
          {hasProgress && nextPage ? `Continue: ${nextPage.title} →` : 'Start Learning →'}
        </Link>
        <div style={{ marginTop: '0.75rem', marginBottom: '2.5rem' }}>
          {hasProgress ? (
            <Link to="/progress" style={{ fontSize: 13.5, color: 'var(--nm-text-muted)', textDecoration: 'none' }}>
              {dueForReview.length > 0 ? `Review ${dueForReview.length} due page${dueForReview.length === 1 ? '' : 's'} →` : 'View full progress →'}
            </Link>
          ) : (
            <Link
              to="/docs/ml-system-design/case-studies"
              style={{ fontSize: 13.5, color: 'var(--nm-text-muted)', textDecoration: 'none' }}
            >
              or start from a real problem instead →
            </Link>
          )}
        </div>

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
      </div>

      <section style={{ padding: '0 0 2.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2
            className="nm-display"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--nm-text-muted)',
              marginBottom: '1.25rem',
            }}
          >
            New
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 12,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)', marginBottom: 4 }}>
                Test yourself
              </div>
              <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Real interview questions, click to reveal the answer — try one right here:
              </p>
              <QA q="What is a KV cache, and why does it matter for serving?">
                Storing each generated token's Key/Value projections so they don't get recomputed on every
                subsequent step — it's also the dominant consumer of GPU memory during serving.
              </QA>
              <Link
                to="/docs/interview-prep/qa-quick-reference"
                style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: 13, color: 'var(--nm-accent-primary)', textDecoration: 'none' }}
              >
                More real interview questions, across LLMs, RAG, and agents →
              </Link>
            </div>

            <Link
              to="/docs/practice-problems/overview"
              className="nm-home-card"
              style={{
                display: 'block',
                padding: '1.25rem',
                borderRadius: 12,
                border: '1px solid var(--nm-border)',
                background: 'var(--nm-surface)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)', marginBottom: 4 }}>
                Write real code
              </div>
              <p style={{ fontSize: 13, color: 'var(--nm-text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Implement a function yourself in a real, in-browser Python sandbox — run it against real test
                cases (pass/fail, no LLM grading), then reveal a reference solution.
              </p>
              <span style={{ fontSize: 13, color: 'var(--nm-accent-primary)' }}>
                {practiceProblemCount}+ problems: linear algebra to RL →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          background: 'var(--nm-surface)',
          borderTop: '1px solid var(--nm-border)',
          padding: '2.5rem 0 5rem',
        }}
      >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <h2
          className="nm-display"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
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
                  borderTop: a ? `4px solid ${a.color}` : '1px solid var(--nm-border)',
                  background: a ? `color-mix(in srgb, ${a.color} 5%, var(--nm-surface))` : 'var(--nm-surface)',
                  textDecoration: 'none',
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
                className="nm-home-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {a && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: `color-mix(in srgb, ${a.color} 16%, transparent)`,
                      }}
                    >
                      <DomainIcon groupKey={a.groupKey} color={a.color} size={16} />
                    </span>
                  )}
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--nm-text-primary)' }}>
                    {section.label}
                  </span>
                </div>
                <div className="nm-display" style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
                  {section.pages.length} page{section.pages.length === 1 ? '' : 's'}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      </section>
    </div>
  );
}
