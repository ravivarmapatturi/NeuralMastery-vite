import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const HIDDEN = 128;
const INPUT = 128;
/** Each gate is a dense layer over [h_{t-1}, x_t] -> hidden: (hidden + input) * hidden + hidden params. */
const gateParams = (hidden: number, input: number) => (hidden + input) * hidden + hidden;

/** Same underlying gate-parameter formula, side by side: LSTM's 4 gates
 * (forget, input, candidate, output) vs. GRU's 2 (reset, update) plus a
 * candidate -- click either side to total its parameter count at a
 * concrete hidden size, making "GRU has fewer parameters" a computed
 * number instead of an assertion. */
export default function LstmVsGruDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState<'lstm' | 'gru' | null>(null);
  const perGate = gateParams(HIDDEN, INPUT);
  const lstmTotal = perGate * 4;
  const gruTotal = perGate * 3;

  const lstmGates = ['forget f_t', 'input i_t', 'candidate c̃_t', 'output o_t'];
  const gruGates = ['reset r_t', 'update z_t', 'candidate h̃_t'];

  const width = 520;
  const height = 210;
  const colW = width / 2 - 20;

  function Column({ x, id, gates, hasCellState, total }: { x: number; id: 'lstm' | 'gru'; gates: string[]; hasCellState: boolean; total: number }) {
    const isSelected = selected === id;
    const color = id === 'lstm' ? t.accentDanger : t.accentSecondary;
    return (
      <g onClick={() => setSelected(isSelected ? null : id)} onMouseEnter={() => setSelected(id)} style={{ cursor: 'pointer' }}>
        <rect x={x} y={10} width={colW} height={height - 20} rx={10} fill={isSelected ? `${color}18` : t.surfaceAlt} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
        <text x={x + colW / 2} y={32} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>{id.toUpperCase()}</text>
        {gates.map((g, i) => (
          <text key={g} x={x + colW / 2} y={56 + i * 20} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={t.textSecondary}>{g}</text>
        ))}
        <text x={x + colW / 2} y={56 + gates.length * 20 + 4} textAnchor="middle" fontSize={9} fill={t.textMuted}>
          {hasCellState ? 'separate cell state c_t' : 'no separate cell state'}
        </text>
        {isSelected && (
          <text x={x + colW / 2} y={height - 16} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
            {total.toLocaleString()} params
          </text>
        )}
      </g>
    );
  }

  return (
    <VisualizationContainer footer={`At hidden size ${HIDDEN} (input size ${INPUT}): each gate costs (hidden+input)·hidden+hidden = ${perGate.toLocaleString()} params. LSTM's extra output-gate gives it ${((lstmTotal / gruTotal - 1) * 100).toFixed(0)}% more parameters than GRU for the identical hidden size -- click either card to see the total.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <Column x={10} id="lstm" gates={lstmGates} hasCellState total={lstmTotal} />
        <Column x={width / 2 + 10} id="gru" gates={gruGates} hasCellState={false} total={gruTotal} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a card for its parameter count at hidden size {HIDDEN} — same formula, one fewer gate.
      </div>
    </VisualizationContainer>
  );
}
