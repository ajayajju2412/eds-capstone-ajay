import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'social-links-list';

  [...block.children].forEach((row) => {
    const [nameCol, linkCol] = row.children;
    const name = nameCol?.textContent.trim();
    const link = linkCol?.querySelector('a');
    if (!name || !link) return;

    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const icon = document.createElement('span');
    icon.className = `icon icon-${key}`;

    const label = document.createElement('span');
    label.className = 'social-links-label';
    label.textContent = name;

    const a = document.createElement('a');
    a.href = link.href;
    a.title = name;
    a.append(icon, label);

    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });

  block.replaceChildren(ul);
  decorateIcons(block);
}
