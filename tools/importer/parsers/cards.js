/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `cards` block. Base: cards.
 * Sources:
 *   - https://wknd-trendsetters.site/ (#2 "Style in every snapshot": image-only cards)
 *   - /fashion-trends-young-adults-casual-sport (#trends: image + tag + title + desc cards,
 *     each card is an <a class="trend-card card-link">).
 * Library convention: 2 columns, one row per card — image in cell 1, text (title/description) in cell 2.
 * blocks/cards/cards.js renders each row as a card <li>.
 * Generated: 2026-09-19; hardened 2026-09-19 to select card items robustly and scope text per-card.
 */
export default function parse(element, { document }) {
  // Prefer explicit card items (the source wraps each card in an <a>/<div> with a *-card class).
  // Fall back to the direct children of the card grid.
  let items = Array.from(
    element.querySelectorAll('a.trend-card, a.card-link, [class*="trend-card"]:not([class*="-image"]):not([class*="-body"]), .article-card'),
  ).filter((el) => el.matches('a, article, li') || /card/.test(el.className));

  if (!items.length) {
    const grid = element.querySelector('.grid-layout:not(.tab-menu)')
      || element.querySelector('[class*="grid-layout"]:not(.tab-menu)')
      || element.querySelector('[class*="grid-layout"]');
    if (grid) {
      items = Array.from(grid.children).filter((c) => c.nodeType === 1);
    }
  }

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = items.map((item) => {
    // Cell 1: the card image (scoped to THIS card only).
    const img = item.querySelector('picture, img');

    // Cell 2: text content scoped to THIS card — category tag, title, description(s), CTA.
    const textContent = [];
    const tag = item.querySelector('.tag, [class*="tag"]');
    if (tag && tag.textContent.trim()) textContent.push(tag);
    const heading = item.querySelector('h2, h3, h4, h5, h6');
    if (heading) textContent.push(heading);
    item.querySelectorAll(':scope p, :scope [class*="body"] p, :scope [class*="desc"]').forEach((p) => {
      if (p.textContent.trim()) textContent.push(p);
    });
    const cta = item.querySelector('a.button, a.text-link, .button-group a');
    if (cta) textContent.push(cta);

    return [img || '', textContent.length ? textContent : ''];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
