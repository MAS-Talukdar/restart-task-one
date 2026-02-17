const API_BASE = "https://fakestoreapi.com";
let productsCache = [];
let cart = JSON.parse(localStorage.getItem("swiftcart_cart")) || [];

// --- NAVIGATION ---
function handleLogoClick() {
  document.getElementById("nav-home").classList.add("active");
  document.getElementById("nav-products").classList.remove("active");

  document.getElementById("hero-section").classList.remove("hidden");
  document.getElementById("features-section").classList.remove("hidden");
  document.getElementById("category-container").classList.add("hidden");
  document.getElementById("section-title").textContent = "Trending Now";

  loadTrending();
  window.scrollTo(0, 0);
}

function triggerNavProducts() {
  document.getElementById("nav-home").classList.remove("active");
  document.getElementById("nav-products").classList.add("active");

  document.getElementById("hero-section").classList.add("hidden");
  document.getElementById("features-section").classList.add("hidden");
  document.getElementById("category-container").classList.remove("hidden");
  document.getElementById("section-title").textContent = "Our Products";

  loadAllProducts();
  window.scrollTo(0, 0);
}

// --- DATA LOADING ---
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/products/categories`);
    const categories = await response.json();
    const container = document.getElementById("category-container");

    let html = `<button onclick="loadAllProducts()" class="category-btn active px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" data-category="All">All</button>`;

    categories.forEach((cat) => {
      html += `
                        <button onclick="loadByCategory('${cat.replace(/'/g, "\\'")}')" class="category-btn bg-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" data-category="${cat}">
                            ${cat}
                        </button>
                    `;
    });
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadTrending() {
  renderLoading();
  try {
    const response = await fetch(`${API_BASE}/products?limit=4`);
    const products = await response.json();
    productsCache = products;
    renderProducts(products);
  } catch (error) {
    console.error("Error loading trending products:", error);
    renderError();
  }
}

async function loadAllProducts() {
  renderLoading();
  setActiveCategory("All");
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();
    productsCache = products;
    renderProducts(products);
  } catch (error) {
    console.error("Error loading all products:", error);
    renderError();
  }
}

async function loadByCategory(category) {
  renderLoading();
  setActiveCategory(category);
  try {
    const response = await fetch(
      `${API_BASE}/products/category/${encodeURIComponent(category)}`,
    );
    const products = await response.json();
    productsCache = products;
    renderProducts(products);
  } catch (error) {
    console.error("Error loading category products:", error);
    renderError();
  }
}

// --- RENDERERS ---
function renderLoading() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    grid.innerHTML += `
                    <div class="animate-pulse bg-gray-50 rounded-lg p-5 h-96">
                        <div class="bg-gray-200 h-48 rounded-md mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                `;
  }
}

function renderError() {
  document.getElementById("product-grid").innerHTML = `
                <div class="col-span-full text-center py-20 text-red-500">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i>
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
}

function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  if (products.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No products found.</div>`;
    return;
  }
  grid.innerHTML = products
    .map(
      (product) => `
                <div class="product-card bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full animate-fade-in">
                    <div class="relative h-64 bg-[#f9fafb] p-8 flex items-center justify-center">
                        <img src="${product.image}" class="max-h-full max-w-full object-contain mix-blend-multiply" alt="${product.title}">
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">${product.category}</span>
                            <div class="flex items-center text-yellow-500 text-xs">
                                <i class="fa-solid fa-star mr-1"></i>
                                <span class="text-gray-600 font-medium">${product.rating.rate} (${product.rating.count})</span>
                            </div>
                        </div>
                        <h3 class="font-bold text-gray-900 text-sm line-clamp-2 mb-2 h-10">${product.title}</h3>
                        <p class="text-lg font-bold text-gray-900 mb-6">$${product.price.toFixed(2)}</p>
                        <div class="grid grid-cols-2 gap-2 mt-auto">
                            <button onclick="showProductDetail(${product.id})" class="border border-gray-200 text-gray-600 py-2 rounded text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors flex items-center justify-center"><i class="fa-regular fa-eye mr-2"></i>Details</button>
                            <button onclick="addToCart(${product.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-[10px] font-bold uppercase flex items-center justify-center"><i class="fa-solid fa-cart-shopping mr-2"></i>Add</button>
                        </div>
                    </div>
                </div>
            `,
    )
    .join("");
}

