import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const BRANCHES = [
  { key: 'box', label: 'Box branch', desc: 'Inherited from Faster R-CNN -- predicts the bounding box coordinates for each detected object.' },
  { key: 'class', label: 'Class branch', desc: 'Also inherited from Faster R-CNN -- predicts which category the detected object belongs to.' },
  { key: 'mask', label: 'Mask branch', desc: 'The one Mask R-CNN adds -- predicts a pixel-level segmentation mask for each detected object, unifying detection and segmentation in one model.' },
];

/** Mask R-CNN extends Faster R-CNN with a third parallel output head
 * -- click a branch to see what it predicts. */
export default function MaskRcnnBranchesDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('mask');
  const color = getConceptColor(t, 'attention');
  const b = BRANCHES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={b.desc}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ padding: '0.4rem 0.8rem', borderRadius: 6, background: t.surfaceAlt, border: `1px solid ${t.border}`, fontSize: 9, color: t.textSecondary }}>shared region features</div>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {BRANCHES.map((x) => {
          const isActive = active === x.key;
          const isNew = x.key === 'mask';
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.6rem', borderRadius: 7, background: isActive ? `${color}20` : isNew ? `${t.accentPrimary}10` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : isNew ? t.accentPrimary : t.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? color : isNew ? t.accentPrimary : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
