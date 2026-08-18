// Validates internal links found in MDX source content against the actual
// set of routes the content-tree would generate (src/lib/contentTree.ts's
// logic, reimplemented here in plain Node since that file uses Vite's
// import.meta.glob and can't run outside a Vite build).
//
// Scope, deliberately: this checks MARKDOWN/JSX PROSE LINKS inside
// src/content/docs/**/*.mdx (`[text](/docs/...)` and `href="/docs/..."`)
// against the known-real route set. It does NOT check:
//   - external links (http/https) -- no network calls in CI, by design
//   - in-page anchors (#heading-id) -- would need a rendered DOM
//   - links generated at runtime from component data (e.g. AlgorithmSelector's
//     decision-tree hrefs, LearningPathMap's section hrefs) -- those
//     intentionally point at not-yet-migrated routes right now (see
//     MIGRATION_STATUS.md's "Special attention" section) and are a
//     content-migration-phase concern, not a broken-prose-link one.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import matter from 'gray-matter';

const CONTENT_ROOT = join(import.meta.dirname, '..', 'src', 'content', 'docs');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (extname(entry) === '.mdx') out.push(full);
  }
  return out;
}

const files = walk(CONTENT_ROOT);

// Build the same route set contentTree.ts derives from the file tree.
const validRoutes = new Set(
  files.map((f) => {
    const rel = relative(CONTENT_ROOT, f).replace(/\.mdx$/, '').split('\\').join('/');
    return `/docs/${rel}`;
  }),
);

const LINK_PATTERNS = [
  /\[[^\]]*\]\((\/docs\/[^)#\s]+)/g, // markdown [text](/docs/...)
  /\bhref=["'](\/docs\/[^"'#]+)["']/g, // JSX/HTML href="/docs/..."
  /\bto=["'](\/docs\/[^"'#]+)["']/g, // react-router <Link to="/docs/...">
];

let brokenCount = 0;
const findings = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const { content } = matter(raw);
  for (const pattern of LINK_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const link = match[1].replace(/\/$/, '');
      if (!validRoutes.has(link)) {
        brokenCount++;
        findings.push({ file: relative(process.cwd(), file), link });
      }
    }
  }
}

console.log(`check-internal-links: scanned ${files.length} MDX file(s), found ${validRoutes.size} valid route(s).`);
if (findings.length > 0) {
  console.error(`\nBroken internal link(s) found in MDX prose content:\n`);
  for (const f of findings) console.error(`  ${f.file} -> ${f.link}`);
  console.error(`\n${brokenCount} broken internal link(s). Failing.`);
  process.exit(1);
}
console.log('check-internal-links: no broken internal prose links found.');
