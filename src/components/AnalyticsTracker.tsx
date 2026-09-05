import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fires a real GA4 page_view on every client-side route change -- Firebase
 * Analytics only auto-logs one page_view on initial script load, since it
 * has no way to know this is an SPA where almost every navigation never
 * reloads the page. Mounted once at the app root (a sibling of <Routes>,
 * not inside any one page), so it sees every route change regardless of
 * which page is showing.
 *
 * The short delay before reading document.title is deliberate, not
 * arbitrary: each page's own title (see useDocumentTitle) is set by an
 * effect inside that page's own lazily-loaded component, which may not
 * have mounted and run yet in the same tick the route itself changes --
 * without the delay, a page_view could occasionally report the PREVIOUS
 * page's title for the new path. This is the same timing quirk every
 * real GA4-in-SPA integration guide flags, not a bug specific to this
 * app -- a short delay is the standard, documented mitigation.
 *
 * Renders nothing -- this is a side-effect-only component.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      import('../lib/firebase').then(({ trackPageView }) => {
        trackPageView(location.pathname, document.title);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
