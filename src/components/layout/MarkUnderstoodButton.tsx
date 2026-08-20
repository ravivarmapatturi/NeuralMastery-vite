import { useLocation } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';

/** The actual control that makes ProgressContext's "understood" state
 * settable -- without this, useProgress().toggle() was never called
 * anywhere in the app, so every page's completion bar on the learning
 * path map and the progress dashboard was permanently stuck at 0%. */
export default function MarkUnderstoodButton() {
  const location = useLocation();
  const { isUnderstood, toggle } = useProgress();
  const understood = isUnderstood(location.pathname);

  return (
    <button
      type="button"
      onClick={() => toggle(location.pathname)}
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
