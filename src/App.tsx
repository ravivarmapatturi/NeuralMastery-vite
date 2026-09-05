import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from './theme/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { GamificationProvider } from './contexts/GamificationContext';
import DocLayout from './components/layout/DocLayout';
import Home from './components/Home';
import ProgressPage from './components/ProgressPage';
import ProfilePage from './components/ProfilePage';
import ThemedImage from './components/ThemedImage';
import MDXCodeBlock from './components/MDXCodeBlock';
import MDXLink from './components/MDXLink';
import AnalyticsTracker from './components/AnalyticsTracker';

// Components available to every .mdx file without an explicit import --
// mirrors how Docusaurus makes <ThemedImage> globally available in MDX.
// `pre` is overridden so every fenced code block gets Shiki highlighting
// automatically, not just ones that explicitly embed VisualizationCode.
// `a` is overridden so internal doc links (the vast majority of links in
// migrated content) get client-side, basename-aware navigation instead of
// a full page reload to a base-path-less URL -- see MDXLink.tsx.
const mdxComponents = { ThemedImage, pre: MDXCodeBlock, a: MDXLink };

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <GamificationProvider>
            <MDXProvider components={mdxComponents}>
              {/* Reads Vite's own BASE_URL (derived from vite.config.ts's
                  `base`) instead of a second hardcoded copy of the same
                  path -- the two drifting out of sync silently 404s every
                  in-app link, exactly the kind of bug a single source of
                  truth prevents outright. */}
              <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
                <AnalyticsTracker />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/docs/*" element={<DocLayout />} />
                </Routes>
              </BrowserRouter>
            </MDXProvider>
          </GamificationProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
