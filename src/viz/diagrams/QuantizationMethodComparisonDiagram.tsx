import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const METHODS = [
  { key: 'ptq', label: 'PTQ', retrain: false, quality: 2, speed: 3, desc: 'Quantize an already-trained model, no retraining -- fast and simple, the default approach.' },
  { key: 'qat', label: 'QAT', retrain: true, quality: 3, speed: 1, desc: 'Simulate quantization DURING training so the model learns to be robust to it -- higher quality at a given bit-width, but requires a training run.' },
  { key: 'gptq', label: 'GPTQ', retrain: false, quality: 2, speed: 2, desc: 'PTQ, layer-by-layer, minimizing each layer\'s reconstruction error -- one of the earliest widely-adopted 4-bit schemes.' },
  { key: 'awq', label: 'AWQ', retrain: false, quality: 3, speed: 2, desc: 'Identifies and preserves the weights that matter most (by activation magnitude) at higher precision -- often beats GPTQ at the same bit-width.' },
  { key: 'smoothquant', label: 'SmoothQuant', retrain: false, quality: 2, speed: 3, desc: 'Shifts quantization difficulty from activations to weights via equivalent rescaling -- enables efficient INT8 activation quantization.' },
  { key: 'hqq', label: 'HQQ', retrain: false, quality: 2, speed: 3, desc: 'Fast, calibration-data-free -- useful when representative calibration data isn\'t available.' },
  { key: 'aqlm', label: 'AQLM', retrain: false, quality: 1, speed: 1, desc: 'Extreme low-bit (~2-bit) via additive quantization -- pushes compression further than GPTQ/AWQ, at higher complexity.' },
];

function Dots({ n, color, t }: { n: number; color: string; t: ReturnType<typeof useVizTokens> }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= n ? color : t.border }} />)}</div>;
}

/** Seven quantization methods on the axes that actually differ: does it
 * need a training run, quality retained, ease/speed of applying it.
 * Click a row. */
export default function QuantizationMethodComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('awq');
  const color = getConceptColor(t, 'attention');
  const active = METHODS.find((m) => m.key === selected)!;

  return (
    <VisualizationContainer footer={active.desc}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Method</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Needs retraining?</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Quality retained</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Speed/ease</th>
            </tr>
          </thead>
          <tbody>
            {METHODS.map((m) => {
              const isSelected = selected === m.key;
              return (
                <tr key={m.key} onClick={() => setSelected(m.key)} onMouseEnter={() => setSelected(m.key)} style={{ cursor: 'pointer', background: isSelected ? `${color}12` : 'transparent' }}>
                  <td style={{ padding: '5px 6px', fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{m.label}</td>
                  <td style={{ padding: '5px 6px', color: m.retrain ? t.accentWarn : t.textMuted }}>{m.retrain ? 'yes' : 'no'}</td>
                  <td style={{ padding: '5px 6px' }}><Dots n={m.quality} color={color} t={t} /></td>
                  <td style={{ padding: '5px 6px' }}><Dots n={m.speed} color={color} t={t} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        QAT is the only one requiring a training run -- everything else is applied to an already-trained model.
      </div>
    </VisualizationContainer>
  );
}
