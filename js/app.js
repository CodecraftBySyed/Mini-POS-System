// app.js
import { addProduct, getProducts, deleteProduct, addSale, getSalesInRange } from './db.js';

const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');
const pName = document.getElementById('pName');
const pPrice = document.getElementById('pPrice');

const cartList = document.getElementById('cartList');
const itemCountEl = document.getElementById('itemCount');
const grandTotalEl = document.getElementById('grandTotal');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');

const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const exportCsvBtn = document.getElementById('exportCsv');
const printPdfBtn = document.getElementById('printPdf');
const reportSummary = document.getElementById('reportSummary');
const reportTable = document.getElementById('reportTable');
const printArea = document.getElementById('print-area');

let cart = [];

function money(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}

async function renderProducts() {
  const products = await getProducts();
  productList.innerHTML = '';
  products.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    li.innerHTML = `
      <div>
        <div class="font-medium">${p.name}</div>
        <div class="text-sm text-gray-500">₹${money(p.price)}</div>
      </div>
      <div class="flex gap-2">
        <button data-id="${p.id}" class="add px-2 py-1 rounded border">Add</button>
        <button data-id="${p.id}" class="del px-2 py-1 rounded border text-red-600">Delete</button>
      </div>
    `;
    li.querySelector('.add').addEventListener('click', () => addToCart(p));
    li.querySelector('.del').addEventListener('click', async () => {
      await deleteProduct(p.id);
      renderProducts();
    });
    productList.appendChild(li);
  });
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addProduct(pName.value.trim(), pPrice.value);
  pName.value = '';
  pPrice.value = '';
  renderProducts();
});

function addToCart(prod) {
  const found = cart.find((c) => c.id === prod.id);
  if (found) found.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  renderCart();
}

function renderCart() {
  cartList.innerHTML = '';
  let itemCount = 0;
  let total = 0;
  cart.forEach((c, idx) => {
    itemCount += c.qty;
    total += c.qty * c.price;
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    li.innerHTML = `
      <div>
        <div class="font-medium">${c.name}</div>
        <div class="text-sm text-gray-500">₹${money(c.price)} × ${c.qty}</div>
      </div>
      <div class="flex gap-2">
        <button class="dec px-2 py-1 rounded border">-</button>
        <button class="inc px-2 py-1 rounded border">+</button>
        <button class="rem px-2 py-1 rounded border text-red-600">Remove</button>
      </div>
    `;
    li.querySelector('.dec').addEventListener('click', () => { c.qty = Math.max(1, c.qty - 1); renderCart(); });
    li.querySelector('.inc').addEventListener('click', () => { c.qty += 1; renderCart(); });
    li.querySelector('.rem').addEventListener('click', () => { cart.splice(idx, 1); renderCart(); });
    cartList.appendChild(li);
  });
  itemCountEl.textContent = itemCount;
  // display with currency symbol but keep numeric value parseable elsewhere
  grandTotalEl.textContent = `₹${money(total)}`;
}

clearCartBtn.addEventListener('click', () => { cart = []; renderCart(); });

checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return;
  const now = new Date();
  const parseCurrency = (s) => parseFloat(String(s).replace(/[^0-9.-]+/g, '')) || 0;
  const sale = {
    date: now.toISOString(),
    items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    subtotal: parseCurrency(grandTotalEl.textContent),
    tax: 0,
    total: parseCurrency(grandTotalEl.textContent)
  };
  await addSale(sale);
  cart = [];
  renderCart();
  updateReportSummary();
  alert('Sale saved');
});

// Reports
function setDefaultDates() {
  const today = new Date();
  const iso = today.toISOString().slice(0,10);
  fromDate.value = iso;
  toDate.value = iso;
}

function tableHTML(rows) {
  return `
    <table class="min-w-full text-sm border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="border px-2 py-1 text-left">ID</th>
          <th class="border px-2 py-1 text-left">Date</th>
          <th class="border px-2 py-1 text-right">Items</th>
          <th class="border px-2 py-1 text-right">Subtotal</th>
          <th class="border px-2 py-1 text-right">Tax</th>
          <th class="border px-2 py-1 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td class="border px-2 py-1">${r.id ?? ''}</td>
            <td class="border px-2 py-1">${new Date(r.date).toLocaleString()}</td>
            <td class="border px-2 py-1 text-right">${r.items.reduce((a,b)=>a+b.qty,0)}</td>
                      <td class="border px-2 py-1 text-right">₹${money(r.subtotal)}</td>
                      <td class="border px-2 py-1 text-right">₹${money(r.tax)}</td>
                      <td class="border px-2 py-1 text-right">₹${money(r.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadReportTable() {
  const from = new Date(fromDate.value || '1970-01-01');
  const to = new Date(toDate.value || '2999-12-31');
  to.setHours(23,59,59,999);
  const rows = await getSalesInRange(from.toISOString(), to.toISOString());
  reportTable.innerHTML = tableHTML(rows);
  return rows;
}

async function updateReportSummary() {
  const rows = await loadReportTable();
  const total = rows.reduce((a,r)=>a + r.total, 0);
  reportSummary.textContent = `${rows.length} sales, total ₹${money(total)}`;
}

// CSV
exportCsvBtn.addEventListener('click', async () => {
  const rows = await loadReportTable();
  const header = ['ID','Date','Items','Subtotal','Tax','Total'];
  const lines = [header.join(',')];
  rows.forEach(r => {
    const items = r.items.reduce((a,b)=>a+b.qty,0);
    lines.push([r.id, r.date, items, money(r.subtotal), money(r.tax), money(r.total)].join(','));
  });
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pos-report-${fromDate.value || 'all'}-to-${toDate.value || 'all'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Print PDF
printPdfBtn.addEventListener('click', async () => {
  const rows = await loadReportTable();
  const total = rows.reduce((a,r)=>a + r.total, 0);
  printArea.style.display = 'block';
  printArea.innerHTML = `
    <div>
      <h1 class="text-xl font-semibold mb-1">Sales Report</h1>
      <div class="text-sm mb-2">Range: ${fromDate.value || 'All'} to ${toDate.value || 'All'}</div>
      ${tableHTML(rows)}
  <div class="mt-2 text-right font-medium">Grand Total: ₹${money(total)}</div>
    </div>
  `;
  window.print();
  setTimeout(() => { printArea.style.display = 'none'; }, 100);
});

(async function init() {
  setDefaultDates();
  await renderProducts();
  renderCart();
  updateReportSummary();
})();
