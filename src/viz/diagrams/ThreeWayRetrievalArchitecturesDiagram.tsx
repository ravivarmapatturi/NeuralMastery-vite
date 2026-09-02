import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { ArrowMarker, CircleNode, CylinderNode, FlowArrow, OutputNode, RectNode } from './architectureShapes';

/** Same node-type -> color mapping as BiEncoderVsCrossEncoderDiagram
 * (modeled on a reference architecture figure): input=blue, model/
 * encoding stage=green, stored representation=amber, scoring
 * computation=red, final output=purple. Identical across all three rows
 * here, and identical to the two-architecture diagram elsewhere on this
 * site -- the whole point is that a shape+color always means the same
 * kind of node, everywhere a reader encounters it. */
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

// Shared column x-positions, identical to BiEncoderVsCrossEncoderDiagram --
// the same KIND of node sits at the same x in every row, so all three
// architectures visually line up stage-by-stage despite being stacked.
const COL = { input: 10, model: 135, stored: 250, score: 315, output: 375 };
const W = { input: 110, model: 100, stored: 50, score: 44, output: 120 };
const ROW_H = 130;

/** All three retrieval/reranking architectures, one clean linear flow
 * each, stacked top to bottom with generous spacing and fully visible at
 * once -- late interaction drawn with the SAME shape grammar as
 * bi-encoder (independent encode -> stored representation -> scoring),
 * which is structurally accurate: it's bi-encoder's precomputability with
 * a different, per-token scoring step. */
export default function ThreeWayRetrievalArchitecturesDiagram() {
  const { t, input, model, stored, scoring, output } = useArchColors();

  const width = 520;
  const height = 3 * ROW_H + 20;

  return (
    <VisualizationContainer footer="Bi-encoder and late interaction both encode query and document INDEPENDENTLY (precomputable, indexable) -- they differ only in what gets stored and how it's scored: one pooled vector + a dot product, vs. one vector per token + MaxSim. Cross-encoder encodes them TOGETHER -- most accurate, but nothing here is precomputable.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <ArrowMarker id="3way-arrow" color={t.textMuted} />
        </defs>

        {/* --- Row 1: Bi-Encoder --- */}
        <text x={COL.input} y={14} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Bi-Encoder
        </text>
        <RectNode t={t} x={COL.input} y={26} width={W.input} height={26} label="Query" color={input} />
        <RectNode t={t} x={COL.input} y={68} width={W.input} height={26} label="Document" color={input} />
        <FlowArrow x1={COL.input + W.input} y1={39} x2={COL.model} y2={39} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.input + W.input} y1={81} x2={COL.model} y2={81} color={t.textMuted} markerId="3way-arrow" />
        <RectNode t={t} x={COL.model} y={26} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <RectNode t={t} x={COL.model} y={68} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <FlowArrow x1={COL.model + W.model} y1={39} x2={COL.stored} y2={39} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.model + W.model} y1={81} x2={COL.stored} y2={81} color={t.textMuted} markerId="3way-arrow" />
        <CylinderNode x={COL.stored} y={20} width={W.stored} height={38} label="Embed. A" color={stored} />
        <CylinderNode x={COL.stored} y={62} width={W.stored} height={38} label="Embed. B" color={stored} />
        <FlowArrow x1={COL.stored + W.stored} y1={39} x2={COL.score} y2={52} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.stored + W.stored} y1={81} x2={COL.score} y2={68} color={t.textMuted} markerId="3way-arrow" />
        <CircleNode t={t} x={COL.score} y={38} width={W.score} label="dot()" color={scoring} />
        <FlowArrow x1={COL.score + W.score} y1={60} x2={COL.output} y2={60} color={t.textMuted} markerId="3way-arrow" />
        <OutputNode x={COL.output} y={43} width={W.output} height={34} label="Similarity Score" color={output} />

        {/* --- Row 2: Late Interaction --- */}
        <text x={COL.input} y={14 + ROW_H} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Late Interaction
        </text>
        <RectNode t={t} x={COL.input} y={26 + ROW_H} width={W.input} height={26} label="Query Tokens" color={input} />
        <RectNode t={t} x={COL.input} y={68 + ROW_H} width={W.input} height={26} label="Doc Tokens" color={input} />
        <FlowArrow x1={COL.input + W.input} y1={39 + ROW_H} x2={COL.model} y2={39 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.input + W.input} y1={81 + ROW_H} x2={COL.model} y2={81 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <RectNode t={t} x={COL.model} y={26 + ROW_H} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <RectNode t={t} x={COL.model} y={68 + ROW_H} width={W.model} height={26} label="Embeddings" sublabel="Model" color={model} />
        <FlowArrow x1={COL.model + W.model} y1={39 + ROW_H} x2={COL.stored} y2={39 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.model + W.model} y1={81 + ROW_H} x2={COL.stored} y2={81 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <CylinderNode x={COL.stored} y={20 + ROW_H} width={W.stored} height={38} label="Tok. Vecs" color={stored} />
        <CylinderNode x={COL.stored} y={62 + ROW_H} width={W.stored} height={38} label="Tok. Vecs" color={stored} />
        <FlowArrow x1={COL.stored + W.stored} y1={39 + ROW_H} x2={COL.score} y2={52 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <FlowArrow x1={COL.stored + W.stored} y1={81 + ROW_H} x2={COL.score} y2={68 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <CircleNode t={t} x={COL.score} y={38 + ROW_H} width={W.score} label="maxSim()" color={scoring} />
        <FlowArrow x1={COL.score + W.score} y1={60 + ROW_H} x2={COL.output} y2={60 + ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <OutputNode x={COL.output} y={43 + ROW_H} width={W.output} height={34} label="MaxSim Score" color={output} />

        {/* --- Row 3: Cross-Encoder --- */}
        <text x={COL.input} y={14 + 2 * ROW_H} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Cross-Encoder
        </text>
        <RectNode t={t} x={COL.input} y={38 + 2 * ROW_H} width={W.input} height={30} label="Query + Doc" color={input} />
        <FlowArrow x1={COL.input + W.input} y1={53 + 2 * ROW_H} x2={COL.model} y2={53 + 2 * ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <RectNode t={t} x={COL.model} y={38 + 2 * ROW_H} width={W.model} height={30} label="Reranker" sublabel="model" color={model} />
        <FlowArrow x1={COL.model + W.model} y1={53 + 2 * ROW_H} x2={COL.stored} y2={53 + 2 * ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <CylinderNode x={COL.stored} y={31 + 2 * ROW_H} width={W.stored} height={44} label="Tokens" color={stored} />
        <FlowArrow x1={COL.stored + W.stored} y1={53 + 2 * ROW_H} x2={COL.score} y2={53 + 2 * ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <CircleNode t={t} x={COL.score} y={31 + 2 * ROW_H} width={W.score} label="cls()" color={scoring} />
        <FlowArrow x1={COL.score + W.score} y1={53 + 2 * ROW_H} x2={COL.output} y2={53 + 2 * ROW_H} color={t.textMuted} markerId="3way-arrow" />
        <OutputNode x={COL.output} y={36 + 2 * ROW_H} width={W.output} height={34} label="Relevance" color={output} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Same shape, same meaning, in every row: rectangle = input or model stage, cylinder = a stored representation, circle = a scoring step, bordered box = the final score.
      </div>
    </VisualizationContainer>
  );
}
