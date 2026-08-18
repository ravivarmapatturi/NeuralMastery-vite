#!/usr/bin/env node
// Deterministic Docusaurus -> Vite/MDX content migration.
//
// Usage:
//   node scripts/migrate-docs.mjs <section> [<section> ...]
//   node scripts/migrate-docs.mjs --all
//
// Reads platform/docs/<section>/**/*.md (the sibling Docusaurus repo) and
// writes platform-vite/src/content/docs/<section>/**/*.mdx, applying only
// the Docusaurus -> Vite/MDX syntax conversions that are actually required
// (import paths, internal links, plain markdown images -> asset imports).
// Content, prose, math, and existing JSX component usage are copied
// verbatim -- this script never rewrites educational content.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, cpSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DOCS = path.resolve(ROOT, '..', 'platform', 'docs');
const DEST_DOCS = path.resolve(ROOT, 'src', 'content', 'docs');

function walkMd(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'img') continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMd(full));
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

function copyCategoryFiles(srcDir, destDir) {
  for (const entry of readdirSync(srcDir)) {
    const full = path.join(srcDir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'img') {
        mkdirSync(path.join(destDir, 'img'), { recursive: true });
        cpSync(full, path.join(destDir, 'img'), { recursive: true });
      } else {
        mkdirSync(path.join(destDir, entry), { recursive: true });
        copyCategoryFiles(full, path.join(destDir, entry));
      }
    } else if (entry === '_category_.json') {
      writeFileSync(path.join(destDir, entry), readFileSync(full));
    }
  }
}

/**
 * import X from '@site/src/components/...'; -> relative path from the
 * doc's location to src/. Viz components (and their primitives) were
 * ported to src/viz/ (not nested under src/components/ the way the
 * original repo had them) -- everything else stays under src/components/.
 */
