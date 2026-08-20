import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** The encoder-decoder-with-skip-connections shape -- click "with
 * skip connections" vs. without to see why fine spatial detail
 * survives the downsample-then-upsample round trip. */
export default function UNetArchitectureDiagram() {
  const t = useVizTokens();
  const [skips, setSkips] = useState(true);
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;
  const stages = [64, 40, 24];

  return (
    <VisualizationContainer footer={skips ? 'Each encoder stage links DIRECTLY to its corresponding decoder stage -- fine spatial detail (exact boundary locations) that pure downsampling would lose gets carried across, exactly what precise segmentation boundaries need.' : 'Without skip connections, the decoder has to reconstruct fine detail purely from the heavily-downsampled bottleneck -- boundary precision degrades, which is exactly why plain encoder-decoder is worse than U-Net for segmentation.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setSkips(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !skips ? 700 : 500, background: !skips ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!skips ? color : t.border}`, color: !skips ? color : t.textSecondary, cursor: 'pointer' }}>
          No skip connections
        </button>
        <button type="button" onClick={() => setSkips(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: skips ? 700 : 500, background: skips ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${skips ? color : t.border}`, color: skips ? color : t.textSecondary, cursor: 'pointer' }}>
          With skip connections (U-Net)
        </button>
      </div>
      <svg width="100%" viewBox="0 0 320 100" style={{ display: 'block' }}>
        {stages.map((w, i) => {
          const x = 10 + i * 50;
          const y = 50 - w / 2;
          return <rect key={`enc${i}`} x={x} y={y} width={35} height={w} rx={4} fill={t.surfaceAlt} stroke={t.border} />;
        })}
        <rect x={160} y={38} width={35} height={24} rx={4} fill={`${okColor}25`} stroke={okColor} />
        {stages.slice().reverse().map((w, i) => {
          const x = 210 + i * 50;
          const y = 50 - w / 2;
          return <rect key={`dec${i}`} x={x} y={y} width={35} height={w} rx={4} fill={t.surfaceAlt} stroke={t.border} />;
        })}
        {skips && stages.map((_, i) => {
          const encX = 10 + i * 50 + 35;
          const decX = 210 + (stages.length - 1 - i) * 50;
          return <line key={`skip${i}`} x1={encX} y1={50} x2={decX} y2={50} stroke={color} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.7} />;
        })}
      </svg>
    </VisualizationContainer>
  );
}
