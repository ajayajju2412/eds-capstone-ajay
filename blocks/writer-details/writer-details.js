import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * writer-details block
 *
 * Authored content is a single row of plain cells. The first cell is an
 * optional avatar/photo; the remaining cells are text:
 *   [ photo? | name | date | read time | ... ]
 * Any cell may be omitted by the author:
 *   - Empty/absent photo cell  -> no avatar rendered
 *   - Omitted date/read time   -> those meta items simply don't appear
 *
 * Renders an article byline:
 *   [avatar]  By {name}
 *             {date} • {read time} • ...
 */
export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const allCells = [...row.children];

  // The first cell is the (optional) avatar slot — treat it as an avatar
  // only when it actually contains an image. Otherwise it's text content.
  const firstCell = allCells[0];
  const img = firstCell ? firstCell.querySelector('img') : null;
  const textCells = img ? allCells.slice(1) : allCells;

  const cells = textCells
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);

  const [name, ...meta] = cells;

  block.replaceChildren();

  // Optional avatar
  if (img) {
    const avatar = document.createElement('div');
    avatar.className = 'writer-details-avatar';
    avatar.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }]));
    block.append(avatar);
  }

  // Text column (byline + meta) stacks next to the avatar
  const text = document.createElement('div');
  text.className = 'writer-details-text';

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
    text.append(byline);
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

    text.append(metaEl);
  }

  block.append(text);
}
