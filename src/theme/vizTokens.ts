// Ported from platform/src/theme/vizTokens.js -- same palette, same shape.
// Interactive components should always read colors from useVizTokens(),
// never a hardcoded hex value, so they track the live theme toggle and
// stay pixel-consistent with the static diagram assets on the same page.

import { useColorMode } from './ThemeProvider';

export interface VizTokens {
  mode: 'dark' | 'light';
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentWarn: string;
  accentDanger: string;
  nodeFill: string;
  nodeBorder: string;
  edge: string;
}

export const DARK: VizTokens = {
  mode: 'dark',
  background: '#0A0A0B',
  surface: '#141416',
  surfaceAlt: '#1E1E21',
  border: '#2C2C30',
  textPrimary: '#F5F5F7',
  textSecondary: '#ABABB3',
  textMuted: '#707078',
  accentPrimary: '#3DDC97',
  accentSecondary: '#5B8CFF',
  accentWarn: '#F4B942',
  accentDanger: '#F45B5B',
  nodeFill: '#1E1E21',
  nodeBorder: '#3DDC97',
  edge: '#5B8CFF',
};

export const LIGHT: VizTokens = {
  mode: 'light',
  background: '#FFFFFF',
  surface: '#F6F7F8',
  surfaceAlt: '#EEF0F2',
  border: '#E3E6EA',
  textPrimary: '#14161A',
  textSecondary: '#5B6470',
  textMuted: '#88919C',
  accentPrimary: '#21A374',
  accentSecondary: '#3169E0',
  accentWarn: '#B9791E',
  accentDanger: '#D43F3F',
  nodeFill: '#EEF0F2',
  nodeBorder: '#21A374',
  edge: '#3169E0',
};

export const RADIUS = { sm: 6, md: 12, lg: 20 };
export const SPACING = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 };
export const FONT_FAMILY =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/** A small, consistent per-feature color palette -- used anywhere a chart
 * needs to distinguish up to 4 named features by color (currently Ridge and
 * Lasso Regression Studios' regularization-path charts). */
export function getFeatureColors(t: VizTokens): string[] {
  return [t.accentPrimary, t.accentSecondary, t.accentWarn, t.accentDanger];
}

export function useVizTokens(): VizTokens {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? DARK : LIGHT;
}
