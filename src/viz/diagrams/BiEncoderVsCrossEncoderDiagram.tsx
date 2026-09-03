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

/** A small labeled internal-stage box, used inside the model containers
 * below to show real architecture (embeddings, attention+FFN, pooling)
 * instead of one opaque label. Text sized down from RectNode's defaults
 * since these boxes are small. */
function InnerStage({
  x,
  y,
  width,
  height,
  lines,
  color,
  textColor,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  lines: string[];
  color: string;
  textColor: string;
}) {
  const lineHeight = 8.5;
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2 + 3;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} fill={`${color}22`} stroke={color} strokeWidth={1} />
      {lines.map((line, i) => (
        <text key={i} x={x + width / 2} y={startY + i * lineHeight} textAnchor="middle" fontSize={6.5} fontWeight={600} fill={textColor}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** Real BAAI/bge-large-en-v1.5 (bi-encoder) and cross-encoder/ms-marco-MiniLM-L6-v2
 * (cross-encoder) specifics, verified directly against each model's real
 * config.json on Hugging Face -- not a model-card summary, which for the
 * cross-encoder is actually misleading (its own lineage description
 * references a 12-layer MiniLM checkpoint; config.json's real
 * num_hidden_layers is 6, matching the "L6" in the deployed model's own
 * name). Each model container shows its REAL internal architecture --
 * token+position embeddings, the repeated self-attention+FFN block (drawn
 * once with a "x N" repeat badge, not drawn N times), and the pooling/
 * output step -- not a single opaque label. The diagram's other point
 * still holds: the SAME shared encoder runs TWICE, independently, for the
 * bi-encoder (both lanes converge into and diverge out of the identical
 * internal pipeline) versus ONE joint sequence through the model ONCE for
 * the cross-encoder, with real cross-attention across the query/passage
 * boundary. */
export default function BiEncoderVsCrossEncoderDiagram() {
  const { t, input, model, stored, scoring, output } = useArchColors();

  const width = 640;
  const height = 335;

  return (
    <VisualizationContainer footer="Bi-encoder (BAAI/bge-large-en-v1.5): BERT-large, 24 transformer layers, hidden size 1024, 16 attention heads, FFN size 4096. The SAME shared weights run as two independent forward passes (query, then each document), never attending to each other -- both converge into and diverge out of the identical internal pipeline shown once. Each pass pools to a single 1024-dim vector via CLS-token pooling (not mean pooling), precomputable and stored ahead of time. Cross-encoder (cross-encoder/ms-marco-MiniLM-L6-v2): 6 transformer layers, hidden size 384, 12 attention heads, FFN size 1536. Query and passage are concatenated into ONE sequence and go through the model together in a SINGLE pass, with real self-attention across the query/passage boundary -- the final [CLS] hidden state feeds a 384-to-1 classification head. Nothing here is precomputable, which is exactly why it only reranks a shortlist rather than searching a full corpus.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <ArrowMarker id="bce-arrow" color={t.textMuted} />
        </defs>

        {/* ============= Bi-Encoder ============= */}
        <text x={10} y={14} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Bi-Encoder
        </text>

        <RectNode t={t} x={10} y={30} width={85} height={24} label="Query" color={input} />
        <RectNode t={t} x={10} y={128} width={85} height={24} label="Document" color={input} />

        {/* Both lanes converge into the SAME single internal pipeline --
            drawn once, not twice -- then diverge back out. That
            convergence/divergence at one shared entry/exit point IS the
            shared-weights signal. */}
        <FlowArrow x1={95} y1={42} x2={125} y2={82} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={95} y1={140} x2={125} y2={100} color={t.textMuted} markerId="bce-arrow" />

        <rect x={125} y={22} width={232} height={138} rx={8} fill="none" stroke={model} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={241} y={35} textAnchor="middle" fontSize={9} fontWeight={700} fill={model}>
          bge-large-en-v1.5 (BERT-large)
        </text>

        <InnerStage x={133} y={80} width={62} height={26} lines={['Token + Position', 'Embeddings']} color={model} textColor={model} />
        <FlowArrow x1={195} y1={93} x2={201} y2={93} color={t.textMuted} markerId="bce-arrow" />

        <InnerStage
          x={201}
          y={70}
          width={100}
          height={46}
          lines={['Self-Attention (16 heads)', 'Feed-Forward (→ 4096 →)']}
          color={model}
          textColor={model}
        />
        <text x={251} y={64} textAnchor="middle" fontSize={9} fontWeight={800} fill={model}>
          × 24
        </text>
        <FlowArrow x1={301} y1={93} x2={307} y2={93} color={t.textMuted} markerId="bce-arrow" />

        <InnerStage x={307} y={80} width={44} height={26} lines={['[CLS]', 'pool']} color={model} textColor={model} />

        <text x={241} y={152} textAnchor="middle" fontSize={7} fill={t.textMuted}>
          same weights both passes, never cross-attending to each other
        </text>

        <FlowArrow x1={357} y1={85} x2={375} y2={45} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={357} y1={101} x2={375} y2={143} color={t.textMuted} markerId="bce-arrow" />

        <text x={402} y={10} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          1024-dim, CLS-pooled
        </text>
        <CylinderNode x={375} y={22} width={55} height={42} label="[CLS] vec" color={stored} />
        <CylinderNode x={375} y={118} width={55} height={42} label="[CLS] vec" color={stored} />

        <FlowArrow x1={430} y1={43} x2={455} y2={71} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={430} y1={139} x2={455} y2={97} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={455} y={65} width={40} label="cos()" color={scoring} />
        <text x={475} y={122} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          Cosine Similarity
        </text>
        <FlowArrow x1={495} y1={85} x2={515} y2={85} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={515} y={68} width={115} height={34} label="Similarity Score" color={output} />

        {/* ============= Cross-Encoder ============= */}
        <text x={10} y={195} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Cross-Encoder
        </text>

        <RectNode t={t} x={10} y={214} width={110} height={34} label="Query + Passage" sublabel="one sequence" color={input} />
        <FlowArrow x1={120} y1={231} x2={150} y2={231} color={t.textMuted} markerId="bce-arrow" />

        {/* Container is deliberately tall enough that title, the "x 6"
            repeat badge, and the stage row each get their own clear band
            -- no two ever share a y-range, unlike the cramped first pass
            that overlapped "MiniLM-L6" and "x 6". */}
        <rect x={150} y={204} width={230} height={76} rx={8} fill="none" stroke={model} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={265} y={217} textAnchor="middle" fontSize={9} fontWeight={700} fill={model}>
          MiniLM-L6
        </text>
        <text x={265} y={231} textAnchor="middle" fontSize={9} fontWeight={800} fill={model}>
          × 6
        </text>

        <InnerStage x={158} y={246} width={54} height={18} lines={['Token + Pos', 'Embeddings']} color={model} textColor={model} />
        <FlowArrow x1={212} y1={255} x2={218} y2={255} color={t.textMuted} markerId="bce-arrow" />

        <InnerStage
          x={218}
          y={238}
          width={100}
          height={34}
          lines={['Joint Self-Attn (12 heads)', 'FFN (→ 1536 →)']}
          color={model}
          textColor={model}
        />
        <FlowArrow x1={318} y1={255} x2={324} y2={255} color={t.textMuted} markerId="bce-arrow" />

        <InnerStage x={324} y={246} width={48} height={18} lines={['[CLS]']} color={model} textColor={model} />

        <text x={265} y={293} textAnchor="middle" fontSize={7} fill={t.textMuted}>
          every token attends to every other token, across the query/passage boundary
        </text>

        <FlowArrow x1={380} y1={255} x2={400} y2={255} color={t.textMuted} markerId="bce-arrow" />

        <text x={427} y={228} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          384-dim
        </text>
        <CylinderNode x={400} y={234} width={55} height={42} label="[CLS] vec" color={stored} />

        <FlowArrow x1={455} y1={255} x2={478} y2={255} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={478} y={235} width={40} label="Linear" color={scoring} />
        <text x={498} y={290} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          384 → 1
        </text>
        <FlowArrow x1={518} y1={255} x2={538} y2={255} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={538} y={238} width={92} height={34} label="Relevance Score" color={output} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Real internal architecture, not just labels: embeddings → attention + feed-forward (repeated N times, same shared weights) → pooling. One pipeline drawn once and run twice, converging/diverging (bi-encoder) vs. one joint sequence through it once (cross-encoder).
      </div>
    </VisualizationContainer>
  );
}
