import React, { isValidElement } from 'react';
import VisualizationCode from '../viz/primitives/VisualizationCode';

interface CodeChildProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Overrides MDX's default <pre><code> rendering for fenced code blocks
 * (```python ... ```) to route through the Shiki-backed VisualizationCode
 * primitive, so a lesson's code and a visualization's code look identical.
 */
export default function MDXCodeBlock({ children }: { children?: React.ReactNode }) {
  if (isValidElement<CodeChildProps>(children) && typeof children.props.children === 'string') {
    const lang = children.props.className?.replace('language-', '') || 'text';
    return <VisualizationCode code={children.props.children.replace(/\n$/, '')} lang={lang} />;
  }
  return <pre>{children}</pre>;
}
