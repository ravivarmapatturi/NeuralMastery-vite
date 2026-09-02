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

// Shared column x-positions -- both architecture rows place the same
// KIND of node (input / model stage / stored representation / scoring /
// output) at the same x, so the two flows visually line up stage-by-stage
// even though they're stacked in separate rows, not side by side.
const COL = { input: 10, model: 135, stored: 250, score: 315, output: 375 };
const W = { input: 110, model: 100, stored: 50, score: 44, output: 120 };

/** One clean, fully-visible linear flow per architecture, stacked top to
 * bottom (matching the reference figure's own orientation) with generous
 * spacing rather than hidden behind clicks or steps. A consistent
 * shape-per-node-type grammar (rectangle = input/model stage, cylinder =
 * stored representation, circle = scoring step, bordered box = final
 * output) lets a reader pattern-match what kind of thing each node is at
 * a glance, the same way in both flows. */
export default function BiEncoderVsCrossEncoderDiagram() {
  const { t, input, model, stored, scoring, output } = useArchColors();

  const width = 520;
  const height = 250;

  return (
    <VisualizationContainer footer="Bi-encoder: query and document are each encoded SEPARATELY, so their embeddings (amber) are precomputable and stored -- comparison at query time is just a dot product. Cross-encoder: query and document go through the model TOGETHER as one input -- nothing before the classifier is precomputable, but the model can compare them directly.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <ArrowMarker id="bce-arrow" color={t.textMuted} />
        </defs>

        {/* --- Bi-Encoder --- */}
        <text x={COL.input} y={14} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Bi-Encoder
        </text>

        <RectNode t={t} x={COL.input} y={26} width={W.input} height={26} label="Query" color={input} />
        <RectNode t={t} x={COL.input} y={68} width={W.input} height={26} label="Document" color={input} />
        <FlowArrow x1={COL.input + W.input} y1={39} x2={COL.model} y2={39} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={COL.input + W.input} y1={81} x2={COL.model} y2={81} color={t.textMuted} markerId="bce-arrow" />

        <RectNode t={t} x={COL.model} y={26} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <RectNode t={t} x={COL.model} y={68} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <FlowArrow x1={COL.model + W.model} y1={39} x2={COL.stored} y2={39} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={COL.model + W.model} y1={81} x2={COL.stored} y2={81} color={t.textMuted} markerId="bce-arrow" />

        <CylinderNode x={COL.stored} y={20} width={W.stored} height={38} label="Embed. A" color={stored} />
        <CylinderNode x={COL.stored} y={62} width={W.stored} height={38} label="Embed. B" color={stored} />
        <FlowArrow x1={COL.stored + W.stored} y1={39} x2={COL.score} y2={52} color={t.textMuted} markerId="bce-arrow" />
        <FlowArrow x1={COL.stored + W.stored} y1={81} x2={COL.score} y2={68} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={COL.score} y={38} width={W.score} label="dot()" color={scoring} />
        <text x={COL.score + W.score / 2} y={28} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          Similarity Score
        </text>
        <text x={COL.score + W.score / 2} y={96} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          (Dot Product)
        </text>
        <FlowArrow x1={COL.score + W.score} y1={60} x2={COL.output} y2={60} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={COL.output} y={43} width={W.output} height={34} label="Similarity Score" color={output} />

        {/* --- Cross-Encoder --- */}
        <text x={COL.input} y={148} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Cross-Encoder
        </text>

        <RectNode t={t} x={COL.input} y={172} width={W.input} height={30} label="Query + Doc" color={input} />
        <FlowArrow x1={COL.input + W.input} y1={187} x2={COL.model} y2={187} color={t.textMuted} markerId="bce-arrow" />

        <RectNode t={t} x={COL.model} y={172} width={W.model} height={30} label="Reranker" sublabel="model" color={model} />
        <FlowArrow x1={COL.model + W.model} y1={187} x2={COL.stored} y2={187} color={t.textMuted} markerId="bce-arrow" />

        <CylinderNode x={COL.stored} y={165} width={W.stored} height={44} label="Tokens" color={stored} />
        <text x={COL.stored + W.stored / 2} y={158} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          Token Output
        </text>
        <FlowArrow x1={COL.stored + W.stored} y1={187} x2={COL.score} y2={187} color={t.textMuted} markerId="bce-arrow" />

        <CircleNode t={t} x={COL.score} y={165} width={W.score} label="cls()" color={scoring} />
        <text x={COL.score + W.score / 2} y={226} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>
          Classifier
        </text>
        <FlowArrow x1={COL.score + W.score} y1={187} x2={COL.output} y2={187} color={t.textMuted} markerId="bce-arrow" />

        <OutputNode x={COL.output} y={170} width={W.output} height={34} label="Relevance Score" color={output} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Same shape, same meaning, in both flows: rectangle = input or model stage, cylinder = a stored representation, circle = a scoring step, bordered box = the final score.
      </div>
    </VisualizationContainer>
  );
}
