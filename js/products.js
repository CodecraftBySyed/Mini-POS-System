import { addProduct, getProducts, deleteProduct } from './db.js';
import { money, showToast } from './shared.js';

const productForm = document.getElementById('productForm');
const pName = document.getElementById('pName');
const pPrice = document.getElementById('pPrice');
const productList = document.getElementById('productList');
const emptyState = document.getElementById('emptyState');

async function renderProducts() {
  const products = await getProducts();
  
  if (products.length === 0) {
    productList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  productList.innerHTML = products.map(p => `
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-900">${p.name}</h3>
        <button data-id="${p.id}" class="del-btn text-red-600 hover:text-red-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
  <div class="text-2xl font-bold text-indigo-600">₹${money(p.price)}</div>
    </div>
  `).join('');

  // Attach delete handlers
  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Delete this product?')) {
        await deleteProduct(btn.dataset.id);
        showToast('Product deleted');
        renderProducts();
      }
    });
  });
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addProduct(pName.value.trim(), pPrice.value);
  showToast('Product added successfully');
  pName.value = '';
  pPrice.value = '';
  renderProducts();
});

renderProducts();
