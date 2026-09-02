// The heading-id slug algorithm, extracted from check-anchor-links.mjs so
// it can be unit-tested in isolation. MUST stay byte-identical to
// TableOfContents.tsx's scanHeadings() -- that's the real runtime
// algorithm; this is a reimplementation used to validate links at build
// time, and drift between the two silently reintroduces exactly the
// double-hyphen-anchor class of bug this script exists to catch.

/** Identical to TableOfContents.tsx's scanHeadings() id algorithm. */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** Best-effort markdown-heading-line -> rendered-plain-text reconstruction:
 * strips markdown links/emphasis/code/inline-math delimiters down to their
 * inner text, matching what a reader (and KaTeX, approximately, for plain
 * inline math) actually sees rendered. Returns whether the heading
 * contained inline math, since that case is only approximate -- KaTeX's
 * real rendered textContent for `$...$` doesn't perfectly match its LaTeX
 * source. */
export function headingPlainText(raw) {
  let hasInlineMath = false;
  const text = raw
    .replace(/\$([^$]*)\$/g, (_, inner) => {
      hasInlineMath = true;
      return inner;
    })
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
    .replace(/`([^`]*)`/g, '$1') // `code` -> code
    .replace(/\*\*([^*]*)\*\*/g, '$1') // **bold** -> bold
    .replace(/\*([^*]*)\*/g, '$1') // *italic* -> italic
    .replace(/(?<![\w])_([^_]+)_(?![\w])/g, '$1'); // _italic_ -> italic
  return { text, hasInlineMath };
}
