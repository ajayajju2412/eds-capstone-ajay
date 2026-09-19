/* eslint-disable */
/* global WebImporter */
/**
 * Parser for `accordion` block. Base: accordion.
 * Sources:
 *   - https://wknd-trendsetters.site/faq (FAQ list — details.faq-item: summary question + div.faq-answer)
 *   - https://wknd-trendsetters.site/ (section #5 — same FAQ pattern)
 * blocks/accordion/accordion.js reads each authored row as [ question | answer ]:
 * cell 1 becomes the <summary> label, cell 2 becomes the <details> body.
 * Library convention: 2 columns, one row per Q&A — title cell + content cell.
 * Generated: 2026-09-19
 */
export default function parse(element, { document }) {
  // Each Q&A is a <details> item (native), or a [role=group] on the decorated site.
  let items = Array.from(element.querySelectorAll('details.faq-item, details'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('[role="group"]'));
  }

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = items.map((item) => {
    // --- Question (cell 1) ---
    // Prefer the summary's text span; strip the toggle icon (svg).
    const summary = item.querySelector('summary, .faq-question');
    let question = '';
    if (summary) {
      const span = summary.querySelector('span');
      question = span || summary.textContent.trim();
    }

    // --- Answer (cell 2) ---
    const answer = item.querySelector('.faq-answer, details > div:last-child');
    let answerCell = '';
    if (answer && answer !== summary) {
      // Push the answer's inner paragraphs for clean markup; fall back to the wrapper.
      const paras = Array.from(answer.querySelectorAll('p'));
      answerCell = paras.length ? paras : answer;
    }

    return [question, answerCell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
