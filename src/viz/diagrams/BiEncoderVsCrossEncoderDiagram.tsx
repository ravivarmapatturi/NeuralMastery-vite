import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { ArrowMarker, CircleNode, CylinderNode, FlowArrow, OutputNode, RectNode } from './architectureShapes';

/** Node-type -> color, matching a reference bi-encoder/cross-encoder
 * architecture figure exactly: input=blue, model/encoding stage=green,
 * stored representation (cylinder)=amber, scoring computation
 * (circle)=red, final output box=purple. Reused identically across both
 * architectures below (and by ThreeWayRetrievalArchitecturesDiagram) so
 * the SAME color always means the SAME kind of node, everywhere. */
function useArchColors() {
  const t = useVizTokens();
  return {
    t,
    input: t.accentSecondary,
    model: t.accentPrimary,
    stored: t.accentWarn,
    scoring: t.accentDanger,
    output: t.accentPurple,
  };
}

/** Real BAAI/bge-large-en-v1.5 (bi-encoder) and cross-encoder/ms-marco-MiniLM-L6-v2
 * (cross-encoder) specifics, verified directly against each model's real
 * config.json on Hugging Face -- not a model-card summary, which for the
 * cross-encoder is actually misleading (its own lineage description
 * references a 12-layer MiniLM checkpoint; config.json's real
 * num_hidden_layers is 6, matching the "L6" in the deployed model's own
 * name). The diagram's whole point: the SAME shared encoder runs TWICE,
 * independently, for the bi-encoder (a twin/Siamese structure -- drawn as
 * ONE model box with two separate lanes through it, never merging) versus
 * ONE joint sequence through the model ONCE for the cross-encoder, with
 * real cross-attention across the query/passage boundary. */
export default function BiEncoderVsCrossEncoderDiagram() {
  const { t, input, model, stored, scoring, output } = useArchColors();

  const width = 560;
  const height = 235;

  return (
    <VisualizationContainer footer="Bi-encoder (BAAI/bge-large-en-v1.5): BERT-large, 24 transformer layers, hidden size 1024, 16 attention heads -- the SAME shared weights run as two independent forward passes (query, then each document), never attending to each other. Each pass pools to a single 1024-dim vector via CLS-token pooling (not mean pooling), precomputable and stored ahead of time. Cross-encoder (cross-encoder/ms-marco-MiniLM-L6-v2): 6 transformer layers, hidden size 384, 12 attention heads. Query and passage are concatenated into ONE sequence and go through the model together in a SINGLE pass, with real self-attention across the query/passage boundary -- the final [CLS] hidden state feeds a 384-to-1 classification head. Nothing here is precomputable, which is exactly why it only reranks a shortlist rather than searching a full corpus.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <ArrowMarker id="bce-arrow" color={t.textMuted} />
        </defs>

        {/* --- Bi-Encoder: ONE shared model box, two separate lanes through it --- */}
        <text x={10} y={14} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Bi-Encoder
        </text>

        <RectNode t={t} x={10} y={24} width={95} height={26} label="Query" color={input} />
        <RectNode t={t} x={10} y={90} width={95} height={26} label="Document" color={input} />
        <FlowArrow x1={105} y1={37} x2={140} y2={37} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={105} y1={103} x2={140} y2={103} color={t.textMuted} markerId="bce-arrow" />

        {/* One box, entered/exited at two distinct heights (never the
            center, where the label sits) -- the box being drawn ONCE,
            not twice, IS the shared-weights signal: both lanes run
            through the identical model. */}
        <RectNode t={t} x={140} y={18} width={110} height={104} label="bge-large-en-v1.5" sublabel="24L · shared weights" color={model} />
        <FlowArrow x1={250} y1={37} x2={262} y2={33} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={250} y1={103} x2={262} y2={105} color={t.textMuted} markerId="bce-arrow" />

        <text x={289} y={6} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          1024-dim, CLS-pooled
        </text>
        <CylinderNode x={262} y={12} width={55} height={42} label="[CLS] vec" color={stored} />
        <CylinderNode x={262} y={84} width={55} height={42} label="[CLS] vec" color={stored} />

        <FlowArrow x1={317} y1={33} x2={340} y2={55} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={317} y1={105} x2={340} y2={83} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={340} y={49} width={40} label="cos()" color={scoring} />
        <text x={360} y={100} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          Cosine Similarity
        </text>
        <FlowArrow x1={380} y1={69} x2={400} y2={69} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={400} y={52} width={130} height={34} label="Similarity Score" color={output} />

        {/* --- Cross-Encoder: ONE joint sequence, ONE pass, no fan-out at all --- */}
        <text x={10} y={164} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Cross-Encoder
        </text>

        <RectNode t={t} x={10} y={186} width={110} height={34} label="Query + Passage" sublabel="one sequence" color={input} />
        <FlowArrow x1={120} y1={203} x2={150} y2={203} color={t.textMuted} markerId="bce-arrow" />

        <RectNode t={t} x={150} y={180} width={120} height={46} label="MiniLM-L6" sublabel="6L · full joint attention" color={model} />
        <FlowArrow x1={270} y1={203} x2={290} y2={203} color={t.textMuted} markerId="bce-arrow" />

        <CylinderNode x={290} y={182} width={55} height={42} label="[CLS]" color={stored} />
        <text x={317} y={175} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          384-dim
        </text>
        <FlowArrow x1={345} y1={203} x2={365} y2={203} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={365} y={183} width={40} label="Linear" color={scoring} />
        <text x={385} y={234} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          384 → 1
        </text>
        <FlowArrow x1={405} y1={203} x2={425} y2={203} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={425} y={186} width={130} height={34} label="Relevance Score" color={output} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Same box drawn once, entered twice, never merging (bi-encoder) vs. one merged sequence through the model once (cross-encoder) — the structural difference, not just different numbers.
      </div>
    </VisualizationContainer>
  );
}
