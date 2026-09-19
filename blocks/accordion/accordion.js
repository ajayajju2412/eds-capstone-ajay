/*
 * Accordion Block
 * Collapsible Q&A. Each authored row is [ question | answer ];
 * rendered as a native <details>/<summary> so it works without JS too.
 * Structure adapted from the AEM Block Collection accordion.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // Accordion item label (question) — first cell
    const label = row.children[0];
    if (!label) return;
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    // Accordion item body (answer) — second cell
    const body = row.children[1];
    if (body) {
      body.className = 'accordion-item-body';
    }

    // Accordion item wrapper
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary);
    if (body) details.append(body);
    row.replaceWith(details);
  });
}
