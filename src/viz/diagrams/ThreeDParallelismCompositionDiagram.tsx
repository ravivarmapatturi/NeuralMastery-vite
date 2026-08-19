import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Dim = 'tensor' | 'pipeline' | 'data';

/** Nested boxes -- tensor parallelism inside a node (fastest interconnect,
 * most latency-sensitive), pipeline parallelism across nodes, data
 * parallelism replicated across the whole pipeline+tensor group. Click a
 * dimension to see why it sits at that level. */
export default function ThreeDParallelismCompositionDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<Dim>('tensor');
  const tensorColor = getConceptColor(t, 'query');
  const pipelineColor = getConceptColor(t, 'attention');
  const dataColor = t.accentWarn;

  const desc: Record<Dim, string> = {
    tensor: 'Tensor parallelism: WITHIN a node, where GPU-to-GPU interconnect is fastest -- its per-layer communication is the most latency-sensitive of the three.',
    pipeline: 'Pipeline parallelism: ACROSS nodes -- coarser-grained, more tolerant of slower inter-node links than tensor parallelism\'s tight per-layer chatter.',
    data: 'Data parallelism: replicated across the resulting pipeline+tensor-parallel GROUPS -- uses however many GPUs remain for throughput scaling.',
  };

  return (
    <VisualizationContainer footer={desc[active]}>
      <div onClick={() => setActive('data')} onMouseEnter={() => setActive('data')} style={{ cursor: 'pointer', padding: 14, borderRadius: 12, background: active === 'data' ? `${dataColor}12` : 'transparent', border: `2px solid ${active === 'data' ? dataColor : t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: active === 'data' ? dataColor : t.textMuted, marginBottom: 8 }}>DATA PARALLEL (replicated groups)</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1].map((g) => (
            <div key={g} onClick={(e) => { e.stopPropagation(); setActive('pipeline'); }} onMouseEnter={(e) => { e.stopPropagation(); setActive('pipeline'); }} style={{ cursor: 'pointer', flex: 1, padding: 10, borderRadius: 10, background: active === 'pipeline' ? `${pipelineColor}14` : t.surfaceAlt, border: `2px solid ${active === 'pipeline' ? pipelineColor : t.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: active === 'pipeline' ? pipelineColor : t.textMuted, marginBottom: 6 }}>PIPELINE (across nodes)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1].map((node) => (
                  <div key={node} onClick={(e) => { e.stopPropagation(); setActive('tensor'); }} onMouseEnter={(e) => { e.stopPropagation(); setActive('tensor'); }} style={{ cursor: 'pointer', flex: 1, padding: 8, borderRadius: 8, background: active === 'tensor' ? `${tensorColor}20` : t.surface, border: `2px solid ${active === 'tensor' ? tensorColor : t.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: active === 'tensor' ? tensorColor : t.textMuted, marginBottom: 4 }}>TENSOR (within node)</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[0, 1, 2, 3].map((gpu) => (
                        <div key={gpu} style={{ flex: 1, height: 16, borderRadius: 3, background: active === 'tensor' ? tensorColor : t.border, opacity: 0.7 }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Click any level -- fastest-communication dimension goes innermost (tensor), slowest-tolerant goes outermost (data).
      </div>
    </VisualizationContainer>
  );
}
