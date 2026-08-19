import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

function swish(x: number) {
  return x / (1 + Math.exp(-x));
}

/** SwiGLU's gate xW3 is a per-element multiplier on Swish(xW1) -- drag the
 * gate value and watch how much of the Swish branch actually survives to
 * the output, the concrete mechanics behind "the network learns which
 * features to let through." */
export default function SwiGluGatingDiagram() {
  const t = useVizTokens();
  const [swishInput, setSwishInput] = useState(2);
  const [gateValue, setGateValue] = useState(0.7);
  const swishColor = getConceptColor(t, 'attention');
  const gateColor = t.accentWarn;
  const outColor = getConceptColor(t, 'output');

  const swishOut = swish(swishInput);
  const gated = swishOut * gateValue;
  const barMax = 3;
  const barH = (v: number) => Math.min(1, Math.abs(v) / barMax) * 60;

  return (
    <VisualizationContainer footer="Two parallel projections of the same input x: Swish(xW1) is the 'content' branch, xW3 is a learned per-element GATE in (roughly) [0,1]-ish range controlling how much of that content passes through, before W2 projects the product back down. The gate itself is learned, not fixed.">
      <Slider label={`Swish(xW1) input = ${swishInput.toFixed(1)}`} min={-4} max={4} step={0.1} value={swishInput} onChange={setSwishInput} />
      <Slider label={`gate xW3 = ${gateValue.toFixed(2)}`} min={0} max={1} step={0.05} value={gateValue} onChange={setGateValue} />
      <svg width="100%" viewBox="0 0 400 140" style={{ display: 'block', marginTop: 10 }}>
        <rect x={60} y={60 - barH(swishOut)} width={40} height={barH(swishOut)} fill={swishColor} opacity={0.8} rx={3} />
        <text x={80} y={78} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={swishColor}>Swish={swishOut.toFixed(2)}</text>

        <text x={140} y={40} fontSize={16} fill={t.textMuted}>×</text>

        <rect x={160} y={60 - barH(gateValue) * 60 / 1} width={40} height={gateValue * 60} fill={gateColor} opacity={0.8} rx={3} />
        <text x={180} y={78} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={gateColor}>gate={gateValue.toFixed(2)}</text>

        <text x={240} y={40} fontSize={16} fill={t.textMuted}>=</text>

        <rect x={260} y={60 - barH(gated)} width={40} height={barH(gated)} fill={outColor} opacity={0.85} rx={3} />
        <text x={280} y={78} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={outColor}>out={gated.toFixed(2)}</text>

        <line x1={0} y1={60} x2={340} y2={60} stroke={t.border} strokeWidth={1} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Gate near 0 -- this feature is blocked regardless of its Swish activation. Gate near 1 -- it passes through nearly unchanged.
      </div>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <VisualizationMath latex="\text{SwiGLU}(x) = \text{Swish}(xW_1) \odot (xW_3)\, W_2" />
      </div>
    </VisualizationContainer>
  );
}
