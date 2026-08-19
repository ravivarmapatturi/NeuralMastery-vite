import { useEffect, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton, usePrefersReducedMotion } from '../primitives';
import { DIAGRAM_TYPE, DIAGRAM_OPACITY, getConceptColor } from './diagramSystem';

const TOKENS = ['x1', 'x2', 'x3', 'x4'];
const NODE_R = 20;
const STEP_MS = 550;

export default function RnnVsAttentionComparison() {
  const t = useVizTokens();
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(TOKENS.length); // fully revealed by default
  const [playing, setPlaying] = useState(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    if (step >= TOKENS.length) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [playing, step, reducedMotion]);

  const play = () => {
    setStep(0);
    setPlaying(true);
  };
  const reset = () => {
    setPlaying(false);
    setStep(TOKENS.length);
  };

  const panelW = 320;
  const panelH = 130;
  const nodeY = panelH / 2 + 10;
  const nodeX = (i: number) => 30 + i * ((panelW - 60) / (TOKENS.length - 1));

  const tokenColor = getConceptColor(t, 'token');
  const attnColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="RNNs process left-to-right: step t can't start until step t-1 finishes. Attention gives every position direct, parallel access to every other position -- no waiting.">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, gap: 8 }}>
        <VizButton onClick={play} disabled={playing}>
          {playing ? 'Playing…' : 'Play'}
        </VizButton>
        <VizButton variant="secondary" onClick={reset}>
          Reset
        </VizButton>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* RNN panel */}
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.label.size, fontWeight: DIAGRAM_TYPE.label.weight, color: t.accentDanger, marginBottom: 6, letterSpacing: '0.04em' }}>
            RNN — STRICTLY SEQUENTIAL
          </div>
          <svg width="100%" viewBox={`0 0 ${panelW} ${panelH}`} style={{ display: 'block' }}>
            {TOKENS.slice(0, -1).map((_, i) => {
              const active = i < step;
              return (
                <g key={`rnn-edge-${i}`}>
                  <line
                    x1={nodeX(i) + NODE_R}
                    y1={nodeY}
                    x2={nodeX(i + 1) - NODE_R}
                    y2={nodeY}
                    stroke={active ? t.accentDanger : t.border}
                    strokeWidth={2}
                    opacity={active ? DIAGRAM_OPACITY.active : DIAGRAM_OPACITY.inactive}
                    markerEnd="url(#rnn-arrow)"
                  />
                  {active && (
                    <text x={(nodeX(i) + nodeX(i + 1)) / 2} y={nodeY - 12} textAnchor="middle" fontSize={10} fill={t.textMuted}>
                      waits
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker id="rnn-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill={t.accentDanger} />
              </marker>
            </defs>
            {TOKENS.map((tok, i) => {
              const active = i < step;
              return (
                <g key={`rnn-node-${i}`}>
                  <circle
                    cx={nodeX(i)}
                    cy={nodeY}
                    r={NODE_R}
                    fill={active ? t.accentDanger : t.surfaceAlt}
                    fillOpacity={active ? 0.18 : 1}
                    stroke={active ? t.accentDanger : t.border}
                    strokeWidth={2}
                  />
                  <text x={nodeX(i)} y={nodeY + 5} textAnchor="middle" fontSize={13} fontWeight={600} fontFamily="monospace" fill={active ? t.accentDanger : tokenColor}>
                    {tok}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Attention panel */}
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.label.size, fontWeight: DIAGRAM_TYPE.label.weight, color: attnColor, marginBottom: 6, letterSpacing: '0.04em' }}>
            ATTENTION — DIRECT ACCESS TO ALL
          </div>
          <svg width="100%" viewBox={`0 0 ${panelW} ${panelH}`} style={{ display: 'block' }}>
            {TOKENS.map((_, i) =>
              TOKENS.map((_, j) => {
                if (j <= i) return null; // one arc per unordered pair, not two overlapping ones
                const revealed = step >= TOKENS.length; // reveals all-at-once, unlike RNN's staged reveal
                const involved = selectedToken !== null && (i === selectedToken || j === selectedToken);
                const dimmed = selectedToken !== null && !involved;
                // Arcs above the row -- height grows with token distance, so
                // adjacent and far-apart connections are visually distinct
                // instead of collapsing onto the same straight line (every
                // node sits on one horizontal axis here).
                const dist = j - i;
                const arcHeight = 14 + dist * 16;
                const midX = (nodeX(i) + nodeX(j)) / 2;
                const controlY = nodeY - arcHeight;
                return (
                  <path
                    key={`attn-edge-${i}-${j}`}
                    d={`M ${nodeX(i)},${nodeY - NODE_R} Q ${midX},${controlY} ${nodeX(j)},${nodeY - NODE_R}`}
                    fill="none"
                    stroke={attnColor}
                    strokeWidth={involved ? 2.5 : 1.5}
                    opacity={!revealed ? DIAGRAM_OPACITY.ghost : dimmed ? DIAGRAM_OPACITY.masked : involved ? DIAGRAM_OPACITY.active : DIAGRAM_OPACITY.inactive}
                  />
                );
              }),
            )}
            {TOKENS.map((tok, i) => {
              const isSelected = selectedToken === i;
              return (
                <g key={`attn-node-${i}`} onClick={() => setSelectedToken(isSelected ? null : i)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={nodeX(i)}
                    cy={nodeY}
                    r={NODE_R}
                    fill={attnColor}
                    fillOpacity={isSelected ? 0.35 : 0.18}
                    stroke={attnColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text x={nodeX(i)} y={nodeY + 5} textAnchor="middle" fontSize={13} fontWeight={600} fontFamily="monospace" fill={attnColor}>
                    {tok}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ textAlign: 'center', fontSize: 11, color: t.textMuted, marginTop: 4 }}>Click a token to highlight its connections</div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
