import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

/**
 * MDX compiles plain markdown links ([text](/docs/...)) to a bare <a>
 * element -- left alone, every internal doc-to-doc link (the vast majority
 * of links in migrated content) would do a full page reload instead of
 * client-side navigation, and worse, wouldn't get react-router's
 * `basename` prefix applied -- would 404 if that basename is ever a real
 * subpath again (it's "/" today, serving from the custom domain's own
 * root). Registered as MDXProvider's
 * `a` override in App.tsx so this applies to every .mdx page automatically.
 * External/absolute links (http, https, mailto, #anchors) stay plain
 * anchors -- only same-origin app routes go through react-router's <Link>.
 */
export default function MDXLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href && href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
