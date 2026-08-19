import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

type Quality = 'good' | 'bad';

const EXAMPLES: Record<Quality, { name: string; desc: string; args: string; result: string }> = {
  good: {
    name: 'get_stock_price',
    desc: '"Get the current stock price for a given ticker symbol."',
    args: '{ ticker: string }',
    result: 'Model calls this confidently and correctly for any price question — the name, description, and schema all point at exactly one use.',
  },
  bad: {
    name: 'do_finance_stuff',
    desc: '"Handles various finance-related operations."',
    args: '{ input: string, mode?: string, options?: object }',
    result: 'Model has to guess what "mode" and "options" should contain — ambiguous schema, unpredictable/malformed calls, harder to debug when it gets it wrong.',
  },
};

/** The same intent ("look up a stock price"), designed two ways. A clear
 * name/description and a narrow, well-typed schema make the right call
 * obvious; a vague catch-all tool with loose optional fields forces the
 * model to guess. */
export default function ToolDesignQualityDiagram() {
  const t = useVizTokens();
  const [quality, setQuality] = useState<Quality>('good');
  const color = quality === 'good' ? t.accentPrimary : t.accentDanger;
  const ex = EXAMPLES[quality];

  return (
    <VisualizationContainer footer={ex.result}>
      <PillSelect<Quality> label="Tool design" value={quality} onChange={setQuality} options={[{ value: 'good', label: 'Well-designed' }, { value: 'bad', label: 'Poorly-designed' }]} />
      <div style={{ marginTop: 10, padding: 14, borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}`, fontFamily: 'monospace', fontSize: 11 }}>
        <div style={{ color, fontWeight: 700, marginBottom: 6 }}>{ex.name}({ex.args.replace(/[{}]/g, '').trim()})</div>
        <div style={{ color: t.textSecondary }}>{ex.desc}</div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Clear names/descriptions, well-specified schemas, narrow scope — each independently reduces malformed or wrong tool calls.
      </div>
    </VisualizationContainer>
  );
}
