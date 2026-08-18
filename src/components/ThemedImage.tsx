import React from 'react';
import { useColorMode } from '../theme/ThemeProvider';

/**
 * Drop-in replacement for Docusaurus's @theme/ThemedImage -- same prop
 * shape (sources={{light, dark}}, alt) -- so MDX ported from the old
 * platform in Phase 2 needs zero changes to its ThemedImage usage, only
 * the import path.
 */
export default function ThemedImage({
  sources,
  alt,
  ...rest
}: {
  sources: { light: string; dark: string };
  alt: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { colorMode } = useColorMode();
  return <img src={colorMode === 'dark' ? sources.dark : sources.light} alt={alt} style={{ maxWidth: '100%' }} {...rest} />;
}
