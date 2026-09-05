import { useLocation } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { useGamification } from '../../contexts/GamificationContext';
import { normalizeRoute } from '../../lib/contentTree';

/** The actual control that makes ProgressContext's "understood" state
 * settable -- without this, useProgress().toggle() was never called
 * anywhere in the app, so every page's completion bar on the learning
 * path map and the progress dashboard was permanently stuck at 0%.
 *
 * Normalizes the trailing slash out of location.pathname before using it
 * as the permalink key -- every other route value in the app (DocPage.route,
 * getPageByRoute's matching) is normalized the same way, but a page
 * reached via a direct/bookmarked URL gets GitHub Pages' redirected,
 * trailing-slash pathname here (see contentTree.ts's normalizeRoute),
 * while the identical page reached via an in-app <Link> click doesn't --
 * without this, the same logical page could get tracked under two
 * different keys depending purely on how a visitor arrived at it. */
export default function MarkUnderstoodButton() {
  const location = useLocation();
  const permalink = normalizeRoute(location.pathname);
  const { isUnderstood, toggle } = useProgress();
  const { awardMarkUnderstood } = useGamification();
  const understood = isUnderstood(permalink);

  return (
    <button
      type="button"
      onClick={() => {
        if (!understood) awardMarkUnderstood(permalink); // only on the mark-as-understood transition, never on un-marking
        toggle(permalink);
      }}
      aria-pressed={understood}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: '2.5rem',
        padding: '0.6rem 1rem',
        borderRadius: 10,
        border: `1.5px solid ${understood ? 'var(--nm-accent-primary)' : 'var(--nm-border)'}`,
        background: understood ? 'color-mix(in srgb, var(--nm-accent-primary) 12%, transparent)' : 'transparent',
        color: understood ? 'var(--nm-accent-primary)' : 'var(--nm-text-secondary)',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <span aria-hidden="true">{understood ? '✓' : '○'}</span>
      {understood ? 'Marked as understood' : 'Mark as understood'}
    </button>
  );
}
