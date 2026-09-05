// Thin wrapper around Pagefind's runtime JS API
// (https://pagefind.app/docs/api/). `npm run pagefind` writes
// dist/pagefind/pagefind.js + its index at BUILD time (see
// scripts/prerender-for-pagefind.mjs) -- it does not exist under `vite dev`,
// so loading it is expected to fail there. Callers must treat
// loadPagefind() rejecting as "search unavailable right now", not a bug.
export interface PagefindResultData {
  url: string;
  excerpt: string; // pre-highlighted HTML (<mark> around matched terms)
  meta: { title?: string; [key: string]: unknown };
}

interface PagefindSearchResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindSearchResponse {
  results: PagefindSearchResult[];
}

interface PagefindApi {
  init?: () => Promise<void>;
  search: (query: string) => Promise<PagefindSearchResponse>;
}

let cached: Promise<PagefindApi> | null = null;

/** Loads and initializes the Pagefind runtime exactly once per page load,
 * regardless of how many times search is opened/closed. */
export function loadPagefind(): Promise<PagefindApi> {
  if (!cached) {
    const url = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
    cached = import(/* @vite-ignore */ url).then(async (mod: PagefindApi) => {
      await mod.init?.();
      return mod;
    });
    // A failed load shouldn't poison the cache forever -- e.g. a dev-server
    // session that later hits a production-like proxy should get to retry.
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

export async function searchDocs(query: string): Promise<PagefindResultData[]> {
  if (!query.trim()) return [];
  const pagefind = await loadPagefind();
  const response = await pagefind.search(query);
  return Promise.all(response.results.slice(0, 12).map((r) => r.data()));
}

/** Pagefind infers its site root from pagefind.js's own script URL, so
 * result.url already comes back BASE_URL-prefixed and directory-style
 * (e.g. "/docs/foo/", or with a real subpath prefix if BASE_URL ever has
 * one again) -- strip that prefix before handing it to react-router's
 * basename-aware navigate()/Link, which would otherwise prepend the same
 * base a second time, then strip the trailing slash to match how routes
 * are written elsewhere. */
export function toRoute(pagefindUrl: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = pagefindUrl;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  path = path.replace(/\/$/, '');
  return path || '/';
}
