import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const FAMILIES = [
  { key: 'gnn', label: 'GNNs', fits: 'Data that\'s naturally a graph -- social networks, molecules, road networks.' },
  { key: 'metric', label: 'Metric Learning', fits: 'The class set is huge, open-ended, or unknown at training time -- face ID, one-shot recognition.' },
  { key: 'rl', label: 'RL Networks', fits: 'Maximize a reward through interaction, no fixed labels -- games, robotics, RLHF.' },
  { key: 'ssl', label: 'SSL', fits: 'Unlabeled data, need general-purpose representations before fine-tuning.' },
  { key: 'multimodal', label: 'Multimodal', fits: 'Combining two or more input types -- text, image, audio -- in one model.' },
  { key: 'ts', label: 'Time Series-specific', fits: 'Sequential, ordered numeric data where causality (only the past) matters.' },
];

/** Six architecture families, each for data or objectives outside the
 * standard supervised mold -- click one for the data shape it fits. */
export default function AdvancedArchDomainMapDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('gnn');
  const color = getConceptColor(t, 'attention');
  const f = FAMILIES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={f.fits}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {FAMILIES.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
