import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from './theme/ThemeProvider';
import { ProgressProvider } from './contexts/ProgressContext';
import DocLayout from './components/layout/DocLayout';
import ThemedImage from './components/ThemedImage';
import MDXCodeBlock from './components/MDXCodeBlock';
import { getFlatPages } from './lib/contentTree';

// Components available to every .mdx file without an explicit import --
// mirrors how Docusaurus makes <ThemedImage> globally available in MDX.
// `pre` is overridden so every fenced code block gets Shiki highlighting
// automatically, not just ones that explicitly embed VisualizationCode.
const mdxComponents = { ThemedImage, pre: MDXCodeBlock };

function HomeRedirect() {
  const first = getFlatPages()[0];
  return <Navigate to={first ? first.route : '/docs/getting-started/intro'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <MDXProvider components={mdxComponents}>
          <BrowserRouter basename="/NeuralMastery-vite">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/docs/*" element={<DocLayout />} />
            </Routes>
          </BrowserRouter>
        </MDXProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
}
