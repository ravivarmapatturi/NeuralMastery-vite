import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** A concrete MoE example -- drag total params and active-expert
 * fraction, watch inference compute cost track ACTIVE params only, while
 * memory footprint still depends on the TOTAL (every expert has to be
 * loaded even if only a few run per token). */
export default function ActiveVsTotalParamsDiagram() {
  const t = useVizTokens();
  const [totalB, setTotalB] = useState(47);
  const [activePct, setActivePct] = useState(28); // e.g. Mixtral-8x7B: ~13B active of 47B total ~ 28%
  const totalColor = getConceptColor(t, 'query');
  const activeColor = getConceptColor(t, 'attention');
  const activeB = (totalB * activePct) / 100;

  return (
    <VisualizationContainer footer={`Memory footprint (weights to load): scales with ${totalB}B TOTAL params. Per-token inference COMPUTE: scales with only ${activeB.toFixed(1)}B ACTIVE params. A dense model with ${activeB.toFixed(1)}B params would cost the same to run per-token, but this model has far more knowledge capacity in the ${totalB}B it can draw from.`}>
      <Slider label={`Total parameters: ${totalB}B`} min={7} max={200} step={1} value={totalB} onChange={setTotalB} />
      <Slider label={`Active fraction per token: ${activePct}%`} min={5} max={100} step={1} value={activePct} onChange={setActivePct} />
      <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: Math.min(120, totalB), background: totalColor, opacity: 0.7, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color: totalColor, marginTop: 4, fontWeight: 700 }}>Total: {totalB}B (memory)</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: Math.min(120, activeB), background: activeColor, opacity: 0.7, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color: activeColor, marginTop: 4, fontWeight: 700 }}>Active: {activeB.toFixed(1)}B (compute)</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        This decoupling is exactly why MoE models get more knowledge capacity without a proportional inference-cost increase.
      </div>
    </VisualizationContainer>
  );
}
