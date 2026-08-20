import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { getConceptColor } from './diagramSystem';

export default function RebaseVsMergeDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<'merge' | 'rebase'>('merge');
  const mainColor = getConceptColor(t, 'query');
  const featColor = getConceptColor(t, 'attention');
  const newColor = t.accentWarn;

  return (
    <VisualizationContainer
      footer={
        mode === 'merge'
          ? 'Merge: a new merge commit (M) is created with two parents -- the original feature-branch commits (A, B) are untouched, and both branches\' history is preserved exactly as it happened.'
          : "Rebase: feature-branch commits are replayed on top of main's latest commit, producing NEW commits (A', B') with new hashes -- A and B still exist in Git's object store, but the branch pointer now points to the rewritten history. This is exactly why force-pushing after a rebase is required, and why rebasing commits someone else already pulled causes real conflicts: their history now disagrees with yours about what those commits even are."
      }
    >
      <div style={{ marginBottom: 14 }}>
        <VizButton variant={mode === 'merge' ? 'primary' : 'secondary'} onClick={() => setMode('merge')}>
          Merge
        </VizButton>{' '}
        <VizButton variant={mode === 'rebase' ? 'primary' : 'secondary'} onClick={() => setMode('rebase')}>
          Rebase
        </VizButton>
      </div>
      <svg width={420} height={160}>
        {/* main branch */}
        <line x1={20} y1={40} x2={mode === 'merge' ? 340 : 380} y2={40} stroke={mainColor} strokeWidth={2} />
        {[20, 120, 220].map((x, i) => (
          <circle key={i} cx={x} cy={40} r={8} fill={mainColor} />
        ))}
        <text x={20} y={20} fontSize={10} fill={mainColor} textAnchor="middle">main</text>

        {mode === 'merge' ? (
          <>
            {/* feature branch diverging and merging back */}
            <path d="M 120,40 C 180,100 260,100 320,40" fill="none" stroke={featColor} strokeWidth={2} />
            <circle cx={200} cy={98} r={8} fill={featColor} />
            <circle cx={260} cy={98} r={8} fill={featColor} />
            <text x={230} y={122} fontSize={10} fill={featColor} textAnchor="middle">A, B (unchanged)</text>
            <circle cx={340} cy={40} r={9} fill={newColor} />
            <text x={340} y={20} fontSize={10} fill={newColor} textAnchor="middle">M (2 parents)</text>
          </>
        ) : (
          <>
            {/* feature branch, then replayed on top of main's tip */}
            <path d="M 120,40 C 160,90 200,90 240,90" fill="none" stroke={t.textMuted} strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={190} cy={90} r={7} fill={t.textMuted} opacity={0.5} />
            <circle cx={240} cy={90} r={7} fill={t.textMuted} opacity={0.5} />
            <text x={215} y={112} fontSize={9} fill={t.textMuted} textAnchor="middle">A, B (orphaned)</text>

            <line x1={220} y1={40} x2={380} y2={40} stroke={mainColor} strokeWidth={2} />
            <circle cx={300} cy={40} r={8} fill={newColor} />
            <circle cx={360} cy={40} r={8} fill={newColor} />
            <text x={330} y={20} fontSize={10} fill={newColor} textAnchor="middle">A', B' (new hashes)</text>
          </>
        )}
      </svg>
    </VisualizationContainer>
  );
}
