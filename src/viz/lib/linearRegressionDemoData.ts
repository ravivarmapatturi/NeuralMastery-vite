// Shared demo dataset for the scatter-fit and residual-plot diagrams on
// linear-regression.mdx -- both need to agree on the exact same fitted
// line, so it's computed once here rather than duplicated per component.
export const POINTS: { x: number; y: number }[] = [
  { x: 0.5, y: 45 }, { x: 1, y: 51 }, { x: 1.5, y: 48 }, { x: 2, y: 58 },
  { x: 2.5, y: 60 }, { x: 3, y: 55 }, { x: 3.5, y: 68 }, { x: 4, y: 72 },
  { x: 4.5, y: 66 }, { x: 5, y: 78 }, { x: 5.5, y: 82 }, { x: 6, y: 74 },
  { x: 6.5, y: 88 }, { x: 7, y: 91 }, { x: 7.5, y: 85 }, { x: 8, y: 94 },
];

const n = POINTS.length;
const meanX = POINTS.reduce((s, p) => s + p.x, 0) / n;
const meanY = POINTS.reduce((s, p) => s + p.y, 0) / n;
const num = POINTS.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
const den = POINTS.reduce((s, p) => s + (p.x - meanX) ** 2, 0);

export const SLOPE = num / den;
export const INTERCEPT = meanY - SLOPE * meanX;

export function predict(x: number): number {
  return SLOPE * x + INTERCEPT;
}

export const RESIDUALS = POINTS.map((p) => ({ x: p.x, residual: p.y - predict(p.x) }));
