import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const NEEDS = [
  { key: 'accuracy', label: 'Best accuracy, compute not tight', pick: 'ViT / Swin backbone' },
  { key: 'realtime', label: 'Real-time detection', pick: 'YOLO' },
  { key: 'highacc', label: 'Highest-accuracy detection', pick: 'Faster R-CNN, DETR' },
  { key: 'medical', label: 'Pixel-level medical segmentation', pick: 'U-Net' },
  { key: 'instance', label: 'Detect + segment instances', pick: 'Mask R-CNN' },
];

/** The choosing-an-architecture table, made interactive -- click a
 * need for the pick. */
export default function VisionArchitectureSelectionDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('realtime');
  const color = getConceptColor(t, 'attention');
  const n = NEEDS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={`Reach for: ${n.pick}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NEEDS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.4rem 0.65rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