function rewriteComponentImports(line, depth) {
  const m = line.match(/^import (\w+) from ['"]@site\/src\/components\/(.+?)['"];?\s*$/);
  if (!m) return line;
  const [, name, subpath] = m;
  const upDirs = '../'.repeat(depth);
  const target = subpath.startsWith('viz/') ? subpath : `components/${subpath}`;
  return `import ${name} from '${upDirs}${target}';`;
}

/** ThemedImage is provided globally via MDXProvider (src/App.tsx) -- drop the explicit import. */
function isThemedImageImport(line) {
  return /^import ThemedImage from ['"]@theme\/ThemedImage['"];?\s*$/.test(line);
}

/** Resolves a Docusaurus-relative doc link (./foo.md, ../section/foo.md#anchor) to a route. */
function resolveDocLink(currentSection, linkPath) {
  const hashIdx = linkPath.indexOf('#');
  const pathPart = hashIdx === -1 ? linkPath : linkPath.slice(0, hashIdx);
  const hash = hashIdx === -1 ? '' : linkPath.slice(hashIdx);
  if (!pathPart) return linkPath; // pure in-page anchor
  const withoutExt = pathPart.replace(/\.mdx?$/, '');
  const base = currentSection ? `/docs/${currentSection}` : '/docs';
  const resolved = path.posix.normalize(path.posix.join(base, withoutExt));
  return resolved + hash;
}

function migrateFile(srcFile, section, sectionSrcRoot) {
  const raw = readFileSync(srcFile, 'utf8');
  const { data, content } = matter(raw);

  const relFromSection = path.relative(sectionSrcRoot, srcFile).replace(/\\/g, '/');
  const slug = relFromSection.replace(/\.mdx?$/, '');
  // src/content/docs/[<section>/][...subdirs/]<file>.mdx -> src/: 2 base
  // levels (content, docs) + 1 for the section folder (root-level files
  // passed with section === '' have none) + any extra slug subdirectories.
  const depthFromSrc = 2 + (section ? 1 : 0) + (slug.split('/').length - 1);

  let title = data.title;
  if (!title) {
    const h1 = content.match(/^#\s+(.+)$/m);
    title = h1 ? h1[1].trim() : slug.split('/').pop();
  }

  const lines = content.split('\n');
  const imageImports = [];
  let imgCounter = 0;

  const transformed = lines.map((line) => {
    if (isThemedImageImport(line)) return null; // drop -- provided globally

    const componentImportRewrite = rewriteComponentImports(line, depthFromSrc);
    if (componentImportRewrite !== line) return componentImportRewrite;

    if (/^:::/.test(line.trim())) {
      console.warn(`  ! WARNING: admonition syntax (":::") found in ${srcFile} -- not auto-converted, needs manual fix: "${line.trim()}"`);
    }

    // Plain markdown images -> hoisted asset import + JSX <img>, so Vite's
    // asset pipeline (base-path prefixing, hashing) applies uniformly,
    // exactly like the existing ThemedImage-driven ./img/*.png imports do.
    let out = line.replace(/!\[([^\]]*)\]\((\.\/img\/[^)]+)\)/g, (_full, alt, imgPath) => {
      const varName = `__migratedImg${imgCounter++}`;
      imageImports.push(`import ${varName} from '${imgPath}';`);
      const escapedAlt = alt.replace(/"/g, '&quot;');
      return `<img src={${varName}} alt="${escapedAlt}" style={{maxWidth: '100%'}} />`;
    });

    // Internal doc links: ./foo.md, ../section/foo.md, optionally #anchor.
    out = out.replace(/\]\((\.\.?\/[^)]+?\.mdx?(?:#[^)]*)?)\)/g, (_full, linkPath) => `](${resolveDocLink(section, linkPath)})`);

    return out;
  });

  const bodyLines = transformed.filter((l) => l !== null);
  const body = [...imageImports, ...(imageImports.length ? [''] : []), ...bodyLines].join('\n');

  const frontmatter = { title, ...(data.sidebar_position !== undefined ? { sidebar_position: data.sidebar_position } : {}) };
  const fmYaml = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`)
    .join('\n');

  const outContent = `---\n${fmYaml}\n---\n\n${body}`;
  const destFile = path.join(DEST_DOCS, section, `${slug}.mdx`);
  mkdirSync(path.dirname(destFile), { recursive: true });
  writeFileSync(destFile, outContent);
  return destFile;
}

function migrateSection(section) {
  const sectionSrcRoot = path.join(SRC_DOCS, section);
  if (!existsSync(sectionSrcRoot)) {
    console.error(`migrate-docs: no such section "${section}" under ${SRC_DOCS}`);
    process.exitCode = 1;
    return;
  }
  const destRoot = path.join(DEST_DOCS, section);
  mkdirSync(destRoot, { recursive: true });
  copyCategoryFiles(sectionSrcRoot, destRoot);

  const files = walkMd(sectionSrcRoot);
  let count = 0;
  for (const f of files) {
    migrateFile(f, section, sectionSrcRoot);
    count++;
  }
  console.log(`migrate-docs: ${section}: migrated ${count} document(s).`);
}

/** Loose top-level files directly under docs/ (intro.mdx, learning-path.md) -- no section folder. */
function migrateRootFiles() {
  const rootFiles = readdirSync(SRC_DOCS).filter((e) => {
    const full = path.join(SRC_DOCS, e);
    return statSync(full).isFile() && (e.endsWith('.md') || e.endsWith('.mdx'));
  });
  let count = 0;
  for (const f of rootFiles) {
    migrateFile(path.join(SRC_DOCS, f), '', SRC_DOCS);
    count++;
  }
  console.log(`migrate-docs: root: migrated ${count} document(s).`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/migrate-docs.mjs <section> [<section> ...] | --all | --root');
  process.exit(1);
}

if (args[0] === '--root') {
  migrateRootFiles();
} else {
  const sections = args[0] === '--all' ? readdirSync(SRC_DOCS).filter((e) => statSync(path.join(SRC_DOCS, e)).isDirectory()) : args;
  for (const section of sections) {
    migrateSection(section);
  }
  if (args[0] === '--all') migrateRootFiles();
}
