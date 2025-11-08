const DB_NAME = 'pos-db';
const DB_VER = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sales')) {
        const store = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out?.result ?? out);
    t.onerror = () => reject(t.error);
  });
}

// Products
export async function addProduct(name, price) {
  return tx('products', 'readwrite', (s) => s.add({ name, price: Number(price) }));
}

export async function getProducts() {
  return tx('products', 'readonly', (s) => {
    return new Promise((resolve) => {
      const items = [];
      s.openCursor().onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { items.push(cur.value); cur.continue(); }
        else resolve(items);
      };
    });
  });
}

export async function deleteProduct(id) {
  return tx('products', 'readwrite', (s) => s.delete(Number(id)));
}

// Sales
export async function addSale(sale) {
  return tx('sales', 'readwrite', (s) => s.add(sale));
}

export async function getSalesInRange(fromISO, toISO) {
  return tx('sales', 'readonly', (s) => {
    const idx = s.index('date');
    const range = IDBKeyRange.bound(fromISO, toISO);
    return new Promise((resolve) => {
      const rows = [];
      idx.openCursor(range).onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { rows.push(cur.value); cur.continue(); }
        else resolve(rows);
      };
    });
  });
}

export async function getAllSales() {
  return tx('sales', 'readonly', (s) => {
    return new Promise((resolve) => {
      const items = [];
      s.openCursor().onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { items.push(cur.value); cur.continue(); }
        else resolve(items);
      };
    });
  });
}
