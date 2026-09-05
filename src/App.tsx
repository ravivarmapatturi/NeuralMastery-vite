import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from './theme/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import DocLayout from './components/layout/DocLayout';
import Home from './components/Home';
import ProgressPage from './components/ProgressPage';
import ThemedImage from './components/ThemedImage';
import MDXCodeBlock from './components/MDXCodeBlock';
import MDXLink from './components/MDXLink';

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
          <MDXProvider components={mdxComponents}>
            <BrowserRouter basename="/NeuralMastery-vite">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/docs/*" element={<DocLayout />} />
              </Routes>
            </BrowserRouter>
          </MDXProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
