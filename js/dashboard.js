import { getProducts, getAllSales } from './db.js';
import { money } from './shared.js';

async function loadDashboard() {
  const products = await getProducts();
  const sales = await getAllSales();

  // Today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(s => new Date(s.date) >= today);
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);

  // Total sales
  const totalSales = sales.reduce((a, s) => a + s.total, 0);

  // Update stats
  document.getElementById('todaySales').textContent = `₹${money(todayTotal)}`;
  document.getElementById('totalSales').textContent = `₹${money(totalSales)}`;
  document.getElementById('totalTransactions').textContent = sales.length;
  document.getElementById('totalProducts').textContent = products.length;

  // Recent transactions (last 5)
  const recent = sales.slice(-5).reverse();
  const container = document.getElementById('recentTransactions');
  
  if (recent.length === 0) {
    container.innerHTML = '<div class="p-6 text-center text-gray-500">No transactions yet</div>';
  } else {
    container.innerHTML = recent.map(s => `
      <div class="p-4 hover:bg-gray-50">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">Sale #${s.id}</div>
            <div class="text-sm text-gray-500">${new Date(s.date).toLocaleString()}</div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-gray-900">₹${money(s.total)}</div>
            <div class="text-sm text-gray-500">${s.items.reduce((a, i) => a + i.qty, 0)} items</div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

loadDashboard();
