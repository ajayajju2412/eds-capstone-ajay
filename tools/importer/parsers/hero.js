/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `hero` block. Base: hero.
 * Sources:
 *   - https://wknd-trendsetters.site/ (header.secondary-section: heading + subheading + 2 CTAs + images)
 *   - https://wknd-trendsetters.site/ (section.inverse-section CTA banner: overlay image + heading + subheading + 1 CTA)
 * Library convention: 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (optional).
 *   Row 3: title (heading) + subheading + call-to-action (optional).
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  // Heading — h1 for standard hero, h2 for the inverse CTA banner variant
  const heading = element.querySelector('h1, h2, [class*="h1-heading"], [class*="h2-heading"]');

  // Subheading / intro paragraph
  const subheading = element.querySelector('p.subheading, .card-body p, p');

  // CTA links
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Background image. Prefer a single overlay/background image (banner variant);
  // fall back to the first cover image for the standard hero.
  let bgImage = element.querySelector('img.utility-overlay, img[class*="overlay"]');
  if (!bgImage) bgImage = element.querySelector('img.cover-image, img');

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 — background image (optional)
  cells.push([bgImage || '']);

  // Row 3 — title + subheading + CTAs
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  ctaLinks.forEach((a) => contentCell.push(a));
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
