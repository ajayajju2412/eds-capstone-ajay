/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `columns` block. Base: columns.
 * Source: https://wknd-trendsetters.site/ (section #1 — image column + text column: breadcrumbs, heading, byline/meta).
 * Library convention: multiple columns, first row = block name, second row = one cell per column.
 * blocks/columns/columns.js treats each row's direct children as columns (side-by-side cells);
 * a cell whose only content is a picture becomes an image column.
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  // The columns are the direct children of the inner grid-layout row.
  const grid = element.querySelector('.grid-layout') || element.querySelector(':scope > div > div') || element;
  const columns = Array.from(grid.children).filter((c) => c.nodeType === 1);

  if (columns.length < 2) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Second row: one cell per source column (preserve nested image/heading/link markup).
  const cells = [columns];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
