/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `tabs` block. Base: tabs.
 * Source: https://wknd-trendsetters.site/ (section #3 — testimonials tabs).
 * Library convention: 2 columns, one row per tab — tab label in cell 1, tab content in cell 2.
 * blocks/tabs/tabs.js reads each authored row as [ tab label | panel content ]:
 * the first cell becomes the tab button, the row becomes the panel.
 *   Cell 1: tab label (name + role from the tab-menu button).
 *   Cell 2: panel content (image + name/role + quote from the matching tab-pane).
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  const wrapper = element.querySelector('.tabs-wrapper') || element;
  const panes = Array.from(wrapper.querySelectorAll('.tab-pane, [role="tabpanel"]'));
  const buttons = Array.from(wrapper.querySelectorAll('.tab-menu-link, [role="tab"]'));

  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = panes.map((pane, i) => {
    // --- Tab label (cell 1): name + role from the matching tab-menu button ---
    const labelCell = [];
    const button = buttons[i];
    if (button) {
      // Text wrapper sits next to the avatar image inside the button.
      const labelText = button.querySelector('div[style*="text-align"]');
      if (labelText) {
        Array.from(labelText.children).forEach((child) => labelCell.push(child));
      } else {
        // Fall back to the button's text, minus the avatar image.
        Array.from(button.querySelectorAll('img, picture')).forEach((img) => img.remove());
        labelCell.push(button);
      }
    }

    // --- Panel content (cell 2): image + text column (name/role + quote) ---
    const panelCell = [];
    const grid = pane.querySelector('.grid-layout') || pane;
    const cols = Array.from(grid.children).filter((c) => c.nodeType === 1);
    cols.forEach((col) => {
      const img = col.querySelector('img, picture');
      if (img && col.textContent.trim() === '') {
        // Image-only column — push the image itself.
        panelCell.push(img);
      } else {
        // Text column — push its content nodes.
        panelCell.push(col);
      }
    });
    if (!panelCell.length) panelCell.push(pane);

    return [labelCell.length ? labelCell : '', panelCell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
