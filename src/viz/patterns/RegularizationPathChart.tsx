import { scaleLinear } from 'd3';
import { VisualizationCanvas } from '../primitives';
import type { VizTokens } from '../../theme/vizTokens';

export interface PathPoint {
  lambda: number;
  w: number[];
}

/**
 * A coefficient-vs-lambda regularization path: one polyline per feature,
 * a dashed marker at the current lambda, and a dot per feature at that
 * point. Identical between Ridge and Lasso Regression Studios -- extracted
 * here after porting both revealed the exact same SVG chart, differing
 * only in which solver produced `path`/`current`.
 */
export default function RegularizationPathChart({
  path,
  lambda,
  lambdaMax,
  currentW,
  featureNames,
  colors,
  t,
}: {
  path: PathPoint[];
  lambda: number;
  lambdaMax: number;
  currentW: number[];
  featureNames: string[];
  colors: string[];
  t: VizTokens;
}) {
  const yDomain = (() => {
    let min = 0;
    let max = 0;
    path.forEach((p) => {
      p.w.forEach((v) => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    const pad = (max - min) * 0.15 || 1;
    return [min - pad, max + pad] as [number, number];
  })();

  return (
    <VisualizationCanvas aspect={16 / 8} minHeight={260} maxHeight={340}>
      {({ width, height }) => {
        const margin = 36;
        const xScale = scaleLinear().domain([0, lambdaMax]).range([margin, width - margin]);
        const yScale = scaleLinear().domain(yDomain).range([height - margin, margin]);

        return (
          <svg width={width} height={height} style={{ display: 'block' }}>
            <rect x={0} y={0} width={width} height={height} fill={t.background} />
            <line x1={margin} y1={yScale(0)} x2={width - margin} y2={yScale(0)} stroke={t.border} strokeWidth={1} />
            {featureNames.map((name, j) => {
              const pts = path.map((p) => `${xScale(p.lambda)},${yScale(p.w[j])}`).join(' ');
              return <polyline key={name} points={pts} fill="none" stroke={colors[j]} strokeWidth={2} opacity={0.9} />;
            })}
            <line x1={xScale(lambda)} y1={margin} x2={xScale(lambda)} y2={height - margin} stroke={t.textPrimary} strokeWidth={1} strokeDasharray="4 3" />
            {currentW.map((v, j) => (
              <circle key={j} cx={xScale(lambda)} cy={yScale(v)} r={4.5} fill={colors[j]} stroke={t.background} strokeWidth={1.5} />
            ))}
          </svg>
        );
      }}
    </VisualizationCanvas>
  );
}
