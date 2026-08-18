// platform-vite is a client-side-only SPA (no SSR/prerendering) -- `vite
// build` produces exactly one real HTML file, dist/index.html. Every route
// under /docs/* is resolved client-side by React Router after that shell
// loads. GitHub Pages, unlike the Vite dev/preview server, does NOT fall
// back to index.html for unmatched paths -- it serves whatever file is at
// `404.html` (if present) with an HTTP 404 status for any path that isn't a
// real file. The standard fix (used by every SPA deployed to GitHub Pages)
// is to make 404.html a copy of index.html: the browser still receives the
// real requested URL (GitHub Pages doesn't rewrite it), so BrowserRouter
// reads `location.pathname` correctly once the shell's JS boots and renders
// the right page. Without this, directly opening or refreshing a deep link
// like /NeuralMastery/docs/machine-learning/linear-regression 404s instead
// of loading the app.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '..', 'dist');
const src = resolve(dist, 'index.html');
const dest = resolve(dist, '404.html');

if (!existsSync(src)) {
  console.error(`copy-404: ${src} does not exist -- did vite build run first?`);
  process.exit(1);
}

copyFileSync(src, dest);
console.log('copy-404: dist/404.html written (GitHub Pages SPA deep-link fallback)');
