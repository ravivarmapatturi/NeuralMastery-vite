import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'neural-mastery-theme';

interface ThemeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Matches the old Docusaurus config's respectPrefersColorScheme: true.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Replaces @docusaurus/theme-common's useColorMode(). Sets data-theme on
 * <html> (same attribute convention the old platform used, so CSS ported
 * from custom.css needs zero selector changes), persists explicit choices,
 * and falls back to the OS preference when no choice has been made yet.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(getInitialColorMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  const value = useMemo(
    () => ({ colorMode, setColorMode, toggleColorMode }),
    [colorMode, setColorMode, toggleColorMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useColorMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useColorMode must be used within a ThemeProvider');
  return ctx;
}
