// Neural Mastery technical-diagram design system.
//
// The point of this file: every rebuilt attention/transformer diagram reads
// from the SAME typography scale, stroke widths, spacing, and semantic
// color mapping, so the diagrams read as one designer's work instead of
// each component inventing its own conventions. Modeled on what actually
// makes reference implementations like Transformer Explainer feel
// consistent -- not fancier D3, but disciplined, reused tokens:
//   - one stroke/arrow vocabulary reused everywhere a line is drawn
//   - a bounded, stable concept -> color mapping (never recolored per-diagram)
//   - value-encoded color (interpolated by magnitude) for tensors, not flat fills
//   - fixed opacity levels per "how active/relevant is this right now"
//
// All colors are resolved from useVizTokens() at render time (never a
// literal hex baked into a component), so every diagram automatically
// tracks dark/light mode and all 5 page skins for free -- no separate
// light.svg/dark.svg, matching how the rest of the viz layer already works.
import type { VizTokens } from '../../theme/vizTokens';

export const DIAGRAM_TYPE = {
  title: { size: 15, weight: 700 },
  label: { size: 13, weight: 600 },
  secondaryLabel: { size: 11, weight: 500 },
  caption: { size: 12, weight: 400 },
  math: { size: 13, weight: 500 },
  cellValue: { size: 10, weight: 500 },
} as const;

export const DIAGRAM_STROKE = {
  hairline: 1,
  regular: 1.5,
  bold: 2.5,
  arrowheadSize: 6,
} as const;

export const DIAGRAM_SPACING = {
  cellGap: 2,
  stageGap: 48,
  labelGap: 8,
  padding: 16,
} as const;

export const DIAGRAM_RADIUS = {
  cell: 3,
  node: 8,
  chip: 999,
} as const;

/** Fixed opacity per "how active/foregrounded is this element right now" --
 * mirrors Transformer Explainer's per-stage opacity constants rather than
 * ad hoc per-component values. */
export const DIAGRAM_OPACITY = {
  active: 1,
  computed: 0.85,
  inactive: 0.35,
  masked: 0.12,
  ghost: 0.06,
} as const;

export const DIAGRAM_ANIMATION = {
  fast: 150,
  normal: 350,
  slow: 600,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export type DiagramConcept = 'token' | 'embedding' | 'query' | 'key' | 'value' | 'attention' | 'output' | 'masked';

/**
 * Stable concept -> color identity, reused across EVERY diagram on this
 * page (and meant to extend to future pages). Never recolor a concept
 * between diagrams -- if Query is purple in one diagram, it's purple in
 * all of them.
 */
export function getConceptColor(t: VizTokens, concept: DiagramConcept): string {
  switch (concept) {
    case 'token':
      return t.textSecondary;
    case 'embedding':
      return t.accentSecondary;
    case 'query':
      return t.accentPurple;
    case 'key':
      return t.accentTeal;
    case 'value':
      return t.accentWarn;
    case 'attention':
      return t.accentPrimary;
    case 'output':
      return t.accentPrimary;
    case 'masked':
      return t.textMuted;
  }
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** Value-encoded cell color: interpolates surface -> concept color by
 * magnitude (0..1), the same convention used for every tensor cell in
 * every diagram -- color always carries information, never decoration. */
export function valueColor(t: VizTokens, concept: DiagramConcept, magnitude: number): string {
  const clamped = Math.max(0, Math.min(1, magnitude));
  const [r0, g0, b0] = hexToRgbTuple(t.mode === 'dark' ? '#1E1E21' : '#EEF0F2');
  const [r1, g1, b1] = hexToRgbTuple(getConceptColor(t, concept));
  const r = Math.round(r0 + (r1 - r0) * clamped);
  const g = Math.round(g0 + (g1 - g0) * clamped);
  const b = Math.round(b0 + (b1 - b0) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}
