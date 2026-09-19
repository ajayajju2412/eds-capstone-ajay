export default function decorate(block) {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  [...block.children].forEach((row) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement('td');
      td.append(...cell.childNodes);
      tr.append(td);
    });
    tbody.append(tr);
  });

  table.append(tbody);
  block.replaceChildren(table);
}
