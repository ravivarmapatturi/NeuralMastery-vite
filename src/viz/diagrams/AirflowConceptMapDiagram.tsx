import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const CONCEPTS = [
  { key: 'dag', label: 'DAG', desc: 'A Python file defining the pipeline structure -- the graph itself.' },
  { key: 'task', label: 'Task', desc: 'One node in the DAG -- a single unit of work.' },
  { key: 'operator', label: 'Operator', desc: 'The TYPE of work a task does -- PythonOperator, BashOperator, KubernetesPodOperator.' },
  { key: 'scheduler', label: 'Scheduler', desc: 'The process that decides WHEN each DAG run should trigger.' },
  { key: 'executor', label: 'Executor', desc: 'The process that actually RUNS tasks -- locally, Celery workers, or Kubernetes pods.' },
  { key: 'sensor', label: 'Sensor', desc: 'A special task that WAITS for a condition (a file landing, a partition appearing) before letting downstream tasks proceed.' },
  { key: 'xcom', label: 'XCom', desc: 'Airflow\'s mechanism for passing small pieces of data BETWEEN tasks in the same DAG run.' },
];

/** Airflow's own vocabulary, mapped onto the generic orchestration
 * concepts above it -- click a term for what it actually names. */
export default function AirflowConceptMapDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('sensor');
  const color = getConceptColor(t, 'attention');
  const info = CONCEPTS.find((c) => c.key === active)!;

  return (
    <VisualizationContainer footer={info.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {CONCEPTS.map((c) => {
          const isActive = active === c.key;
          return (
            <div key={c.key} onClick={() => setActive(c.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(c.key); } }} onMouseEnter={() => setActive(c.key)} style={{ cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: isActive ? 700 : 500, background: isActive ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${isActive ? color : t.border}`, color: isActive ? color : t.textSecondary, fontFamily: 'monospace' }}>
              {c.label}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Old enough (originally built at Airbnb) that this vocabulary is the de facto lingua franca across the whole field.
      </div>
    </VisualizationContainer>
  );
}
