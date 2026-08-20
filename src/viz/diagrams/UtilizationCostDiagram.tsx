import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';

const QUADRANTS = [
  { key: 'low-high', util: 'low', bill: 'high', label: 'Low util, high bill', desc: 'A fixable efficiency problem -- a data-loading bottleneck, insufficient batching, or over-provisioned capacity. The fix is technical.', tone: 'warn' },
  { key: 'high-high', util: 'high', bill: 'high', label: 'High util, high bill', desc: 'A genuine scale/pricing problem -- the GPUs are actually being used. The fix is a different model, a cheaper engine, or accepting the cost.', tone: 'bad' },
  { key: 'low-low', util: 'low', bill: 'low', label: 'Low util, low bill', desc: 'Small-scale or early-stage -- inefficiency exists but isn\'t costing much yet.', tone: 'ok' },
  { key: 'high-low', util: 'high', bill: 'low', label: 'High util, low bill', desc: 'The target state -- capacity is being used efficiently and cost reflects genuine need.', tone: 'ok' },
];

/** GPU utilization and total spend, cross-tabulated -- click a
 * quadrant to see whether a high bill means "fix the pipeline" or
 * "this is genuinely what it costs." */
export default function UtilizationCostDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('low-high');
  const q = QUADRANTS.find((x) => x.key === active)!;
  const toneColor = (tone: string) => (tone === 'ok' ? t.accentPrimary : tone === 'warn' ? t.accentWarn : t.accentDanger);

  return (
    <VisualizationContainer footer={q.desc}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {QUADRANTS.map((x) => {
          const isActive = active === x.key;
          const c = toneColor(x.tone);
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.6rem 0.5rem', borderRadius: 7, textAlign: 'center', background: isActive ? `${c}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? c : t.border}` }}>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, color: isActive ? c : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: t.textMuted, marginTop: 6 }}>
        <span>← utilization →</span>
        <span style={{ color: t.textSecondary }}>bill ↕</span>
      </div>
    </VisualizationContainer>
  );
}
