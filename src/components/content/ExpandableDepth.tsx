import { useState, type ReactNode } from 'react';
import { useVizTokens, RADIUS, SPACING } from '../../theme/vizTokens';

type Depth = 'eli5' | 'deeper';

const DEPTH_META: Record<Depth, { icon: string; label: string }> = {
  eli5: { icon: '💡', label: 'ELI5' },
  deeper: { icon: '🔬', label: 'Go deeper' },
};

/**
 * The progressive-depth primitive: a page's default body stays exactly
 * where it is (the "Standard" tier -- untouched, always visible), and this
 * wraps optional content one tier lighter (ELI5) or heavier (Go deeper) as
 * an inline expand/collapse -- never a separate route, so "learn on this
 * page" never fragments into "the beginner page" vs "the real page".
 *
 * ELI5 defaults open (it's a short on-ramp meant to be seen first); Go
 * deeper defaults closed (it's the opt-in expert extra, not required
 * reading). Both are plain <button>-driven disclosure, so keyboard/AT
 * support comes for free -- no custom role/tabIndex wiring needed here,
 * unlike the SVG-based diagram controls elsewhere on this site.
 */
function ExpandableDepth({ kind, title, defaultOpen, children }: { kind: Depth; title?: string; defaultOpen?: boolean; children: ReactNode }) {
  const t = useVizTokens();
  const meta = DEPTH_META[kind];
  const [open, setOpen] = useState(defaultOpen ?? kind === 'eli5');
  const color = kind === 'eli5' ? t.accentTeal : t.accentPurple;

  return (
    <div
      style={{
        margin: `${SPACING.sm}px 0`,
        border: `1px solid ${t.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: RADIUS.sm,
        background: t.surfaceAlt,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: `${SPACING.xs}px ${SPACING.sm}px`,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontWeight: 700,
          fontSize: 14,
          color,
        }}
      >
        <span aria-hidden="true">{meta.icon}</span>
        <span>{title ?? meta.label}</span>
        <span
          aria-hidden="true"
          style={{ marginLeft: 'auto', fontSize: 11, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}
        >
          ▶
        </span>
      </button>
      {open && (
        <div style={{ padding: `0 ${SPACING.sm}px ${SPACING.xs}px` }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** A short, plain-language on-ramp before the standard explanation gets
 * technical -- open by default, collapsible for anyone who wants to skip
 * straight to the real content. */
export function ELI5({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <ExpandableDepth kind="eli5" title={title}>
      {children}
    </ExpandableDepth>
  );
}

/** The expert extra beyond the standard explanation -- a fuller derivation,
 * an edge case, formal detail. Closed by default: opt-in depth, not
 * something every reader has to scroll past. */
export function GoDeeper({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <ExpandableDepth kind="deeper" title={title} defaultOpen={false}>
      {children}
    </ExpandableDepth>
  );
}
