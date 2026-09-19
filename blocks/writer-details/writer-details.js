import { createOptimizedPicture } from '../../scripts/aem.js';

function splitNameAndMeta(cell) {
  const paragraphs = [...cell.children].filter((el) => el.tagName === 'P');
  if (paragraphs.length >= 2) {
    const name = paragraphs[0].textContent.trim();
    const meta = paragraphs.slice(1).map((p) => p.textContent.trim()).join(' ');
    return [name, meta];
  }
  const [firstLine, ...restLines] = cell.innerHTML.split(/<br\s*\/?>/i);
  if (restLines.length > 0) {
    const tmp = document.createElement('div');
    tmp.innerHTML = firstLine;
    const name = tmp.textContent.trim();
    tmp.innerHTML = restLines.join(' ');
    const meta = tmp.textContent.trim();
    return [name, meta];
  }
  return [cell.textContent.trim(), ''];
}

export default function decorate(block) {
  const row = block.children[0];
  const [photoCol, prefixCol, nameCol] = row.children;

  const img = photoCol.querySelector('img');
  const avatar = document.createElement('div');
  avatar.className = 'writer-details-avatar';
  if (img) avatar.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }]));

  const prefix = prefixCol.textContent.trim();
  const [name, meta] = splitNameAndMeta(nameCol);

  const text = document.createElement('div');
  text.className = 'writer-details-text';

  const byline = document.createElement('p');
  byline.className = 'writer-details-byline';
  byline.append(`${prefix} `);
  const nameSpan = document.createElement('span');
  nameSpan.className = 'writer-details-name';
  nameSpan.textContent = name;
  byline.append(nameSpan);

  text.append(byline);

  if (meta) {
    const metaEl = document.createElement('p');
    metaEl.className = 'writer-details-meta';
    metaEl.textContent = meta;
    text.append(metaEl);
  }

  block.replaceChildren(avatar, text);
}
