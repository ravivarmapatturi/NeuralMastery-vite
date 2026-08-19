import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';

type Tool = 'kafka' | 'celery' | 'redis' | 'sqs';

const TOOLS: Record<Tool, { name: string; model: string; ordering: string; defaultSemantics: string; retention: string; useCase: string }> = {
  kafka: {
    name: 'Kafka',
    model: 'Distributed, partitioned log',
    ordering: 'Guaranteed within a partition',
    defaultSemantics: 'At-least-once (exactly-once available with transactions)',
    retention: 'Configurable time/size window -- consumers can replay history',
    useCase: 'High-throughput event streaming, multiple independent consumer groups reading the same stream (analytics + fraud check + audit log, all from one topic)',
  },
  celery: {
    name: 'Celery',
    model: 'Task queue (usually backed by Redis or RabbitMQ)',
    ordering: 'Not guaranteed across workers',
    defaultSemantics: 'At-least-once, if configured with acks-late',
    retention: 'Messages removed once acked -- no replay',
    useCase: 'Distributing background jobs (send an email, retrain a model, process an upload) across a pool of Python workers',
  },
  redis: {
    name: 'Redis (Streams / Pub-Sub)',
    model: 'In-memory log (Streams) or fire-and-forget broadcast (Pub-Sub)',
    ordering: 'Guaranteed in Streams; N/A in Pub-Sub',
    defaultSemantics: 'At-least-once in Streams; at-most-once in Pub-Sub (no persistence)',
    retention: 'In-memory -- durability depends on Redis persistence config',
    useCase: 'Low-latency caching/feature lookups that also need a lightweight queue nearby -- not the first choice for durability-critical workloads',
  },
  sqs: {
    name: 'Amazon SQS',
    model: 'Managed point-to-point queue',
    ordering: 'FIFO queues only; standard queues are best-effort',
    defaultSemantics: 'At-least-once (exactly-once with FIFO queues)',
    retention: 'Messages removed once acked (up to a configurable max, default 4 days)',
    useCase: 'Fully managed decoupling between AWS services with zero infrastructure to run yourself',
  },
};

export default function QueueToolComparisonDiagram() {
  const t = useVizTokens();
  const [tool, setTool] = useState<Tool>('kafka');
  const info = TOOLS[tool];

  const rows: [string, string][] = [
    ['Model', info.model],
    ['Ordering', info.ordering],
    ['Default semantics', info.defaultSemantics],
    ['Retention', info.retention],
    ['Typical use case', info.useCase],
  ];

  return (
    <VisualizationContainer footer="These are defaults, not hard limits -- Kafka can approximate a task queue, SQS FIFO queues get you ordering, and any of these can be pushed outside its sweet spot. The comparison is about what each is optimized for, not what it's theoretically capable of.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(TOOLS) as Tool[]).map((k) => (
          <VizButton key={k} variant={tool === k ? 'primary' : 'secondary'} onClick={() => setTool(k)}>
            {TOOLS[k].name}
          </VizButton>
        ))}
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textMuted, fontWeight: 600, verticalAlign: 'top', width: 150 }}>{label}</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </VisualizationContainer>
  );
}
