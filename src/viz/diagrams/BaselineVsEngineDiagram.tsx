import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const PROBLEMS = [
  { key: 'batching', label: 'Poor batching', baseline: 'One request at a time, or naive fixed batches', engine: 'Continuous batching -- requests join/leave every decode step' },
  { key: 'kv', label: 'No paged KV cache', baseline: 'Contiguous, over-reserved memory per request', engine: 'PagedAttention -- fixed-size blocks, no fragmentation' },
  { key: 'kernel', label: 'Slow per-kernel-launch overhead', baseline: 'Every op is a separate kernel launch', engine: 'Fused kernels, CUDA graphs' },
];

/** Every engine exists to fix a SPECIFIC scaling problem plain PyTorch
 * inference has -- click a problem to see baseline vs. engine side by
 * side, instead of just being told "engines are faster." */
export default function BaselineVsEngineDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('kv');
  const baselineColor = t.textMuted;
  const engineColor = getConceptColor(t, 'attention');
  const active = PROBLEMS.find((p) => p.key === selected)!;

  return (
    <VisualizationContainer footer="Naming which problem you actually have is worth doing before reaching for a heavier tool to fix it -- low-traffic prototyping genuinely doesn't need any of this yet.">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {PROBLEMS.map((p) => (
          <div key={p.key} onClick={() => setSelected(p.key)} style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: selected === p.key ? 700 : 500, background: selected === p.key ? `${engineColor}25` : t.surfaceAlt, border: `1.25px solid ${selected === p.key ? engineColor : t.border}`, color: selected === p.key ? engineColor : t.textSecondary }}>
            {p.label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: 8, background: t.surfaceAlt, border: `1.5px solid ${baselineColor}` }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: baselineColor, marginBottom: 4 }}>Plain PyTorch</div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>{active.baseline}</div>
        </div>
        <div style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: 8, background: `${engineColor}12`, border: `1.5px solid ${engineColor}` }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: engineColor, marginBottom: 4 }}>Dedicated engine</div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>{active.engine}</div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
