/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `article-list` block. Base: article-list.
 * Sources:
 *   - https://wknd-trendsetters.site/ (section #4 — "Latest articles" grid)
 *   - https://wknd-trendsetters.site/blog (#articles)
 * This block is data-driven: blocks/article-list/article-list.js empties its own content and
 * fetches /query-index.json at runtime, rendering cards for entries whose path starts with
 * `path-prefix`. Authored article cards in the source are therefore NOT copied — instead we
 * emit the block name plus a config key/value row per readBlockConfig() option.
 *   Config (2-column key/value rows): path-prefix, limit.
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  // Derive the article path prefix from the first article link, defaulting to /blog/.
  let pathPrefix = '/blog/';
  const firstLink = element.querySelector('a[href*="/blog/"], a.article-card, .article-card a');
  if (firstLink) {
    try {
      const url = new URL(firstLink.getAttribute('href'), 'https://wknd-trendsetters.site');
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 1) pathPrefix = `/${segments[0]}/`;
    } catch (e) {
      /* keep default */
    }
  }

  // Config rows drive the block's runtime query (readBlockConfig).
  const cells = [
    ['path-prefix', pathPrefix],
    ['limit', '12'],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
