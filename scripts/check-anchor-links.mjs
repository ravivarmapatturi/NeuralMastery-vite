// Validates in-page anchor links (`#heading-id` and `/docs/path#heading-id`)
// against the actual set of heading ids the site would generate at runtime.
//
// This exists because check-internal-links.mjs explicitly does NOT check
// anchors (see its own header comment) -- that gap let a real bug (a
// double-hyphen slug pattern that never matches a real heading id) sit
// invisible sitewide for an unknown duration, since nothing else validated
// #anchor fragments either. This script closes that gap.
//
// Heading ids are generated at runtime by TableOfContents.tsx's scanHeadings()
// from each h2/h3's *rendered* textContent:
//   text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
// We can't run that against real rendered DOM here (no browser), so we
// reimplement it against a best-effort plain-text reconstruction of each
// markdown heading line (strip markdown links/emphasis/code/inline-math
// delimiters down to their inner text, then apply the identical slug
// regex). This is exact for the overwhelming majority of real headings
// (plain text, or text with **bold**/*italic*/`code`/[links](url)) and
// only approximate for the rare heading containing inline math -- KaTeX's
// real rendered textContent for `$...$` doesn't perfectly match its LaTeX
// source. Any such heading is reported separately as a caveat rather than
// silently trusted, so a false pass/fail there is visible, not hidden.
//
// Scope: scans anchor references in MDX prose (src/content/docs/**/*.mdx)
// AND in .tsx source (component/diagram string props, hrefs, etc.) --
// unlike check-internal-links.mjs, which only scans MDX. Only two link
// shapes are checked: `#slug` (same-file) and `/docs/path/to/page#slug`
// (cross-file, requires the explicit /docs/ prefix so we don't false-positive
// on unrelated strings starting with '#', e.g. CSS hex colors like '#d9534f').
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import matter from 'gray-matter';
import { slugify, headingPlainText } from './lib/anchorSlug.mjs';

const ROOT = join(import.meta.dirname, '..');
const CONTENT_ROOT = join(ROOT, 'src', 'content', 'docs');
const SRC_ROOT = join(ROOT, 'src');

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(extname(entry))) out.push(full);
  }
  return out;
}

const mdxFiles = walk(CONTENT_ROOT, ['.mdx']);
const tsxFiles = walk(SRC_ROOT, ['.tsx']);

// route ("/docs/...") -> { slugs: Set<string>, mathCaveats: string[] }
const routeHeadings = new Map();
// absolute mdx file path -> route, for same-file (#slug) resolution
const fileToRoute = new Map();

for (const file of mdxFiles) {
  const rel = relative(CONTENT_ROOT, file).replace(/\.mdx$/, '').split('\\').join('/');
  const route = `/docs/${rel}`;
  fileToRoute.set(file, route);

  const raw = readFileSync(file, 'utf8');
  const { content } = matter(raw);
  const slugs = new Set();
  const mathCaveats = [];

  for (const line of content.split('\n')) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const { text, hasInlineMath } = headingPlainText(m[2]);
    const slug = slugify(text);
    slugs.add(slug);
    if (hasInlineMath) mathCaveats.push(`${m[2]} -> #${slug} (approximate: contains inline math)`);
  }

  routeHeadings.set(route, { slugs, mathCaveats });
}

// Anchor reference patterns: capture optional cross-file /docs/ path, and the anchor slug.
const ANCHOR_PATTERNS = [
  /\[[^\]]*\]\((\/docs\/[^)#\s]+)?#([a-zA-Z0-9-]+)\)/g, // markdown [text](/docs/path#slug) or [text](#slug)
  /\bhref=["'](\/docs\/[^"'#]+)?#([a-zA-Z0-9-]+)["']/g, // JSX href="/docs/path#slug" or href="#slug"
];
// .tsx-only pattern: cross-file only, /docs/ prefix required (avoids matching CSS hex colors etc.)
const TSX_CROSS_FILE_PATTERN = /["'](\/docs\/[^"'#]+)#([a-zA-Z0-9-]+)["']/g;

let brokenCount = 0;
const findings = [];
const mathCaveatFindings = [];

for (const file of mdxFiles) {
  const raw = readFileSync(file, 'utf8');
  const { content } = matter(raw);
  const ownRoute = fileToRoute.get(file);

  for (const pattern of ANCHOR_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const targetRoute = match[1] ? match[1].replace(/\/$/, '') : ownRoute;
      const slug = match[2];
      const target = routeHeadings.get(targetRoute);
      if (!target) continue; // unknown route -- check-internal-links.mjs's job, not ours
      if (!target.slugs.has(slug)) {
        brokenCount++;
        findings.push({ file: relative(process.cwd(), file), link: `${match[1] ?? ''}#${slug}` });
      }
    }
  }
}

for (const file of tsxFiles) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(TSX_CROSS_FILE_PATTERN)) {
    const targetRoute = match[1].replace(/\/$/, '');
    const slug = match[2];
    const target = routeHeadings.get(targetRoute);
    if (!target) continue;
    if (!target.slugs.has(slug)) {
      brokenCount++;
      findings.push({ file: relative(process.cwd(), file), link: `${match[1]}#${slug}` });
    }
  }
}

for (const [route, { mathCaveats }] of routeHeadings) {
  for (const c of mathCaveats) mathCaveatFindings.push(`${route}: ${c}`);
}

const totalSlugs = [...routeHeadings.values()].reduce((n, r) => n + r.slugs.size, 0);
console.log(`check-anchor-links: scanned ${mdxFiles.length} MDX file(s) (${totalSlugs} heading id(s)) and ${tsxFiles.length} TSX file(s).`);

if (mathCaveatFindings.length > 0) {
  console.log(`\n${mathCaveatFindings.length} heading(s) contain inline math -- their computed id is approximate, not verified against real KaTeX-rendered textContent:`);
  for (const c of mathCaveatFindings) console.log(`  ${c}`);
}

if (findings.length > 0) {
  console.error(`\nBroken anchor link(s) found (target route has no matching heading id):\n`);
  for (const f of findings) console.error(`  ${f.file} -> ${f.link}`);
  console.error(`\n${brokenCount} broken anchor link(s). Failing.`);
  process.exit(1);
}
console.log('check-anchor-links: no broken anchor links found.');
