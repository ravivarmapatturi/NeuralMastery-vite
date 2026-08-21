import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TASKS = [
  { key: 'classify', label: 'Classification', desc: 'One label for the whole image -- "cat," "dog," "not a defect."' },
  { key: 'detect', label: 'Object Detection', desc: 'Locate AND classify multiple objects with bounding boxes -- the R-CNN/YOLO/SSD lineage is built for this specifically.' },
  { key: 'segment', label: 'Segmentation', desc: 'Classify every pixel -- used in medical imaging, autonomous driving. U-Net, Mask R-CNN, and segmentation-specific families cover this.' },
];

/** Same underlying CNN backbone, three different output granularities
 * -- click a task to see what it actually outputs. */
export default function CnnApplicationsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('detect');
  const color = getConceptColor(t, 'attention');
  const x = TASKS.find((y) => y.key === active)!;

  return (
    <VisualizationContainer footer={x.desc}>
      <div style={{ display: 'flex', gap: 5 }}>
        {TASKS.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', flex: 1, textAlign: 'center', padding: '0.5rem 0.4rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
