import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { DIAGRAM_TYPE } from './diagramSystem';

export interface CurveDef {
  label: string;
  color: string;
  fn: (x: number) => number;
  dashed?: boolean;
}

export interface MultiCurveChartProps {
  curves: CurveDef[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  samples?: number;
  width?: number;
  height?: number;
}

/** Shared "N named curves, one shared pair of axes, hover a legend entry
 * to isolate it" primitive -- every function-comparison chart on the site
 * (loss shapes, LR schedules, positional-encoding waves, ...) is this same
 * shape with different data, so it's built once here instead of once per
 * page. Every curve is a real function evaluated live, never a static
 * image. */
export default function MultiCurveChart({ curves, xMin, xMax, yMin, yMax, xLabel, yLabel, samples = 80, width = 560, height = 260 }: MultiCurveChartProps) {
  const t = useVizTokens();
  const [hovered, setHovered] = useState<string | null>(null);

  const padL = 44;
  const padR = 16;
  const padT = 12;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const xFor = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const yFor = (y: number) => padT + plotH - ((Math.max(yMin, Math.min(yMax, y)) - yMin) / (yMax - yMin)) * plotH;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1={padL} y1={yFor(0)} x2={width - padR} y2={yFor(0)} stroke={t.border} strokeWidth={1} />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={t.border} strokeWidth={1} />
        <text x={padL - 8} y={padT + 8} textAnchor="end" fontSize={9} fill={t.textMuted}>{yMax.toFixed(1)}</text>
        <text x={padL - 8} y={padT + plotH} textAnchor="end" fontSize={9} fill={t.textMuted}>{yMin.toFixed(1)}</text>
        <text x={padL} y={height - 6} fontSize={10} fill={t.textMuted}>{xLabel ?? xMin}</text>
        <text x={width - padR} y={height - 6} textAnchor="end" fontSize={10} fill={t.textMuted}>{xLabel ? xMax : xMax}</text>
        {yLabel && (
          <text x={12} y={padT + plotH / 2} textAnchor="middle" fontSize={10} fill={t.textMuted} transform={`rotate(-90 12 ${padT + plotH / 2})`}>{yLabel}</text>
        )}

        {curves.map((c) => {
          const dimmed = hovered !== null && hovered !== c.label;
          const d = Array.from({ length: samples + 1 }, (_, i) => {
            const x = xMin + (i / samples) * (xMax - xMin);
            return `${i === 0 ? 'M' : 'L'} ${xFor(x)},${yFor(c.fn(x))}`;
          }).join(' ');
          return (
            <path
              key={c.label}
              d={d}
              fill="none"
              stroke={c.color}
              strokeWidth={hovered === c.label ? 2.75 : 1.75}
              strokeDasharray={c.dashed ? '5 3' : undefined}
              opacity={dimmed ? 0.15 : 0.95}
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
        {curves.map((c) => (
          <div
            key={c.label}
            onMouseEnter={() => setHovered(c.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: DIAGRAM_TYPE.caption.size, color: hovered === c.label ? c.color : t.textMuted, fontWeight: hovered === c.label ? 700 : 400 }}
          >
            <span style={{ width: 12, height: 3, background: c.color, display: 'inline-block', borderRadius: 2 }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
