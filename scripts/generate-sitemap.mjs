// Walks src/content/docs/**/*.mdx the same way src/lib/contentTree.ts does
// at runtime (route = "/docs/" + relative path minus .mdx) and writes a
// sitemap.xml into dist/ at build time. Kept as a plain filesystem walk
// rather than importing contentTree.ts directly, since that module relies
// on Vite's import.meta.glob and isn't runnable under plain Node.
import { writeFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';

const SITE_URL = 'https://neuralmasteryai.com';
const docsDir = resolve(import.meta.dirname, '..', 'src', 'content', 'docs');
const dist = resolve(import.meta.dirname, '..', 'dist');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const files = walk(docsDir);
const urls = [
  { loc: `${SITE_URL}/`, lastmod: null },
  ...files.map((f) => {
    const rel = relative(docsDir, f).replace(/\.mdx$/, '').split('\\').join('/');
    return { loc: `${SITE_URL}/docs/${rel}`, lastmod: statSync(f).mtime.toISOString().slice(0, 10) };
  }),
];

const body = urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(resolve(dist, 'sitemap.xml'), xml);
console.log(`generate-sitemap: wrote dist/sitemap.xml with ${urls.length} URLs`);
