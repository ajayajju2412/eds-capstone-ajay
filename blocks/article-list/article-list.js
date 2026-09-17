import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';

function renderMeta(entry) {
  const meta = document.createElement('p');
  meta.className = 'article-list-meta';

  if (entry.category) {
    const category = document.createElement('span');
    category.className = 'article-list-category';
    category.textContent = entry.category;
    meta.append(category);
  }

  if (entry.lastModified) {
    const date = document.createElement('span');
    date.className = 'article-list-date';
    date.textContent = new Date(entry.lastModified).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    meta.append(date);
  }

  return meta;
}

function renderCard(entry) {
  const li = document.createElement('li');

  if (entry.image) {
    li.append(createOptimizedPicture(entry.image, entry.title, false, [{ width: '750' }]));
  }

  if (entry.category || entry.lastModified) li.append(renderMeta(entry));

  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = entry.title;
  title.append(link);
  li.append(title);

  if (entry.description) {
    const description = document.createElement('p');
    description.textContent = entry.description;
    li.append(description);
  }

  return li;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  const pathPrefix = cfg['path-prefix'] || '/magazine/';
  const pageSize = parseInt(cfg.limit, 10) || 12;

  block.textContent = '';

  const ul = document.createElement('ul');
  ul.className = 'article-list-list';
  block.append(ul);

  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'article-list-load-more';
  loadMoreButton.textContent = 'Load more';
  block.append(loadMoreButton);

  let offset = 0;

  async function loadPage() {
    const resp = await fetch(`/query-index.json?limit=${pageSize}&offset=${offset}`);
    const json = await resp.json();
    json.data
      .filter((entry) => entry.path.startsWith(pathPrefix))
      .forEach((entry) => ul.append(renderCard(entry)));
    offset += json.data.length;
    if (offset >= json.total || json.data.length === 0) {
      loadMoreButton.remove();
    }
  }

  loadMoreButton.addEventListener('click', loadPage);
  await loadPage();
}
