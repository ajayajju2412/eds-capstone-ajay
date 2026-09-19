/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `cards` block. Base: cards.
 * Source: https://wknd-trendsetters.site/ (section #2 — "Style in every snapshot": 8 image-only cards).
 *   Also used on /fashion-trends-young-adults-casual-sport (#trends).
 * Library convention: 2 columns, one row per card — image/icon in cell 1, text (title/description/CTA) in cell 2.
 * blocks/cards/cards.js renders each row as a card <li>; the image-only cell becomes the card
 * image and the other cell becomes the card body.
 * Source cards here are image-only, so cell 2 may be empty — kept to preserve the 2-column shape.
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  // Card items are the direct children of the card grid (exclude any tab-menu grid).
  const grid = element.querySelector('.grid-layout:not(.tab-menu)')
    || element.querySelector('[class*="grid-layout"]');

  let items = [];
  if (grid) {
    items = Array.from(grid.children).filter((c) => c.nodeType === 1);
  }

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = items.map((item) => {
    const img = item.querySelector('picture, img');

    // Text content (title / description / CTA) — present on card variants that carry copy.
    const textContent = [];
    const heading = item.querySelector('h2, h3, h4, h5, h6');
    if (heading) textContent.push(heading);
    item.querySelectorAll('p').forEach((p) => textContent.push(p));
    const cta = item.querySelector('a.button, a.text-link, .button-group a');
    if (cta) textContent.push(cta);

    // Cell 1: image. Cell 2: text (empty string when the card is image-only).
    return [img || '', textContent.length ? textContent : ''];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
