import { getSalesInRange } from './db.js';
import { money } from './shared.js';

const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const exportCsvBtn = document.getElementById('exportCsv');
const printPdfBtn = document.getElementById('printPdf');
const reportSummary = document.getElementById('reportSummary');
const reportTable = document.getElementById('reportTable');
const printArea = document.getElementById('print-area');

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  fromDate.value = today;
  toDate.value = today;
}

function tableHTML(rows) {
  if (rows.length === 0) {
    return '<div class="text-center text-gray-500 py-8">No sales in selected range</div>';
  }

  return `
    <table class="min-w-full border-collapse border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="border border-gray-200 px-4 py-2 text-left font-semibold">ID</th>
          <th class="border border-gray-200 px-4 py-2 text-left font-semibold">Date</th>
          <th class="border border-gray-200 px-4 py-2 text-right font-semibold">Items</th>
          <th class="border border-gray-200 px-4 py-2 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr class="hover:bg-gray-50">
            <td class="border border-gray-200 px-4 py-2">${r.id}</td>
            <td class="border border-gray-200 px-4 py-2">${new Date(r.date).toLocaleString()}</td>
            <td class="border border-gray-200 px-4 py-2 text-right">${r.items.reduce((a, b) => a + b.qty, 0)}</td>
            <td class="border border-gray-200 px-4 py-2 text-right font-semibold">₹${money(r.total)}</td>
          </tr>
        `).join('')}
        <tr class="bg-gray-50 font-bold">
          <td colspan="3" class="border border-gray-200 px-4 py-2 text-right">Grand Total:</td>
          <td class="border border-gray-200 px-4 py-2 text-right">₹${money(rows.reduce((a, r) => a + r.total, 0))}</td>
        </tr>
      </tbody>
    </table>
  `;
}

async function loadReport() {
  const from = new Date(fromDate.value || '1970-01-01');
  const to = new Date(toDate.value || '2999-12-31');
  to.setHours(23, 59, 59, 999);

  const rows = await getSalesInRange(from.toISOString(), to.toISOString());
  const total = rows.reduce((a, r) => a + r.total, 0);

  reportSummary.textContent = `${rows.length} transactions, total ₹${money(total)}`;
  reportTable.innerHTML = tableHTML(rows);

  return rows;
}

exportCsvBtn.addEventListener('click', async () => {
  const rows = await loadReport();
  if (rows.length === 0) return;

  const header = ['ID', 'Date', 'Items', 'Total'];
  const lines = [header.join(',')];

  rows.forEach(r => {
    const items = r.items.reduce((a, b) => a + b.qty, 0);
    lines.push([r.id, r.date, items, money(r.total)].join(','));
  });

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-report-${fromDate.value}-to-${toDate.value}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

printPdfBtn.addEventListener('click', async () => {
  const rows = await loadReport();
  if (rows.length === 0) return;

  printArea.style.display = 'block';
  printArea.innerHTML = `
    <div>
      <h1 class="text-2xl font-bold mb-2">Sales Report</h1>
      <p class="text-sm mb-4">Period: ${fromDate.value} to ${toDate.value}</p>
      ${tableHTML(rows)}
    </div>
  `;
  window.print();
  setTimeout(() => { printArea.style.display = 'none'; }, 100);
});

// Auto-load on date change
fromDate.addEventListener('change', loadReport);
toDate.addEventListener('change', loadReport);

setDefaultDates();
loadReport();
