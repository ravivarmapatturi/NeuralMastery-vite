import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const CONFIGS = [
  { key: 'baseline', label: 'Baseline (FP16, no batching)', cost: 8.0 },
  { key: 'quant', label: '+ Quantization (INT4)', cost: 3.2 },
  { key: 'batch', label: '+ Continuous batching', cost: 1.1 },
  { key: 'both', label: '+ Both combined', cost: 0.6 },
];

/** Cost per 1M tokens, the unit that's comparable across models,
 * engines, and hardware -- click a configuration to see what
 * quantization and batching actually do to it. */
export default function CostPerMillionTokensDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('both');
  const color = getConceptColor(t, 'attention');
  const maxCost = 8.0;

  return (
    <VisualizationContainer footer="Quantization shrinks memory and increases throughput per GPU; continuous batching increases GPU utilization -- a rare pair of techniques that both reduce cost per token without trading against each other.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CONFIGS.map((c) => {
          const isActive = active === c.key;
          return (
            <div key={c.key} onClick={() => setActive(c.key)} onMouseEnter={() => setActive(c.key)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: isActive ? color : t.textSecondary, marginBottom: 2, fontWeight: isActive ? 700 : 500 }}>
                <span>{c.label}</span>
                <span>${c.cost.toFixed(2)} / 1M tokens</span>
              </div>
              <div style={{ height: 12, borderRadius: 6, background: t.surfaceAlt, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c.cost / maxCost) * 100}%`, background: isActive ? color : `${color}70`, borderRadius: 6, transition: 'width 0.2s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
