import { getProducts, addSale } from './db.js';
import { money, showToast } from './shared.js';

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const itemCountEl = document.getElementById('itemCount');
const grandTotalEl = document.getElementById('grandTotal');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = [];

async function renderProducts() {
  const products = await getProducts();
  
  if (products.length === 0) {
    productGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No products available</div>';
    return;
  }

  productGrid.innerHTML = products.map(p => `
    <button data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" class="add-product border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
  <div class="font-semibold text-gray-900 mb-1">${p.name}</div>
  <div class="text-lg font-bold text-indigo-600">₹${money(p.price)}</div>
    </button>
  `).join('');

  document.querySelectorAll('.add-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = {
        id: Number(btn.dataset.id),
        name: btn.dataset.name,
        price: Number(btn.dataset.price)
      };
      addToCart(prod);
    });
  });
}

function addToCart(prod) {
  const found = cart.find(c => c.id === prod.id);
  if (found) found.qty += 1;
  else cart.push({ ...prod, qty: 1 });
  renderCart();
  showToast(`${prod.name} added to cart`, 'success');
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="text-center text-gray-500 py-4">Cart is empty</div>';
    itemCountEl.textContent = '0';
    grandTotalEl.textContent = '₹0.00';
    return;
  }

  let itemCount = 0;
  let total = 0;

  cartItems.innerHTML = cart.map((c, idx) => {
    itemCount += c.qty;
    total += c.qty * c.price;
    return `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="font-medium text-gray-900">${c.name}</div>
          <div class="text-sm text-gray-600">₹${money(c.price)} × ${c.qty}</div>
        </div>
        <div class="flex items-center gap-2">
          <button data-idx="${idx}" class="dec-btn w-8 h-8 rounded border border-gray-300 hover:bg-gray-100">−</button>
          <button data-idx="${idx}" class="inc-btn w-8 h-8 rounded border border-gray-300 hover:bg-gray-100">+</button>
          <button data-idx="${idx}" class="rem-btn w-8 h-8 rounded border border-red-300 text-red-600 hover:bg-red-50">×</button>
        </div>
      </div>
    `;
  }).join('');

  itemCountEl.textContent = itemCount;
  grandTotalEl.textContent = `₹${money(total)}`;

  // Attach handlers
  document.querySelectorAll('.dec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      renderCart();
    });
  });

  document.querySelectorAll('.inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      cart[idx].qty += 1;
      renderCart();
    });
  });

  document.querySelectorAll('.rem-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      cart.splice(idx, 1);
      renderCart();
    });
  });
}

clearCartBtn.addEventListener('click', () => {
  if (cart.length > 0 && confirm('Clear cart?')) {
    cart = [];
    renderCart();
    showToast('Cart cleared');
  }
});

checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) {
    showToast('Cart is empty', 'error');
    return;
  }

  const sale = {
    date: new Date().toISOString(),
    items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    subtotal: Number(grandTotalEl.textContent.slice(1)),
    tax: 0,
    total: Number(grandTotalEl.textContent.slice(1))
  };

  await addSale(sale);
  cart = [];
  renderCart();
  showToast('Sale completed successfully!', 'success');
});

renderProducts();
renderCart();
