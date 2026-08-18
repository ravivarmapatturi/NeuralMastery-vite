import { useMemo } from 'react';
import katex from 'katex';
import { SPACING } from '../../theme/vizTokens';

/**
 * KaTeX-rendered formula, tied to whatever the visualization is currently
 * showing (e.g. the actual gradient value at the current point, not a
 * static textbook formula). Distinct from the MDX-prose $...$ math, which
 * is rendered at build time by rehype-katex -- this renders at runtime,
 * client-side, since the LaTeX string itself can depend on live state.
 */
export default function VisualizationMath({
  latex,
  display = true,
}: {
  latex: string;
  display?: boolean;
}) {
  const html = useMemo(
    () => katex.renderToString(latex, { throwOnError: false, displayMode: display }),
    [latex, display],
  );
  return (
    <div
      style={{ marginTop: display ? SPACING.sm : 0, fontSize: display ? 16 : 'inherit' }}
      // eslint-disable-next-line react/no-danger -- KaTeX's own escaped output
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
