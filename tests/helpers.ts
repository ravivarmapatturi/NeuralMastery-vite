import type { Page } from '@playwright/test';

/**
 * Attaches console/page-error/response tracking to a page. Call before
 * navigating, then call `.errors()` after your interactions to get the
 * filtered list of unexpected console errors.
 *
 * Every test in this suite that does a direct `page.goto('docs/...')` (i.e.
 * every test except the ones that click through an in-app Link) hits one
 * expected case: the static server has no SPA-fallback rewrite (it
 * deliberately reproduces GitHub Pages, which doesn't either), so a fresh
 * top-level navigation to a path with no physical file returns HTTP 404 and
 * serves 404.html (== index.html, see scripts/copy-404.mjs) before
 * BrowserRouter reads the URL and renders the right page. That legitimately
 * logs a generic "Failed to load resource: 404" console entry even though
 * nothing is broken -- the fallback mechanism working as intended.
 *
 * That console message's text alone doesn't carry the failing URL (Chromium
 * doesn't include it), so filtering by text pattern alone would also hide a
 * genuinely broken asset (missing image, bad font reference) that happens
 * to also 404. Instead this separately tracks which *responses* actually
 * failed via `page.on('response')`: `.errors()` only drops resource-load
 * console entries up to the number of failed top-level document
 * navigations seen, and only when there were zero failures of any other
 * resource type -- so a real broken asset still surfaces as an error.
 */
export function collectConsoleErrors(page: Page) {
  const rawErrors: string[] = [];
  let documentFailureCount = 0;
  let otherResourceFailureCount = 0;

  page.on('response', (response) => {
    if (response.status() < 400) return;
    if (response.request().resourceType() === 'document') {
      documentFailureCount++;
    } else {
      otherResourceFailureCount++;
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') rawErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    rawErrors.push('PAGEERROR: ' + err.message);
  });

  return {
    errors(): string[] {
      if (otherResourceFailureCount > 0 || documentFailureCount === 0) {
        return rawErrors;
      }
      // Drop up to `documentFailureCount` generic resource-load-failure
      // console entries -- the expected deep-link 404 fallback, and nothing
      // else, given otherResourceFailureCount is confirmed zero above.
      let toDrop = documentFailureCount;
      return rawErrors.filter((text) => {
        if (toDrop > 0 && /Failed to load resource/i.test(text)) {
          toDrop--;
          return false;
        }
        return true;
      });
    },
  };
}
