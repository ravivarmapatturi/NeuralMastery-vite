// Pagefind indexes static HTML by crawling files on disk. platform-vite is
// a client-side-only SPA -- dist/index.html's <body> is just `<div
// id="root">` until React renders, so running `pagefind --site dist`
// directly indexes zero words (verified: it does, and fails the build).
//
// Fix, scoped to index generation only: boot the real production build
// (via scripts/static-server.cjs, which reproduces GitHub Pages' base-path
// + no-SPA-fallback behavior), visit every real /docs/* route in a headless
// browser, and snapshot each route's fully-rendered HTML into a throwaway
// directory. Pagefind then indexes THAT directory, and --output-path writes
// the resulting index into dist/pagefind -- so the search bundle that ships
// is generated from the actual rendered content of the actual production
// build, without changing what's deployed (dist/ itself stays the plain SPA
// shell + assets + 404.html; the prerender directory is scratch-only).
//
// This produces a real, usable search index as a CI/build artifact. Wiring
// an actual search UI into the app is a separate, later concern (Phase 3).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const CONTENT_ROOT = join(ROOT, 'src', 'content', 'docs');
const PRERENDER_DIR = join(ROOT, '.pagefind-prerender');
const PORT = 4174;
const BASE = '/NeuralMastery';

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (extname(entry) === '.mdx') out.push(full);
  }
  return out;
}

function routesFromContentTree() {
  return walk(CONTENT_ROOT).map((f) => `/docs/${relative(CONTENT_ROOT, f).replace(/\.mdx$/, '').split('\\').join('/')}`);
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`static-server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function main() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('prerender-for-pagefind: dist/index.html missing -- run `npm run build` first.');
    process.exit(1);
  }

  rmSync(PRERENDER_DIR, { recursive: true, force: true });
  mkdirSync(PRERENDER_DIR, { recursive: true });

  const server = spawn(process.execPath, [join(ROOT, 'scripts', 'static-server.cjs')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit',
  });

  try {
    await waitForServer(`http://localhost:${PORT}${BASE}/`);

    const routes = routesFromContentTree();
    console.log(`prerender-for-pagefind: snapshotting ${routes.length} route(s)...`);

    const browser = await chromium.launch();
    const page = await browser.newPage();
    for (const route of routes) {
      await page.goto(`http://localhost:${PORT}${BASE}${route}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('article.prose', { timeout: 10000 });
      const html = await page.content();
      const outFile = join(PRERENDER_DIR, route.replace(/^\//, ''), 'index.html');
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, html);
    }
    await browser.close();
    console.log(`prerender-for-pagefind: wrote ${routes.length} rendered page(s) to ${relative(ROOT, PRERENDER_DIR)}/`);
  } finally {
    server.kill();
  }
}

main().catch((e) => {
  console.error('prerender-for-pagefind failed:', e);
  process.exit(1);
});
