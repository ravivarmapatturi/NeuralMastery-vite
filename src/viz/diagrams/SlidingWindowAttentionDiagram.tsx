import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const SEQ_LEN = 12;

/** Each query attends only within a window of the immediately preceding
 * keys -- drag the window size and watch the O(n^2) full-attention
 * triangle collapse to a narrow O(n * w) band. */
export default function SlidingWindowAttentionDiagram() {
  const t = useVizTokens();
  const [windowSize, setWindowSize] = useState(3);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const color = getConceptColor(t, 'attention');
  const cell = 26;

  const inWindow = (row: number, col: number) => col <= row && col > row - windowSize;
  const totalCells = Array.from({ length: SEQ_LEN }, (_, row) => Array.from({ length: SEQ_LEN }, (_, col) => inWindow(row, col)).filter(Boolean).length).reduce((a, b) => a + b, 0);
  const fullCells = (SEQ_LEN * (SEQ_LEN + 1)) / 2;

  return (
    <VisualizationContainer footer={`Attended pairs: ${totalCells} vs. ${fullCells} for full causal attention at this sequence length -- the window keeps cost linear in sequence length instead of quadratic, while information can still propagate indirectly across multiple layers (row 8 reaches row 5 via row 6 and 7's own windows in an earlier layer).`}>
      <Slider label={`window size = ${windowSize}`} min={1} max={SEQ_LEN} step={1} value={windowSize} onChange={setWindowSize} />
      <svg width="100%" viewBox={`0 0 ${40 + SEQ_LEN * cell} ${20 + SEQ_LEN * cell}`} style={{ display: 'block', marginTop: 8 }}>
        {Array.from({ length: SEQ_LEN }, (_, row) =>
          Array.from({ length: SEQ_LEN }, (_, col) => {
            const ok = inWindow(row, col);
            const rowHighlight = hoveredRow === row;
            return (
              <rect
                key={`${row}-${col}`}
                x={40 + col * cell}
                y={20 + row * cell}
                width={cell - 2}
                height={cell - 2}
                rx={2}
                fill={ok ? `${color}${rowHighlight ? '60' : '40'}` : t.surfaceAlt}
                stroke={ok ? color : t.border}
                strokeWidth={ok && rowHighlight ? 2 : 1}
                onMouseEnter={() => setHoveredRow(row)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })
        )}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Row = query position, column = key position. Hover a row to trace one query's window.
      </div>
    </VisualizationContainer>
  );
}
