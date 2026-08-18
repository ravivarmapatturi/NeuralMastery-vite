// Shared color-interpolation helpers for canvas heatmaps (loss landscapes,
// decision-boundary regions, etc.) -- extracted after Linear and Logistic
// Regression Studios were found to duplicate this exact trio verbatim.

export function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function blendColor(c0: [number, number, number], c1: [number, number, number], t: number): string {
  const [r0, g0, b0] = c0;
  const [r1, g1, b1] = c1;
  return `rgb(${lerp(r0, r1, t) | 0}, ${lerp(g0, g1, t) | 0}, ${lerp(b0, b1, t) | 0})`;
}
