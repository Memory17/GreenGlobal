
//dữ liệu cho sản phẩm trong kho 
const sampleProducts = [
  {
    id: 1,
    title: "Áo GuCi",
    price: 10000,
    discountedPrice: 1000000,
    quantity: 2,
    total: 100000,
    thumbnail: "http://khosiquanaogiare.com/wp-content/uploads/2020/05/croptop-gucci-3.jpg",
    rating: 4.5,
    stock: 120,
    brand: "LM",
    category: "Clothing",
    discountPercentage: 20,
  },
  {
    id: 2,
    title: "Túi Xách",
    price: 100000,
    discountedPrice: 1000000,
    quantity: 1,
    total: 10000000,
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWb6XbCxJaBA0wbnqk745vswBBzFtlpV2zNg&s",
    rating: 4.2,
    stock: 60,
    brand: "LM",
    category: "Clothing",
  },
  {
    id: 3,
    title: "Giày Sneakers",
    price: 20000,
    discountedPrice: 200000,
    quantity: 1,
    total: 200000000,
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4XAywk2d8qwBxbcgrrMThMhPji_dKmUe9MfU7lfNXkk-WeDzvA1MOGJH94HdbCs_pmHiXDw&s",
    rating: 4.8,
    stock: 40,
    brand: "LM",
    category: "Footwear",
    discountPercentage: 15,
  },
  {
id: 4,
    title: "Áo Khoác",
    price: 4000,
    discountedPrice: 200000,
    quantity: 1,
    total: 200000000,
    thumbnail: "https://evara.vn/uploads/plugin/product_items/385/1.jpg",
    rating: 4.8,
    stock: 40,
    brand: "LM",
    category: "Footwear",
    discountPercentage: 25,
  },
];

const sampleUsers = [
  {
    id: 1,
    firstName: "Doãn",
    lastName: "Min",
    email: "doanmin@example.com",
    phone: "+123456789",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7L63LSnvMMN6ur5jUpr38Srprrjte4HD0fDsDas4jflqQHO-T3QPmK3EvaJeGJhIN0mXa&s",
    address: { address: "186 Nguyễn Hữu Thọ", city: "Đà Nẵng" },
  },
  {
    id: 2,
    firstName: "Doãn",
    lastName: "Lực",
    email: "doanluc@example.com",
    phone: "+987654321",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD5yEsOiigN-DG_MUtXFVzGpvIr0edKTGCcxIT1jDoXXyoL1huBDFJhzzSCrdpct_SqCvdAQ&s",
    address: { address: "186 Nguyễn Hữu Thọ", city: "Đà Nẵng" },
  },
];

const sampleComments = [
  { id: 1, body: "Sản phẩm tuyệt vời" },
  { id: 2, body: "Giao hàng nhanh chóng" },
  { id: 3, body: "Sẽ mua lại lần nữa" },
];

export function getInventory() {
  return Promise.resolve({ products: sampleProducts, total: sampleProducts.length });
}

export function getOrders() {
  return Promise.resolve({ products: sampleProducts, total: sampleProducts.length, discountedTotal: 1200 });
}

export function getCustomers() {
  return Promise.resolve({ users: sampleUsers, total: sampleUsers.length });
}

export function getComments() {
  return Promise.resolve({ comments: sampleComments });
}

export function getRevenue() {
  // sample carts for chart
  const carts = [
    { userId: 1, discountedTotal: 300 },
    { userId: 2, discountedTotal: 450 },
    { userId: 3, discountedTotal: 150 },
  ];
  return Promise.resolve({ carts });
}

// Default export (optional)
const api = {
  getInventory,
  getOrders,
  getCustomers,
  getComments,
  getRevenue,
};

export default api;

// --- LocalStorage helpers to persist admin changes and merge with remote data ---
const LOCAL_PRODUCTS_KEY = "local_products";
const DELETED_REMOTE_IDS_KEY = "deleted_remote_product_ids";

function readLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read local products", e);
    return [];
  }
}

function writeLocalProducts(list) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error("Failed to write local products", e);
  }
}

