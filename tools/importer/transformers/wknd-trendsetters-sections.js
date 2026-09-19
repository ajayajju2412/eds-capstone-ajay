/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters section breaks + section-metadata.
 *
 * Template-agnostic: reads section boundaries and style values from
 * payload.template.sections (populated in tools/importer/page-templates.json by
 * classification). For each non-first section it inserts an <hr> break; for each
 * section with a non-null `style` it emits a Section Metadata block
 * (secondary | accent | dark).
 *
 * All section.selector values are DOM-verified against migration-work/cleaned.html
 * and the per-template snapshots (e.g. "#main-content > header.section.secondary-section",
 * "#main-content > section.section.accent-section", "#articles", "#trends").
 *
 * Uses BOTH hooks: block parsers run between beforeTransform and afterTransform and
 * replace section elements, so breaks are inserted in beforeTransform (while every
 * section element still exists) with a temporary marker attribute, and metadata is
 * inserted in afterTransform anchored to that surviving marker.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