// --- PRODUCT MODAL ---
async function showProductDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const product = await response.json();
    const modal = document.getElementById("product-modal");
    const content = document.getElementById("modal-content");
    content.innerHTML = `
                    <div class="md:flex">
                        <div class="md:w-1/2 p-12 bg-gray-50 flex items-center justify-center">
                            <img src="${product.image}" class="max-h-[400px] object-contain mix-blend-multiply" alt="${product.title}">
                        </div>
                        <div class="md:w-1/2 p-10 flex flex-col">
                            <div class="flex justify-between items-start mb-6">
                                <span class="text-indigo-600 font-bold uppercase text-xs tracking-widest">${product.category}</span>
                                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-2xl"></i></button>
                            </div>
                            <h2 class="text-3xl font-bold mb-4 text-gray-900 leading-tight">${product.title}</h2>
                            <div class="flex items-center mb-6 text-yellow-500">
                                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-regular fa-star"></i>
                                <span class="ml-2 text-gray-500 text-sm">(${product.rating.count} reviews)</span>
                            </div>
                            <p class="text-gray-600 mb-8 leading-relaxed text-sm h-32 overflow-y-auto">${product.description}</p>
                            <div class="mt-auto flex justify-between items-center pt-8 border-t border-gray-100">
                                <span class="text-3xl font-bold text-gray-900">$${product.price.toFixed(2)}</span>
                                <button onclick="addToCart(${product.id}); closeModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg transition-all">Add To Cart</button>
                            </div>
                        </div>
                    </div>
                `;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error showing product details:", error);
  }
}

function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// --- CART LOGIC ---
function toggleCart(open) {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (open) {
    sidebar.classList.remove("translate-x-full");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    renderCart();
  } else {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

function addToCart(productId) {
  const product = productsCache.find((p) => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex((item) => item.id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateBadge();

  // Visual feedback on the button if we wanted, but for now we just toggle cart
  toggleCart(true);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateBadge();
  renderCart();
}

function updateQuantity(productId, delta) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index === -1) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateBadge();
    renderCart();
  }
}

function saveCart() {
  localStorage.setItem("swiftcart_cart", JSON.stringify(cart));
}

function updateBadge() {
  const badge = document.getElementById("cart-badge");
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  const totalEl = document.getElementById("cart-total");

  if (cart.length === 0) {
    container.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-64 text-gray-400">
                        <i class="fa-solid fa-cart-plus text-5xl mb-4 opacity-20"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
    totalEl.textContent = "$0.00";
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      return `
                    <div class="flex gap-4 border-b border-gray-100 pb-4">
                        <div class="w-20 h-20 bg-gray-50 p-2 rounded flex-shrink-0">
                            <img src="${item.image}" class="w-full h-full object-contain mix-blend-multiply">
                        </div>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${item.title}</h4>
                                <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-trash-can text-xs"></i></button>
                            </div>
                            <p class="text-xs text-indigo-600 font-bold mb-2">$${item.price.toFixed(2)}</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center border rounded-lg">
                                    <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-1 hover:bg-gray-100 text-gray-500">-</button>
                                    <span class="px-3 text-sm font-medium">${item.quantity}</span>
                                    <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-1 hover:bg-gray-100 text-gray-500">+</button>
                                </div>
                                <span class="text-sm font-bold text-gray-900">$${itemTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `;
    })
    .join("");

  totalEl.textContent = `$${total.toFixed(2)}`;
}

// --- CATEGORY UI ---
function setActiveCategory(category) {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    if (btn.getAttribute("data-category") === category) {
      btn.classList.add("active");
      btn.classList.remove("bg-white");
    } else {
      btn.classList.remove("active");
      btn.classList.add("bg-white");
    }
  });
}

// --- INIT ---
window.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadTrending();
  updateBadge();
  document.getElementById("year").textContent = new Date().getFullYear();
});
