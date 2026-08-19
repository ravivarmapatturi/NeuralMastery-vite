import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Layer = 'pattern' | 'protocol';
const LAYERS: { key: Layer; label: string; examples: string[]; desc: string }[] = [
  { key: 'pattern', label: 'Coordination pattern (architecture)', examples: ['Orchestrator / sub-agent', 'Peer-to-peer', 'Hierarchical'], desc: 'The SHAPE of how agents collaborate -- who delegates to whom, decided by the system designer.' },
  { key: 'protocol', label: 'Communication protocol (transport)', examples: ['A2A', 'Shared process / direct function calls'], desc: 'The MECHANISM that actually moves a task and its updates between agents once the pattern says who talks to whom.' },
];

/** A2A sits one layer below multi-agent coordination patterns -- the
 * pattern decides WHO talks to whom, the protocol is HOW that
 * conversation actually happens on the wire. Click a layer. */
export default function ProtocolStackDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState<Layer>('protocol');
  const color = (k: Layer) => (k === 'pattern' ? getConceptColor(t, 'attention') : getConceptColor(t, 'key'));
  const active = LAYERS.find((l) => l.key === selected)!;

  return (
    <VisualizationContainer footer={active.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LAYERS.map((l) => {
          const isSelected = selected === l.key;
          const c = color(l.key);
          return (
            <div
              key={l.key}
              onClick={() => setSelected(l.key)}
              onMouseEnter={() => setSelected(l.key)}
              style={{ cursor: 'pointer', padding: '0.8rem 1rem', borderRadius: 9, background: isSelected ? `${c}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? c : t.border}` }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: c }}>{l.label}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{l.examples.join(' · ')}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        See <a href="/docs/agents/multi-agent-systems" style={{ color: t.accentSecondary }}>Multi-Agent Systems</a> for the coordination-pattern layer this protocol serves.
      </div>
    </VisualizationContainer>
  );
}
