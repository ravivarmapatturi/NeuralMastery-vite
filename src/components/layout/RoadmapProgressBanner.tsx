import { Link } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { getSidebar } from '../../lib/contentTree';
import { getGroupForSubsection } from '../../data/sectionMeta';

/** Connects two systems that already exist but never talked to each
 * other: every roadmap.mdx page lists what a section covers, and
 * ProgressContext already tracks which of those pages a visitor has
 * personally marked understood -- but until now a roadmap page had no
 * idea how much of itself a given visitor had actually covered. Reuses
 * getSidebar()'s existing per-section grouping and useProgress().countWithin
 * (the same primitive ProgressPage.tsx's "By section" breakdown already
 * uses), so this is pure aggregation over already-correct, already-tested
 * data -- no new tracking. Mounted once from DocLayout.tsx for every
 * route ending in `/roadmap`, not hand-edited into 28 separate files. */
export default function RoadmapProgressBanner({ section }: { section: string }) {
  const { countWithin } = useProgress();
  const sidebarSection = getSidebar().find((s) => s.id === section);
  if (!sidebarSection || sidebarSection.pages.length === 0) return null;

  const routes = sidebarSection.pages.map((p) => p.route);
  const total = routes.length;
  const done = countWithin(routes);
  const pct = done / total;
  const color = getGroupForSubsection(section)?.meta.color ?? 'var(--nm-accent-primary)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0.75rem 1rem',
        borderRadius: 10,
        border: '1px solid var(--nm-border)',
        background: 'var(--nm-surface)',
        marginBottom: '1.75rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--nm-text-secondary)', marginBottom: 6 }}>
          You've marked <strong style={{ color: 'var(--nm-text-primary)' }}>{done}</strong> of{' '}
          <strong style={{ color: 'var(--nm-text-primary)' }}>{total}</strong> pages in {sidebarSection.label} understood.{' '}
          <Link to="/progress" style={{ color: 'var(--nm-accent-primary)' }}>
            View your progress →
          </Link>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'var(--nm-border)', overflow: 'hidden' }}>
          <div style={{ width: `${pct * 100}%`, height: '100%', background: color, transition: 'width 200ms ease' }} />
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'var(--nm-text-muted)', flexShrink: 0 }}>{Math.round(pct * 100)}%</span>
    </div>
  );
}
