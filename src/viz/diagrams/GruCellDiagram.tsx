import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

type GateKey = 'reset' | 'update';
const GATES: { key: GateKey; label: string; x: number; latex: string; desc: string }[] = [
  { key: 'reset', label: 'r_t', x: 170, latex: 'r_t = \\sigma(W_r[h_{t-1},x_t]+b_r)', desc: 'how much of the old hidden state to use when computing the new candidate' },
  { key: 'update', label: 'z_t', x: 330, latex: 'z_t = \\sigma(W_z[h_{t-1},x_t]+b_z)', desc: 'how much of the old hidden state to keep vs. replace' },
];

/** Two gates, no separate cell state -- GRU folds LSTM's forget/input
 * decision into one interpolation, controlled entirely by the update gate
 * z_t. Simpler topology than LSTM: reset the old state before proposing a
 * candidate, then blend old and candidate by how much z_t says to update. */
export default function GruCellDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<GateKey | null>(null);
  const width = 560;
  const height = 260;
  const lineY = 46;
  const gateY = 150;
  const inputY = 230;
  const resetMulX = 170;
  const candX = 260;
  const interpX = 440;

  const resetColor = t.accentWarn;
  const updateColor = t.accentSecondary;

  function OpNode({ x, y, symbol, color }: { x: number; y: number; symbol: string; color: string }) {
    return (
      <g>
        <circle cx={x} cy={y} r={11} fill={t.surface} stroke={color} strokeWidth={2} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>{symbol}</text>
      </g>
    );
  }

  return (
    <VisualizationContainer footer="No separate cell state to maintain -- the last line is a direct interpolation between the old hidden state and the new candidate, weighted entirely by z_t. That's where GRU's parameter savings come from. Click a gate for its formula.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="gru-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>

        {/* h_{t-1} straight-through path to interpolation */}
        <text x={16} y={lineY - 12} fontSize={10} fontFamily="monospace" fill={t.textMuted}>h_(t-1)</text>
        <line x1={16} y1={lineY} x2={interpX - 40} y2={lineY} stroke={t.textPrimary} strokeWidth={2} />
        <text x={interpX - 70} y={lineY - 8} fontSize={9} fontFamily="monospace" fill={updateColor} opacity={active === null || active === 'update' ? 1 : 0.3}>× (1 − z_t)</text>

        {/* h_{t-1} branch down into reset multiply */}
        <line x1={40} y1={lineY + 6} x2={resetMulX} y2={gateY - 40} stroke={resetColor} strokeWidth={active === 'reset' ? 2.5 : 1.5} opacity={active === null || active === 'reset' ? 1 : 0.3} />
        <OpNode x={resetMulX} y={gateY - 40} symbol="×" color={resetColor} />
        <line x1={resetMulX + 11} y1={gateY - 40} x2={candX - 30} y2={gateY - 22} stroke={resetColor} strokeWidth={1.5} markerEnd="url(#gru-arrow)" opacity={active === null || active === 'reset' ? 1 : 0.3} />

        {/* candidate box */}
        <rect x={candX - 30} y={gateY - 24} width={60} height={34} rx={6} fill={t.surfaceAlt} stroke={t.accentPrimary} strokeWidth={1.5} />
        <text x={candX} y={gateY - 3} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentPrimary}>tanh</text>
        <text x={candX} y={gateY + 24} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={t.accentPrimary}>h̃_t</text>

        {/* candidate -> interpolation (weighted by z_t) */}
        <path d={`M ${candX + 30},${gateY - 8} C ${(candX + interpX) / 2},${gateY - 8} ${(candX + interpX) / 2},${lineY} ${interpX - 20},${lineY}`} fill="none" stroke={t.accentPrimary} strokeWidth={1.5} markerEnd="url(#gru-arrow)" opacity={active === null || active === 'update' ? 1 : 0.3} />
        <text x={(candX + interpX) / 2 + 10} y={gateY - 14} fontSize={9} fontFamily="monospace" fill={updateColor} opacity={active === null || active === 'update' ? 1 : 0.3}>× z_t</text>

        {/* interpolation sum node -> h_t */}
        <OpNode x={interpX} y={lineY} symbol="+" color={updateColor} />
        <line x1={interpX + 11} y1={lineY} x2={width - 40} y2={lineY} stroke={updateColor} strokeWidth={2} markerEnd="url(#gru-arrow)" />
        <text x={width - 34} y={lineY - 8} fontSize={10} fontFamily="monospace" fontWeight={700} fill={updateColor}>h_t</text>

        {/* gate boxes */}
        {GATES.map((g) => {
          const isActive = active === g.key;
          const color = g.key === 'reset' ? resetColor : updateColor;
          return (
            <g key={g.key} onClick={() => setActive(isActive ? null : g.key)} onMouseEnter={() => setActive(g.key)} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer' }}>
              <rect x={g.x - 26} y={gateY - 18} width={52} height={36} rx={6} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={g.x} y={gateY - 2} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>σ</text>
              <text x={g.x} y={gateY + 12} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={color}>{g.label}</text>
              <line x1={g.x} y1={inputY - 14} x2={g.x} y2={gateY + 20} stroke={t.textMuted} strokeWidth={1} opacity={0.6} />
            </g>
          );
        })}

        <rect x={190} y={inputY - 14} width={120} height={26} rx={5} fill={t.surfaceAlt} stroke={t.border} strokeWidth={1.25} />
        <text x={250} y={inputY + 4} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={t.textSecondary}>[h_(t-1), x_t]</text>
      </svg>

      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
        {GATES.map((g) => (
          <div key={g.key} onMouseEnter={() => setActive(g.key)} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer', fontSize: DIAGRAM_TYPE.caption.size, color: active === g.key ? (g.key === 'reset' ? resetColor : updateColor) : t.textMuted, fontWeight: active === g.key ? 700 : 400 }}>
            {g.label}: {g.desc}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <VisualizationMath latex={active ? GATES.find((g) => g.key === active)!.latex : 'h_t = (1-z_t)\\odot h_{t-1} + z_t \\odot \\tilde h_t'} />
      </div>
    </VisualizationContainer>
  );
}
