export default function decorate(block) {
  const rows = [...block.children];
  const table = document.createElement('table');

  const [headerRow, ...dataRows] = rows;
  if (headerRow) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    [...headerRow.children].forEach((cell) => {
      const th = document.createElement('th');
      th.append(...cell.childNodes);
      tr.append(th);
    });
    thead.append(tr);
    table.append(thead);
  }

  const tbody = document.createElement('tbody');
  dataRows.forEach((row) => {
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
