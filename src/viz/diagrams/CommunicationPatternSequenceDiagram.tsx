import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Pattern = 'short-poll' | 'long-poll' | 'webhook' | 'sse' | 'websocket';

const SEQUENCES: Record<Pattern, { from: 'C' | 'S'; label: string }[]> = {
  'short-poll': [
    { from: 'C', label: 'GET /status' }, { from: 'S', label: '200: not ready' },
    { from: 'C', label: 'GET /status (again, on a timer)' }, { from: 'S', label: '200: not ready' },
    { from: 'C', label: 'GET /status (again)' }, { from: 'S', label: '200: ready! result attached' },
  ],
  'long-poll': [
    { from: 'C', label: 'GET /status' },
    { from: 'S', label: '(connection held open, no response yet...)' },
    { from: 'S', label: '200: ready! result attached (after 8s wait)' },
    { from: 'C', label: 'GET /status (reopens immediately)' },
  ],
  webhook: [
    { from: 'C', label: 'POST /register-webhook { url: "https://me.app/hook" }' },
    { from: 'S', label: '200: registered' },
    { from: 'S', label: 'POST https://me.app/hook { event: "done", result: ... }' },
    { from: 'C', label: '200: received' },
  ],
  sse: [
    { from: 'C', label: 'GET /stream (Accept: text/event-stream)' },
    { from: 'S', label: 'event: token  data: "The"' },
    { from: 'S', label: 'event: token  data: " quick"' },
    { from: 'S', label: 'event: token  data: " fox"' },
    { from: 'S', label: 'event: done' },
  ],
  websocket: [
    { from: 'C', label: 'Upgrade: websocket' },
    { from: 'S', label: '101 Switching Protocols' },
    { from: 'C', label: 'send: "start recording"' },
    { from: 'S', label: 'send: audio chunk' },
    { from: 'C', label: 'send: audio chunk (client can push too)' },
  ],
};

const LABELS: Record<Pattern, string> = { 'short-poll': 'Short polling', 'long-poll': 'Long polling', webhook: 'Webhook', sse: 'SSE', websocket: 'WebSocket' };
const NOTES: Record<Pattern, string> = {
  'short-poll': 'Client repeatedly asks on a timer. Simple, but wasteful -- most requests get "not yet" -- and adds up to one poll-interval of latency.',
  'long-poll': 'Client asks once; the server HOLDS the request open until there\'s something to report. Less wasteful than short polling, still fundamentally a pull.',
  webhook: 'Inverts control flow entirely -- the SERVER calls the client. No polling at all, but the client must be reachable and handle retries/verification itself.',
  sse: 'One persistent connection, server streams events to the client, ONE direction only. This is exactly what LLM token streaming is.',
  websocket: 'Persistent, full-duplex -- both sides push at any time. The right choice when the client also needs to talk back mid-stream (e.g. realtime audio).',
};

/** Five patterns, one visual language (a message-sequence timeline) --
 * select a pattern and see exactly what's actually being sent, in what
 * direction, instead of just reading a description. */
export default function CommunicationPatternSequenceDiagram() {
  const t = useVizTokens();
  const [pattern, setPattern] = useState<Pattern>('sse');
  const cColor = getConceptColor(t, 'query');
  const sColor = getConceptColor(t, 'attention');
  const messages = SEQUENCES[pattern];

  const width = 560;
  const rowH = 28;
  const height = 30 + messages.length * rowH + 10;
  const cx = 70;
  const sx = width - 70;

  return (
    <VisualizationContainer footer={NOTES[pattern]}>
      <PillSelect<Pattern>
        label="Pattern"
        value={pattern}
        onChange={setPattern}
        options={(Object.keys(LABELS) as Pattern[]).map((k) => ({ value: k, label: LABELS[k] }))}
      />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <defs>
          <marker id="cps-arrow-c" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={cColor} /></marker>
          <marker id="cps-arrow-s" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={sColor} /></marker>
        </defs>
        <text x={cx} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill={cColor}>Client</text>
        <text x={sx} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill={sColor}>Server</text>
        <line x1={cx} y1={24} x2={cx} y2={height - 6} stroke={t.border} strokeWidth={1} />
        <line x1={sx} y1={24} x2={sx} y2={height - 6} stroke={t.border} strokeWidth={1} />
        {messages.map((m, i) => {
          const y = 30 + i * rowH + 14;
          const fromX = m.from === 'C' ? cx : sx;
          const toX = m.from === 'C' ? sx : cx;
          const color = m.from === 'C' ? cColor : sColor;
          const isNote = m.label.startsWith('(');
          return (
            <g key={i}>
              {!isNote && <line x1={fromX} y1={y} x2={toX} y2={y} stroke={color} strokeWidth={1.5} markerEnd={`url(#cps-arrow-${m.from === 'C' ? 'c' : 's'})`} />}
              {isNote && <line x1={fromX} y1={y} x2={toX} y2={y} stroke={t.textMuted} strokeWidth={1} strokeDasharray="2 3" />}
              <rect x={Math.min(fromX, toX) + 8} y={y - 11} width={Math.abs(toX - fromX) - 16} height={15} fill={t.surface} />
              <text x={(fromX + toX) / 2} y={y - 1} textAnchor="middle" fontSize={7.8} fill={isNote ? t.textMuted : color} fontStyle={isNote ? 'italic' : 'normal'}>{m.label}</text>
            </g>
          );
        })}
      </svg>
    </VisualizationContainer>
  );
}
