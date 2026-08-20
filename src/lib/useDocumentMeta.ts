import { useEffect } from 'react';

const SITE_NAME = 'Neural Mastery';
export const SITE_URL = 'https://ravivarmapatturi.github.io/NeuralMastery-vite/';
export const DEFAULT_DESCRIPTION =
  'Learn AI and machine learning through real, computed, interactive visualizations, not static diagrams -- covering machine learning, deep learning, LLMs, and agents.';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets <meta name="description"> plus Open Graph / Twitter Card tags and a
 * canonical link, per route -- the SEO surface useDocumentTitle doesn't
 * cover. Falls back to a sitewide description when a page has no
 * frontmatter `description` yet (most don't, as of writing -- authors can
 * add one per page over time; this keeps every route non-empty in the
 * meantime rather than blocking on 200+ pages of hand-written copy).
 *
 * Caveat: this SPA has no SSR/prerendering, so these tags only exist once
 * JS runs. Search engines that execute JS (Googlebot) see them fine; some
 * social-preview crawlers that don't will only see index.html's static
 * fallback tags. */
export function useDocumentMeta(pageTitle: string | undefined, description?: string): void {
  useEffect(() => {
    const desc = description ?? DEFAULT_DESCRIPTION;
    const fullTitle = pageTitle ? `${pageTitle} — ${SITE_NAME}` : SITE_NAME;
    const canonical = SITE_URL.replace(/\/$/, '') + window.location.pathname.replace(/^\/NeuralMastery-vite/, '');

    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertCanonical(canonical);
  }, [pageTitle, description]);
}
