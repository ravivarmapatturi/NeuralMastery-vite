// Pre-extracts every page's frontmatter (title, sidebar_position,
// description) plus each section's _category_.json into
// src/data/pageMeta.generated.json, so contentTree.ts can build the
// sidebar/nav tree from plain static JSON instead of eagerly importing
// (and bundling) every single .mdx page's compiled component just to read
// its frontmatter. That eager import.meta.glob was the root cause of the
// whole site shipping as one ~1.2MB-gzipped JS chunk regardless of route --
// this is the piece that lets the component import become lazy instead
// (see contentTree.ts).
//
// Same walk()+gray-matter pattern as check-internal-links.mjs, which
// already reimplements route derivation in plain Node for the same reason
// (contentTree.ts uses Vite's import.meta.glob and can't run outside Vite).
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import matter from 'gray-matter';

const root = join(import.meta.dirname, '..');
const CONTENT_ROOT = join(root, 'src', 'content', 'docs');
const OUTPUT = join(root, 'src', 'data', 'pageMeta.generated.json');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const allFiles = walk(CONTENT_ROOT);
const mdxFiles = allFiles.filter((f) => extname(f) === '.mdx');
const categoryFiles = allFiles.filter((f) => f.endsWith('_category_.json'));

const pages = {};
for (const file of mdxFiles) {
  const rel = relative(CONTENT_ROOT, file).replace(/\.mdx$/, '').split('\\').join('/');
  const parts = rel.split('/');
  const section = parts.length > 1 ? parts[0] : 'general';
  const raw = readFileSync(file, 'utf8');
  const { data } = matter(raw);
  pages[`/docs/${rel}`] = {
    slug: rel,
    section,
    title: data.title ?? null,
    sidebarPosition: typeof data.sidebar_position === 'number' ? data.sidebar_position : null,
    description: data.description ?? null,
    // Practice-problem-only fields (real, structured tags -- see Phase 2 of
    // the Learn/Practice split). null for every other page, which never
    // had and never needs these.
    difficulty: data.difficulty ?? null,
    topic: data.topic ?? null,
  };
}

const categories = {};
for (const file of categoryFiles) {
  const section = relative(CONTENT_ROOT, dirname(file)).split('\\').join('/');
  const meta = JSON.parse(readFileSync(file, 'utf8'));
  categories[section] = { label: meta.label, position: meta.position };
}

writeFileSync(OUTPUT, JSON.stringify({ pages, categories }, null, 2) + '\n');
console.log(`generate-page-meta: wrote ${Object.keys(pages).length} pages, ${Object.keys(categories).length} categories to ${existsSync(OUTPUT) ? 'src/data/pageMeta.generated.json' : OUTPUT}`);
