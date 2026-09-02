// Pure path-resolution logic extracted from static-server.cjs so it can be
// unit-tested without a real filesystem or HTTP server. The request-
// handling branches that actually decide 200/301/404 still need fs access
// (does this file exist), but WHERE a request pathname maps to on disk,
// and whether that stays safely inside dist/, never needs fs at all.
// CommonJS (not .mjs) specifically so static-server.cjs can require() it
// directly without an ESM interop step.

/** Maps a request pathname under BASE to a path relative to dist/, GitHub
 * Pages-style: strips the base path, and a trailing-slash (or bare "/")
 * request resolves to that directory's index.html. Returns null if the
 * pathname isn't under BASE at all (GitHub Pages project sites serve
 * nothing outside their base path either). */
function resolveRelPath(pathname, base) {
  if (!pathname.startsWith(base)) return null;
  let rel = pathname.slice(base.length) || '/';
  if (rel.endsWith('/')) rel += 'index.html';
  return rel;
}

/** Guards against a resolved path escaping distRoot via '..' segments in
 * the original request pathname. */
function isWithinRoot(filePath, distRoot) {
  return filePath.startsWith(distRoot);
}

/** The real GitHub Pages redirect target for a bare (no trailing slash)
 * directory path: 301 to the same path with a trailing slash, preserving
 * the original query string. */
function redirectLocation(pathname, search) {
  return `${pathname}/${search}`;
}

module.exports = { resolveRelPath, isWithinRoot, redirectLocation };
