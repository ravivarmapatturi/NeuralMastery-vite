// Pure route/path logic extracted from prerender-for-pagefind.mjs so it
// can be unit-tested without touching the real filesystem, spawning a
// server, or launching a browser -- the parts of that script that
// actually need those things (walking dist/, snapshotting with
// Playwright) stay there; the string transformations that decide WHICH
// route a file maps to, and WHERE its snapshot gets written, are pure.
import { join, relative } from 'node:path';

/** Maps an absolute .mdx file path to its site route, exactly as
 * prerender-for-pagefind.mjs's routesFromContentTree() does: relativize
 * against the content root (node:path's relative(), the same function the
 * real script uses -- not a manual string slice, so this stays exactly
 * equivalent across platforms), strip the .mdx extension, normalize
 * Windows backslashes to forward slashes, prefix with /docs/. */
export function routeFromMdxPath(absoluteFilePath, contentRoot) {
  const relPath = relative(contentRoot, absoluteFilePath).replace(/\.mdx$/, '');
  const posixPath = relPath.split('\\').join('/');
  return `/docs/${posixPath}`;
}

/** Maps a route to the on-disk path its prerendered snapshot gets written
 * to, under a given base directory (.pagefind-prerender/ or dist/) --
 * always <base>/<route-without-leading-slash>/index.html. */
export function outputPathForRoute(route, baseDir) {
  return join(baseDir, route.replace(/^\//, ''), 'index.html');
}