function readDeletedRemoteIds() {
  try {
    const raw = localStorage.getItem(DELETED_REMOTE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read deleted remote ids", e);
    return [];
  }
}

function writeDeletedRemoteIds(list) {
  try {
    localStorage.setItem(DELETED_REMOTE_IDS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error("Failed to write deleted remote ids", e);
  }
}

export async function getMergedProducts({ category = null } = {}) {
  // Try to fetch real remote products; fallback to sampleProducts
  let remote = [];
  try {
    const res = await fetch("https://dummyjson.com/products?limit=0");
    if (res.ok) {
      const data = await res.json();
      remote = data.products || [];
    } else {
      remote = sampleProducts.slice();
    }
  } catch (e) {
    console.warn("Failed to fetch remote products, using sample: ", e);
    remote = sampleProducts.slice();
  }

  // Normalize remote items to the inventory shape (price in VNĐ)
  const normalizedRemote = remote.map((p) => ({
    id: p.id,
    title: p.title,
    title_en: p.title,
    price: (p.price || 0) * 23500,
    discountedPrice: p.discountedPrice ? p.discountedPrice * 23500 : (p.price || 0) * 23500,
    quantity: 1,
    total: (p.price || 0) * 23500,
    thumbnail: p.thumbnail || p.images?.[0] || "",
    rating: p.rating || 0,
    stock: p.stock || 0,
    brand: p.brand || "",
    category: p.category || "",
    discountPercentage: p.discountPercentage || 0,
    _isLocal: false,
  }));

  // Read local products and deleted remote ids
  const local = readLocalProducts();
  const deletedRemote = readDeletedRemoteIds();

  // Filter out remote products that admin deleted (soft-delete stored locally)
  const filteredRemote = normalizedRemote.filter((r) => !deletedRemote.includes(r.id));

  // Optionally filter by category
  let merged = [...local, ...filteredRemote];
  if (category) {
    merged = merged.filter((p) => (p.category || "").toLowerCase() === category.toLowerCase());
  }

  // Sort: local products first (so admin-added appear on top)
  merged.sort((a, b) => {
    if (a._isLocal && !b._isLocal) return -1;
    if (!a._isLocal && b._isLocal) return 1;
    return b.id - a.id; // recent first
  });

  return merged;
}

export function saveLocalProduct(product) {
  const list = readLocalProducts();
  const now = Date.now();
  const newProduct = { ...product, id: product.id || now, title_en: product.title, _isLocal: true };
  list.unshift(newProduct);
  writeLocalProducts(list);
  return newProduct;
}

export function updateLocalProduct(product) {
  const list = readLocalProducts();
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...product, _isLocal: true };
    writeLocalProducts(list);
    return list[idx];
  }
  // If not local, treat as an override: save as a local copy with same id
  const copied = { ...product, _isLocal: true };
  list.unshift(copied);
  writeLocalProducts(list);
  return copied;
}

export function removeLocalProduct(id) {
  // If product exists in local list -> remove it. Otherwise treat as remote delete (soft-delete)
  let local = readLocalProducts();
  const idx = local.findIndex((p) => p.id === id);
  if (idx !== -1) {
    local.splice(idx, 1);
    writeLocalProducts(local);
    return true;
  }

  // Soft-delete remote id
  const deleted = readDeletedRemoteIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    writeDeletedRemoteIds(deleted);
  }
  return true;
}

// ------------------ Support Tickets (Contact -> Admin) ------------------
const SUPPORT_TICKETS_KEY = 'support_tickets';

function readStoredSupportTickets() {
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read support tickets', e);
    return [];
  }
}

function writeStoredSupportTickets(list) {
  try {
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Failed to write support tickets', e);
  }
}

export function getStoredSupportTickets() {
  return readStoredSupportTickets();
}

export function saveSupportTicket(payload) {
  try {
    const list = readStoredSupportTickets();
    const idNum = 1000 + (list.length || 0) + 1;
    const now = Date.now();
    const newTicket = {
      key: `${now}`,
      id: `#${idNum}`,
      title: payload.title || `Contact from ${payload.customer || 'Guest'}`,
      status: 'Mới',
      priority: payload.priority || 'TRUNG BÌNH',
      customer: payload.customer || (payload.name || 'Guest'),
      assigned: payload.assigned || 'Chưa gán',
      updated: now,
      source: payload.source || 'Contact Form',
      SLA_due: now + (payload.priority === 'CAO' ? 2 * 3600000 : payload.priority === 'TRUNG BÌNH' ? 6 * 3600000 : 24 * 3600000),
      description: payload.description || payload.message || '',
      contactEmail: payload.email || '',
      contactPhone: payload.phone || '',
      _isLocal: true,
    };

    list.unshift(newTicket);
    writeStoredSupportTickets(list);

    try { window.dispatchEvent(new Event('support_tickets_updated')); } catch (e) {}
    return newTicket;
  } catch (e) {
    console.error('Failed to save support ticket', e);
    return null;
  }
}

export function updateSupportTicket(id, changes = {}) {
  try {
    const list = readStoredSupportTickets();
    const idx = list.findIndex((t) => t.key === id || t.id === id || `${t.id}` === `${id}` || `${t.key}` === `${id}`);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...changes, updated: Date.now() };
    list[idx] = updated;
    writeStoredSupportTickets(list);
    try { window.dispatchEvent(new Event('support_tickets_updated')); } catch (e) {}
    return updated;
  } catch (e) {
    console.error('Failed to update support ticket', e);
    return null;
  }
}

// Staffs helper (reads same storage used by Staffs page)
export function getStoredStaffs() {
  try {
    const raw = localStorage.getItem('app_staffs_v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read stored staffs', e);
    return [];
  }
}

// ------------------ Orders persistence ------------------
const STORED_ORDERS_KEY = 'app_orders_v1';

function readStoredOrders() {
  try {
    const raw = localStorage.getItem(STORED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read stored orders', e);
    return [];
  }
}

function writeStoredOrders(list) {
  try {
    localStorage.setItem(STORED_ORDERS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Failed to write stored orders', e);
  }
}

export function getStoredOrders() {
  return readStoredOrders();
}

export function saveOrder(payload) {
  try {
    const list = readStoredOrders();
    const now = Date.now();
    const newOrder = {
      id: `ORD-${now}`,
      key: `ORD-${now}`,
      items: payload.items || [],
      totals: payload.totals || {},
      delivery: payload.delivery || {},
      customer: payload.customer || { name: 'Guest', email: '' },
      status: payload.status || 'processing',
      createdAt: now,
      _isLocal: true,
    };
    list.unshift(newOrder);
    writeStoredOrders(list);
    try { window.dispatchEvent(new Event('orders_updated')); } catch (e) {}
    return newOrder;
  } catch (e) {
    console.error('Failed to save order', e);
    return null;
  }
}
