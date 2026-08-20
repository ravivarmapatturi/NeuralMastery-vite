import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Two runs with identical code/data/params/seeds, differing only in
 * GPU count -- click to see the resulting metrics land close but not
 * bit-identical, why "same result" often means "within documented
 * tolerance." */
export default function HardwareDeterminismDiagram() {
  const t = useVizTokens();
  const [sameHardware, setSameHardware] = useState(false);
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;
  const warnColor = t.accentWarn;

  const lossA = 0.4213;
  const lossB = sameHardware ? 0.4213 : 0.4217;
  const width = 380;

  const xFor = (v: number) => 30 + (v - 0.418) * 4000;

  return (
    <VisualizationContainer footer={sameHardware ? 'Same GPU type and count -- bit-identical output, given the same code/data/params/seeds.' : 'Same code/data/params/seeds, different GPU count -- certain CUDA kernels and mixed-precision ops aren\'t bit-for-bit deterministic across hardware configs. The results land within a documented tolerance, not literally identical.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setSameHardware(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !sameHardware ? 700 : 500, background: !sameHardware ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!sameHardware ? color : t.border}`, color: !sameHardware ? color : t.textSecondary, cursor: 'pointer' }}>
          Different GPU count
        </button>
        <button type="button" onClick={() => setSameHardware(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: sameHardware ? 700 : 500, background: sameHardware ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${sameHardware ? color : t.border}`, color: sameHardware ? color : t.textSecondary, cursor: 'pointer' }}>
          Same hardware
        </button>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} 70`} style={{ display: 'block' }}>
        <line x1={20} y1={35} x2={width - 20} y2={35} stroke={t.border} strokeWidth={1} />
        <circle cx={xFor(lossA)} cy={35} r={6} fill={`${okColor}40`} stroke={okColor} strokeWidth={2} />
        <text x={xFor(lossA)} y={22} textAnchor="middle" fontSize={8} fill={okColor}>run A</text>
        <circle cx={xFor(lossB)} cy={35} r={6} fill={`${sameHardware ? okColor : warnColor}40`} stroke={sameHardware ? okColor : warnColor} strokeWidth={2} />
        <text x={xFor(lossB)} y={55} textAnchor="middle" fontSize={8} fill={sameHardware ? okColor : warnColor}>run B</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        final loss — A: {lossA.toFixed(4)}, B: {lossB.toFixed(4)}
      </div>
    </VisualizationContainer>
  );
}
