/**
 * writer-details block
 *
 * Authored content is a single row of plain cells:
 *   [ author name | date | read time ]
 * (some cells may be omitted by the author).
 *
 * Renders an article byline:
 *   Line 1:  By {name}
 *   Line 2:  {date} • {read time}
 */
export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cells = [...row.children]
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);

  const [name, ...meta] = cells;

  block.replaceChildren();

  if (name) {
    const byline = document.createElement('p');
    byline.className = 'writer-details-byline';

    const label = document.createElement('span');
    label.className = 'writer-details-label';
    label.textContent = 'By';

    const nameEl = document.createElement('span');
    nameEl.className = 'writer-details-name';
    nameEl.textContent = name;

    byline.append(label, nameEl);
    block.append(byline);
  }

  if (meta.length) {
    const metaEl = document.createElement('p');
    metaEl.className = 'writer-details-meta';

    meta.forEach((value, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'writer-details-separator';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '•';
        metaEl.append(sep);
      }
      const item = document.createElement('span');
      item.textContent = value;
      metaEl.append(item);
    });

    block.append(metaEl);
  }
}
