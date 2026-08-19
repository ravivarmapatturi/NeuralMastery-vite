import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const ROW_H = 34;
const PAD_L = 90;

export default function SyncVsAsyncDiagram() {
  const t = useVizTokens();
  const [processingMs, setProcessingMs] = useState(600);

  const pxPerMs = 0.35;
  const requestPx = 20;
  const syncBlockPx = processingMs * pxPerMs;
  const clientColor = getConceptColor(t, 'token');
  const workColor = getConceptColor(t, 'attention');
  const queueColor = t.accentSecondary;

  const maxWidth = Math.max(syncBlockPx + requestPx + PAD_L + 20, 420);

  return (
    <VisualizationContainer footer="Sync: the client's thread is blocked for the entire processing time -- it can't do anything else until the response comes back. Async: the client hands the request to a queue and is free immediately; a separate consumer processes it whenever it gets to it, decoupled from the client's timeline entirely.">
      <Slider label="Processing time" value={processingMs} onChange={setProcessingMs} min={100} max={2000} step={100} format={(v) => `${v}ms`} />
      <svg width="100%" viewBox={`0 0 ${maxWidth} ${ROW_H * 4 + 20}`} style={{ display: 'block', marginTop: 12 }}>
        <text x={0} y={16} fontSize={DIAGRAM_TYPE.secondaryLabel.size} fontWeight={700} fill={t.textMuted}>SYNC</text>
        <text x={0} y={16 + ROW_H} fontSize={11} fill={t.textSecondary}>client</text>
        <rect x={PAD_L} y={6} width={requestPx} height={18} fill={clientColor} rx={3} />
        <rect x={PAD_L + requestPx} y={6} width={syncBlockPx} height={18} fill={`${workColor}55`} stroke={workColor} strokeWidth={1.5} rx={3} />
        <text x={PAD_L + requestPx + syncBlockPx / 2} y={19} textAnchor="middle" fontSize={10} fill={workColor}>blocked, waiting...</text>
        <rect x={PAD_L + requestPx + syncBlockPx} y={6} width={requestPx} height={18} fill={clientColor} rx={3} />
        <text x={PAD_L + requestPx * 2 + syncBlockPx + 8} y={19} fontSize={10} fill={t.textMuted}>response, {processingMs + 40}ms total</text>

        <text x={0} y={16 + ROW_H * 2.4} fontSize={DIAGRAM_TYPE.secondaryLabel.size} fontWeight={700} fill={t.textMuted}>ASYNC</text>
        <text x={0} y={16 + ROW_H * 3.4} fontSize={11} fill={t.textSecondary}>client</text>
        <rect x={PAD_L} y={ROW_H * 2.2} width={requestPx} height={18} fill={clientColor} rx={3} />
        <rect x={PAD_L + requestPx + 6} y={ROW_H * 2.2} width={200} height={18} fill={`${clientColor}22`} stroke={clientColor} strokeWidth={1} strokeDasharray="3 3" rx={3} />
        <text x={PAD_L + requestPx + 12} y={ROW_H * 2.2 + 13} fontSize={10} fill={clientColor}>free to do other work immediately</text>

        <text x={0} y={16 + ROW_H * 4.4} fontSize={11} fill={t.textSecondary}>consumer</text>
        <rect x={PAD_L + requestPx} y={ROW_H * 3.2} width={4} height={18} fill={queueColor} />
        <rect x={PAD_L + requestPx + 20} y={ROW_H * 3.2} width={syncBlockPx} height={18} fill={`${workColor}55`} stroke={workColor} strokeWidth={1.5} rx={3} />
        <text x={PAD_L + requestPx + 20 + syncBlockPx / 2} y={ROW_H * 3.2 + 13} textAnchor="middle" fontSize={10} fill={workColor}>processed on its own time</text>
      </svg>
    </VisualizationContainer>
  );
}
