import { getProducts, addSale } from './db.js';
import { money, showToast } from './shared.js';

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const itemCountEl = document.getElementById('itemCount');
const subtotalEl = document.getElementById('subtotal');
const discountAmountEl = document.getElementById('discountAmount');
const grandTotalEl = document.getElementById('grandTotal');
const discountValueEl = document.getElementById('discountValue');
const discountTypeEl = document.getElementById('discountType');
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

function calculateDiscount(subtotal) {
  const value = parseFloat(discountValueEl.value) || 0;
  const type = discountTypeEl.value;
  
  if (type === 'percent') {
    return (subtotal * (value / 100));
  }
  return value;
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="text-center text-gray-500 py-4">Cart is empty</div>';
    itemCountEl.textContent = '0';
    subtotalEl.textContent = '₹0.00';
    discountAmountEl.textContent = '-₹0.00';
    grandTotalEl.textContent = '₹0.00';
    return;
  }

  let itemCount = 0;
  let subtotal = 0;

  cartItems.innerHTML = cart.map((c, idx) => {
    itemCount += c.qty;
    subtotal += c.qty * c.price;
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

  const discount = calculateDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  itemCountEl.textContent = itemCount;
  subtotalEl.textContent = `₹${money(subtotal)}`;
  discountAmountEl.textContent = `-₹${money(discount)}`;
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

function generateThermalReceipt() {
  const date = new Date().toLocaleString();
  const subtotal = Number(subtotalEl.textContent.slice(1));
  const discount = Number(discountAmountEl.textContent.slice(2));
  const total = Number(grandTotalEl.textContent.slice(1));
  
  // Receipt is 32 characters wide for thermal printer
  let receipt = [
    'Mini POS - Codecraft by Syed',
    '--------------------------------',
    `Date: ${date}`,
    '--------------------------------',
    'Items:',
    ...cart.map(item => [
      item.name,
      `${item.qty} x ₹${money(item.price)}    ₹${money(item.qty * item.price)}`
    ]).flat(),
    '--------------------------------',
    `Subtotal:          ₹${money(subtotal)}`,
    `Discount:         -₹${money(discount)}`,
    '--------------------------------',
    `Total:             ₹${money(total)}`,
    '--------------------------------',
    '',
    '       Thank You!',
    '    Please Visit Again',
    ''
  ].join('\\n');

  return receipt;
}

function printReceipt(receipt) {
  const printWindow = window.open('', '', 'width=300,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm; /* Thermal receipt width */
            margin: 0;
            padding: 10px;
          }
          pre {
            white-space: pre-wrap;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <pre>${receipt}</pre>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Add discount input listeners
[discountValueEl, discountTypeEl].forEach(el => {
  el.addEventListener('input', renderCart);
});

async function processSale(withPrint = false) {
  if (cart.length === 0) {
    showToast('Cart is empty', 'error');
    return;
  }

  const subtotal = Number(subtotalEl.textContent.slice(1));
  const discount = Number(discountAmountEl.textContent.slice(2));
  const total = Number(grandTotalEl.textContent.slice(1));

  const sale = {
    date: new Date().toISOString(),
    items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    subtotal,
    discount,
    total
  };

  await addSale(sale);
  
  if (withPrint) {
    // Generate and print thermal receipt
    const receipt = generateThermalReceipt();
    printReceipt(receipt);
  }
  
  cart = [];
  renderCart();
  showToast('Sale completed successfully!', 'success');
}

// Quick checkout without printing
checkoutBtn.addEventListener('click', () => processSale(false));

// Checkout with bill printing
document.getElementById('printBillBtn').addEventListener('click', () => processSale(true));

renderProducts();
renderCart();
