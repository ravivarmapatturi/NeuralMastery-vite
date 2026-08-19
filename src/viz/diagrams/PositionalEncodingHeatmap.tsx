import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import DiagramMatrix from './DiagramMatrix';
import { DIAGRAM_TYPE } from './diagramSystem';

const D_MODEL = 512;
const N_POS = 12;
const N_DIMS = 16; // sampled evenly across the full 512, not all 512 -- same "far smaller so it fits on screen" move the worked example makes

function pe(pos: number, dim: number): number {
  const i = Math.floor(dim / 2);
  const angle = pos / 10000 ** ((2 * i) / D_MODEL);
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

const SAMPLED_DIMS = Array.from({ length: N_DIMS }, (_, k) => Math.round((k * (D_MODEL - 1)) / (N_DIMS - 1)));

/** The full PE matrix, real values, sampled down to a screen-sized grid.
 * Low dimension indices (left) oscillate fast across position; high
 * indices (right) barely move across these 12 positions -- the "fine vs.
 * coarse position detail" claim made visible, not just asserted. */
export default function PositionalEncodingHeatmap() {
  const t = useVizTokens();
  const [hover, setHover] = useState<{ pos: number; dim: number; v: number } | null>(null);

  const data = Array.from({ length: N_POS }, (_, pos) => SAMPLED_DIMS.map((dim) => pe(pos, dim)));

  return (
    <VisualizationContainer footer="Each row is one position's full encoding vector; each column is one dimension. Columns near dim 0 cycle through a full sine wave in just a few positions; columns near dim 511 barely move -- every row still ends up a unique fingerprint across the full vector.">
      <div style={{ overflowX: 'auto' }}>
        <DiagramMatrix
          data={data}
          concept="embedding"
          rowLabels={Array.from({ length: N_POS }, (_, p) => `pos ${p}`)}
          colLabels={SAMPLED_DIMS.map((d) => `${d}`)}
          cellSize={30}
          maxAbs={1}
          showValues={false}
          onCellHover={(r, c, v) => setHover({ pos: r, dim: SAMPLED_DIMS[c], v })}
          onCellLeave={() => setHover(null)}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: DIAGRAM_TYPE.caption.size, color: t.textSecondary, fontFamily: 'monospace' }}>
        {hover ? `PE(${hover.pos}, ${hover.dim}) = ${hover.v.toFixed(3)}` : 'hover a cell for its real value'}
      </div>
    </VisualizationContainer>
  );
}
